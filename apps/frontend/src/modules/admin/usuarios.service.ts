import { apiFetch } from '../auth/auth.service';

/** Row of GET /api/identity/usuarios (no hashes) */
export interface UsuarioListado {
  usuario_id: string;
  username: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  roles: string[];
  debe_cambiar_password: boolean;
  bloqueado: boolean;
  /** UTC ISO date, null if never signed in */
  ultimo_acceso: string | null;
}

export interface Rol {
  codigo: string;
  nombre: string;
}

export interface NuevoUsuario {
  username: string;
  nombre: string;
  email: string;
  rol: string;
}

/** Temporary password returned by the backend: shown once, never stored */
export interface PasswordTemporal {
  usuario_id: string;
  password_temporal: string;
}

export const listarUsuarios = () =>
  apiFetch<{ usuarios: UsuarioListado[] }>('/api/identity/usuarios').then((r) => r.usuarios);

export const listarRoles = () => apiFetch<{ roles: Rol[] }>('/api/identity/roles').then((r) => r.roles);

/** Needs the admin's own password (re-authentication) */
export const crearUsuario = (datos: NuevoUsuario, passwordActual: string) =>
  apiFetch<PasswordTemporal>('/api/identity/usuarios', {
    method: 'POST',
    body: { ...datos, email: datos.email.trim() || null, password_actual: passwordActual },
  });

/** Needs the admin's own password (re-authentication) */
export const restablecerPassword = (usuarioId: string, passwordActual: string) =>
  apiFetch<PasswordTemporal>(`/api/identity/usuarios/${encodeURIComponent(usuarioId)}/restablecer`, {
    method: 'POST',
    body: { password_actual: passwordActual },
  });
