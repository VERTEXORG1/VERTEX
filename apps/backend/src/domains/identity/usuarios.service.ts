import { hashPassword } from './identity.service';
import * as repo from './identity.repository';
import { ReglaError } from './identity.repository';
import type { NuevoUsuario } from './identity.repository';
import { generarPasswordTemporal } from './password-policy';

/*
 * User administration (ADR 0007): no self sign-up; ADMINISTRADOR and
 * ING_MANTENIMIENTO create users and reset passwords. The server generates
 * the temporary password, returns it once and stores only its hash; the
 * user must change it on the first sign-in. The procedures check the roles
 * again and audit every action.
 */

const USERNAME = /^[a-z0-9._-]{3,50}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const listarUsuarios = repo.listarUsuarios;
export const listarRoles = repo.listarRoles;

/** Request body → NuevoUsuario, or ReglaError(400) with the first problem */
export function leerNuevoUsuario(body: unknown): NuevoUsuario {
  const b = (body ?? {}) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const username = texto(b.username).toLowerCase();
  const nombre = texto(b.nombre);
  const email = texto(b.email).toLowerCase() || null;
  const rol = texto(b.rol);

  if (!USERNAME.test(username)) {
    throw new ReglaError(400, 'El usuario debe tener de 3 a 50 caracteres: letras minúsculas, números, punto, guion o guion bajo.');
  }
  if (!nombre || nombre.length > 100) throw new ReglaError(400, 'El nombre es obligatorio (máximo 100 caracteres).');
  if (email && (email.length > 150 || !EMAIL.test(email))) throw new ReglaError(400, 'El correo no es válido.');
  if (!rol) throw new ReglaError(400, 'Elige un rol.');
  return { username, nombre, email, rol };
}

/** Creates the user with a temporary password, returned only here */
export async function crearUsuario(actorId: string, datos: NuevoUsuario, ip: string | null) {
  const passwordTemporal = generarPasswordTemporal();
  const usuarioId = await repo.crearUsuario(actorId, datos, await hashPassword(passwordTemporal), ip);
  return { usuario_id: usuarioId, username: datos.username, password_temporal: passwordTemporal };
}

/** Gives another user a new temporary password, returned only here */
export async function restablecerPassword(actorId: string, usuarioId: string, ip: string | null) {
  const passwordTemporal = generarPasswordTemporal();
  await repo.restablecerPassword(actorId, usuarioId, await hashPassword(passwordTemporal), ip);
  return { usuario_id: usuarioId, password_temporal: passwordTemporal };
}
