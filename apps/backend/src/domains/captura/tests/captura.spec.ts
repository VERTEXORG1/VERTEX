import { createHash } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../../app';
import { DbUnavailableError } from '../../equipos/equipos.service';
import type { RegistroLote } from '../captura.repository';

// In-memory stand-in for dbo.sp_vx_dispositivo_credencial / sp_vx_captura_lote_recibir
const db = vi.hoisted(() => ({
  dispositivos: new Map<string, { clave_hash: Buffer; equipo_codigo: string }>(),
  guardadas: new Set<string>(),
  llamadas: [] as { dispositivo: string; registros: RegistroLote[] }[],
  caida: false,
}));

vi.mock('../captura.repository', async (importOriginal) => {
  const real = await importOriginal<typeof import('../captura.repository')>();
  return {
    ...real,
    obtenerCredencial: async (codigo: string) => {
      if (db.caida) throw new DbUnavailableError(new Error('sin red'));
      const d = db.dispositivos.get(codigo);
      return d ? { codigo, ...d } : null;
    },
    recibirLote: async (dispositivo: string, registros: RegistroLote[]) => {
      db.llamadas.push({ dispositivo, registros });
      let nuevas = 0;
      let mediciones = 0;
      for (const r of registros) {
        const clave = `${dispositivo}|${r.record_id}`;
        if (db.guardadas.has(clave)) continue;
        db.guardadas.add(clave);
        nuevas++;
        const lecturas = (r.registro as { lecturas: Record<string, number | null> }).lecturas;
        mediciones += Object.values(lecturas).filter((v) => v !== null).length;
      }
      return { recibidas: registros.length, nuevas, duplicadas: registros.length - nuevas, mediciones };
    },
  };
});

// Test-only key, not a real device
const CLAVE = 'clave-de-prueba-del-dispositivo';
const DISPOSITIVO = 'ESP32-CERO011-01';
const app = createApp();

const lectura = (event_time: string, lecturas: Record<string, unknown> = { CORRIENTE_MOTOR: 0, TEMPERATURA_MOT: 31.5 }) => ({
  equipo: 'CERO-011',
  seq: 1,
  event_time,
  lecturas,
});

const enviar = (lote: unknown, clave = CLAVE, dispositivo = DISPOSITIVO) =>
  request(app)
    .post('/api/captura/lotes')
    .set('X-Dispositivo', dispositivo)
    .set('Authorization', `Bearer ${clave}`)
    .send(lote as object);

beforeEach(() => {
  db.dispositivos.clear();
  db.guardadas.clear();
  db.llamadas.length = 0;
  db.caida = false;
  db.dispositivos.set(DISPOSITIVO, {
    clave_hash: createHash('sha256').update(CLAVE).digest(),
    equipo_codigo: 'CERO-011',
  });
});

describe('POST /api/captura/lotes', () => {
  it('guarda el lote y responde cuántas lecturas y mediciones son nuevas', async () => {
    const res = await enviar([lectura('2026-11-24T14:37:00Z'), lectura('2026-11-24T14:38:00Z')]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ recibidas: 2, nuevas: 2, duplicadas: 0, rechazadas: 0, mediciones: 4 });
    expect(db.llamadas[0].registros[0]).toMatchObject({
      record_id: '2026-11-24T14:37:00Z',
      event_time: '2026-11-24T14:37:00.000',
    });
  });

  it('un lote reenviado no duplica nada', async () => {
    const lote = [lectura('2026-11-24T14:37:00Z')];
    await enviar(lote);
    const res = await enviar(lote);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ nuevas: 0, duplicadas: 1, mediciones: 0 });
  });

  it('rechaza la clave errónea y el dispositivo inexistente con la misma respuesta', async () => {
    const lote = [lectura('2026-11-24T14:37:00Z')];
    const erronea = await enviar(lote, 'otra-clave');
    const inexistente = await enviar(lote, CLAVE, 'ESP32-NO-EXISTE');
    const sinCabeceras = await request(app).post('/api/captura/lotes').send(lote);
    for (const res of [erronea, inexistente, sinCabeceras]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Dispositivo no autorizado' });
    }
    expect(db.llamadas).toHaveLength(0);
  });

  it('no acepta lecturas de otro CERO', async () => {
    const res = await enviar([{ ...lectura('2026-11-24T14:37:00Z'), equipo: 'CERO-010' }]);
    expect(res.status).toBe(400);
    expect(db.llamadas).toHaveLength(0);
  });

  it('400 si el lote no es una lista válida', async () => {
    for (const lote of [{}, [], [1], Array.from({ length: 121 }, (_, i) => lectura(`2026-11-24T10:${String(i % 60).padStart(2, '0')}:00Z`))]) {
      expect((await enviar(lote)).status).toBe(400);
    }
  });

  it('cuenta como rechazadas las lecturas imposibles de guardar, sin bloquear las demás', async () => {
    const res = await enviar([
      lectura('2026-11-24T14:37:00Z'),
      lectura('2000-01-01T00:00:00Z'), // RTC sin hora
      lectura('2099-01-01T00:00:00Z'), // futuro
      lectura('2026-02-30T00:00:00Z'), // no existe
      lectura('2026-11-24 14:39:00'), // sin formato ISO
      lectura('2026-11-24T14:40:00Z', { PRESION: 3 }), // variable fuera del catálogo
      lectura('2026-11-24T14:41:00Z', { TEMPERATURA_MOT: 'alta' }),
      lectura('2026-11-24T14:42:00Z', {}),
    ]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ recibidas: 8, nuevas: 1, duplicadas: 0, rechazadas: 7, mediciones: 2 });
  });

  it('un valor null es una variable sin lectura', async () => {
    const res = await enviar([lectura('2026-11-24T14:37:00Z', { CORRIENTE_MOTOR: 0, TEMPERATURA_MOT: null })]);
    expect(res.body).toMatchObject({ nuevas: 1, mediciones: 1 });
  });

  it('503 si la base no responde, para que el dispositivo reintente', async () => {
    db.caida = true;
    const res = await enviar([lectura('2026-11-24T14:37:00Z')]);
    expect(res.status).toBe(503);
  });
});
