import type { NextFunction, Request, Response } from 'express';

/**
 * After authenticate: lets through users with at least one of the roles
 * (codes of dbo.Roles); 403 otherwise. The procedures check the roles again
 * against the database.
 */
export function authorize(...roles: readonly string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario?.rol.some((r) => roles.includes(r))) {
      res.status(403).json({ error: 'No tienes permiso para esta acción.' });
      return;
    }
    next();
  };
}
