import type { Request, Response } from 'express';
import { cambiarPasswordPropia, loginUser } from './identity.service';
import { ipDe, responderError } from './responder';

/** POST /api/identity/login  body: { credential, password } → { token, debe_cambiar } */
export async function login(req: Request, res: Response) {
  const { credential, password } = (req.body ?? {}) as { credential?: unknown; password?: unknown };

  if (typeof credential !== 'string' || !credential.trim() || typeof password !== 'string' || !password) {
    res.status(400).json({ error: 'Ingresa tu usuario o correo y tu contraseña' });
    return;
  }

  try {
    res.json(await loginUser(credential.trim(), password, ipDe(req)));
  } catch (err) {
    responderError(res, err, 'login');
  }
}

/**
 * POST /api/identity/password/cambiar  body: { password_actual, password_nueva }
 * → { token, debe_cambiar: false } (the new token replaces the old one)
 */
export async function cambiarPassword(req: Request, res: Response) {
  const { password_actual: actual, password_nueva: nueva } = (req.body ?? {}) as {
    password_actual?: unknown;
    password_nueva?: unknown;
  };

  if (typeof actual !== 'string' || !actual || typeof nueva !== 'string' || !nueva) {
    res.status(400).json({ error: 'Ingresa tu contraseña actual y la nueva' });
    return;
  }

  try {
    res.json(await cambiarPasswordPropia(req.usuario!.userId, actual, nueva, ipDe(req)));
  } catch (err) {
    responderError(res, err, 'cambio de contraseña');
  }
}
