import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { DbUnavailableError } from '../equipos/equipos.service';
import * as repositorio from './captura.repository';
import type { RegistroLote } from './captura.repository';

/*
 * POST /api/captura/lotes: batch of readings from a capture device (ESP32).
 *
 *   X-Dispositivo: ESP32-CERO011-01
 *   Authorization: Bearer <device key>
 *   [{ "equipo": "CERO-011", "seq": 5, "event_time": "2026-11-24T14:37:00Z",
 *      "lecturas": { "CORRIENTE_MOTOR": 0, "TEMPERATURA_MOT": 31.5 } }, ...]
 *
 * 200 { recibidas, nuevas, duplicadas, rechazadas, mediciones }: the device
 * deletes the batch from its memory only on a 2xx. A reading that can never
 * be stored (bad time, unknown variable) is "rechazada" but still answers 200,
 * otherwise the device would resend it forever and block its queue.
 * 400 malformed batch, 401 unknown device or wrong key (same answer for both),
 * 503 database unavailable.
 */

export const MAX_LECTURAS_POR_LOTE = 120;

/** Variable codes the device may send (dbo.Variables) */
export const VARIABLES_CAPTURA = new Set([
  'CORRIENTE_MOTOR',
  'RPM_MOTOR',
  'TEMPERATURA_MOT',
  'VOLTAJE_MOTOR',
  'VIBRACION_MOT',
  'FRECUENCIA_RED',
  'POTENCIA_MOT',
  'ESTADO_MOTOR',
  'NIVEL_BATERIA',
]);

// Readings before this are a RTC that lost its time, not real data
const PRIMERA_FECHA_VALIDA = Date.UTC(2026, 0, 1);
// The device clock may run a little ahead of the server
const MARGEN_FUTURO_MS = 10 * 60 * 1000;
// DECIMAL(18,6) holds up to 10^12
const MAX_VALOR = 1e12;

const EVENT_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const NO_AUTORIZADO = 'Dispositivo no autorizado';
// Compared when the device does not exist, so both cases take the same time
const HASH_FICTICIO = Buffer.alloc(32);

const sha256 = (texto: string) => createHash('sha256').update(texto, 'utf8').digest();

/** Device code from X-Dispositivo and its key, or null when it is not authorized */
async function autenticar(req: Request): Promise<repositorio.CredencialDispositivo | null> {
  const codigo = req.get('x-dispositivo')?.trim() ?? '';
  const auth = req.get('authorization') ?? '';
  const clave = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!codigo || codigo.length > repositorio.MAX_CODIGO_DISPOSITIVO || !clave) return null;

  const credencial = await repositorio.obtenerCredencial(codigo);
  const esperado = credencial?.clave_hash.length === 32 ? credencial.clave_hash : HASH_FICTICIO;
  const coincide = timingSafeEqual(sha256(clave), esperado);
  return credencial && coincide ? credencial : null;
}

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** The reading ready for the procedure, or null when it cannot be stored */
function validarLectura(lectura: Record<string, unknown>, ahora: number): RegistroLote | null {
  const { event_time: eventTime, lecturas } = lectura;
  if (typeof eventTime !== 'string' || !EVENT_TIME.test(eventTime) || !esObjeto(lecturas)) return null;

  const instante = Date.parse(eventTime);
  if (Number.isNaN(instante) || instante < PRIMERA_FECHA_VALIDA || instante > ahora + MARGEN_FUTURO_MS) return null;
  // Rejects dates like 2026-02-30T..., which Date would roll over
  if (!new Date(instante).toISOString().startsWith(eventTime.slice(0, 19))) return null;

  const valores = Object.entries(lecturas);
  if (valores.length === 0) return null;
  for (const [codigo, valor] of valores) {
    if (!VARIABLES_CAPTURA.has(codigo)) return null;
    if (valor !== null && (typeof valor !== 'number' || !Number.isFinite(valor) || Math.abs(valor) >= MAX_VALOR)) {
      return null;
    }
  }
  return {
    record_id: eventTime,
    event_time: new Date(instante).toISOString().slice(0, 23),
    registro: lectura,
  };
}

export async function recibirLote(req: Request, res: Response) {
  try {
    const dispositivo = await autenticar(req);
    if (!dispositivo) {
      res.status(401).json({ error: NO_AUTORIZADO });
      return;
    }

    const lote: unknown = req.body;
    if (!Array.isArray(lote) || lote.length === 0 || lote.length > MAX_LECTURAS_POR_LOTE || !lote.every(esObjeto)) {
      res.status(400).json({ error: `El lote debe ser una lista de 1 a ${MAX_LECTURAS_POR_LOTE} lecturas` });
      return;
    }
    // A device only sends readings of its own CERO
    if (lote.some((l) => l.equipo !== dispositivo.equipo_codigo)) {
      res.status(400).json({ error: `El dispositivo pertenece a ${dispositivo.equipo_codigo}` });
      return;
    }

    const ahora = Date.now();
    const validas = lote.map((l) => validarLectura(l, ahora)).filter((r): r is RegistroLote => r !== null);
    const rechazadas = lote.length - validas.length;

    const resultado =
      validas.length > 0
        ? await repositorio.recibirLote(dispositivo.codigo, validas)
        : { recibidas: 0, nuevas: 0, duplicadas: 0, mediciones: 0 };

    res.json({ ...resultado, recibidas: lote.length, rechazadas });
  } catch (err) {
    if (err instanceof DbUnavailableError) {
      res.status(503).json({ error: err.message });
      return;
    }
    console.error('Error en POST /api/captura/lotes:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
