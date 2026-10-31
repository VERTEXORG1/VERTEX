/** Claims of the JWT issued by POST /api/identity/login */
export interface TokenPayload {
  userId: string;
  email: string | null;
  username: string;
  /** Role codes from dbo.Roles (e.g. ADMINISTRADOR); a user may have several */
  rol: string[];
  /** Signed in with a temporary password: only the password change is allowed */
  debe_cambiar: boolean;
}

/** Roles that create users and reset passwords (ADR 0007) */
export const ROLES_ADMIN_USUARIOS = ['ADMINISTRADOR', 'ING_MANTENIMIENTO'] as const;

declare global {
  namespace Express {
    interface Request {
      /** Set by the authenticate middleware */
      usuario?: TokenPayload;
    }
  }
}
