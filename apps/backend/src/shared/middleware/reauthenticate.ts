import type { NextFunction, Request, Response } from 'express';
import { verificarPasswordPropia } from '../../domains/identity/identity.service';
import { ipDe, responderError } from '../../domains/identity/responder';

/**
 * After authenticate: the user confirms their own password in the body
 * (password_actual) before a sensitive action, such as creating a user or
 * resetting a password. A wrong password counts towards the lockout (403,
 * or 429 once locked).
 */
export async function reauthenticate(req: Request, res: Response, next: NextFunction) {
  const password = (req.body as { password_actual?: unknown } | undefined)?.password_actual;
  if (!req.usuario) {
    res.status(401).json({ error: 'Inicia sesión para continuar.' });
    return;
  }
  if (typeof password !== 'string' || !password) {
    res.status(400).json({ error: 'Confirma tu contraseña para continuar.' });
    return;
  }

  try {
    await verificarPasswordPropia(req.usuario.userId, password, ipDe(req), 'REAUTENTICAR');
  } catch (err) {
    responderError(res, err, 'reautenticación');
    return;
  }
  next();
}
