import type { Request, Response } from 'express';
import { DbUnavailableError } from '../equipos/equipos.service';

/** Caller's address for the lockout and the audit (dbo.Auditoria.ip_origen) */
export function ipDe(req: Request): string | null {
  const ip = req.ip ?? req.socket.remoteAddress;
  return ip ? ip.slice(0, 45) : null;
}

/**
 * Answers an error of the identity routes: 4xx errors (status property)
 * with their message, SQL Server unavailable 503, anything else 500 without
 * details.
 */
export function responderError(res: Response, err: unknown, contexto: string) {
  if (err instanceof DbUnavailableError) {
    res.status(503).json({ error: err.message });
    return;
  }
  const status = (err as { status?: unknown } | null)?.status;
  if (err instanceof Error && typeof status === 'number' && status >= 400 && status < 500) {
    res.status(status).json({ error: err.message });
    return;
  }
  console.error(`Error en ${contexto}:`, err instanceof Error ? err.message : err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
