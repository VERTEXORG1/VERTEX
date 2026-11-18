import { API_URL, ErrorTemporal, errorDeRespuesta } from '../../shared/api';

/** GET /api/equipos/:codigo/bateria: battery of the CERO's capture prototype */
export interface BateriaData {
  /** Latest reading, 0–100 % (null: the prototype has not sent one yet) */
  nivel: number | null;
  /** event_time of that reading, ISO UTC (null: none) */
  event_time: string | null;
  /** Warn at or below this level (ConfiguracionSistema.BATERIA_AVISO_PCT; null: not configured) */
  aviso_pct: number | null;
}

/**
 * Demo mode and, for now, every CERO: no prototype is sending data yet, so
 * the dashboard shows the battery as pending.
 */
export const BATERIA_PENDIENTE: BateriaData = { nivel: null, event_time: null, aviso_pct: 30 };

const NETWORK_ERROR = 'Sin conexión con el servidor';
const GENERIC_ERROR = 'No se pudo consultar la batería';

export async function fetchBateria(codigo: string, signal?: AbortSignal): Promise<BateriaData> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/equipos/${encodeURIComponent(codigo)}/bateria`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ErrorTemporal(NETWORK_ERROR);
  }

  const body = (await res.json().catch(() => null)) as (Partial<BateriaData> & { mensaje?: string }) | null;
  if (!res.ok || !body) throw errorDeRespuesta(res.status, body?.mensaje || GENERIC_ERROR);
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    nivel: num(body.nivel),
    event_time: typeof body.event_time === 'string' ? body.event_time : null,
    aviso_pct: num(body.aviso_pct),
  };
}
