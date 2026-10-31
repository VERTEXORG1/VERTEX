import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { TokenPayload } from '../../domains/identity/types/auth.types';

/**
 * Requires a valid "Authorization: Bearer <JWT>" and leaves its claims in
 * req.usuario. A token with debe_cambiar (temporary password) only passes
 * where the password change is allowed.
 */
function crearAuthenticate(permitirCambioPendiente: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Inicia sesión para continuar.' });
      return;
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ['HS256'] }) as TokenPayload;
    } catch {
      res.status(401).json({ error: 'Tu sesión terminó; vuelve a iniciar sesión.' });
      return;
    }
    if (typeof payload?.userId !== 'string' || !Array.isArray(payload.rol)) {
      res.status(401).json({ error: 'Tu sesión terminó; vuelve a iniciar sesión.' });
      return;
    }

    if (payload.debe_cambiar && !permitirCambioPendiente) {
      res.status(403).json({ error: 'Debes cambiar tu contraseña antes de continuar.', debe_cambiar: true });
      return;
    }

    req.usuario = payload;
    next();
  };
}

/** Signed-in user who already changed their temporary password */
export const authenticate = crearAuthenticate(false);

/** Signed-in user, also with a pending password change (the change itself) */
export const authenticateCambioPendiente = crearAuthenticate(true);
