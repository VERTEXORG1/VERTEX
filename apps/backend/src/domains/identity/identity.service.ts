import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repo from './identity.repository';
import type { AccionIntento, UsuarioLogin } from './identity.repository';
import { BCRYPT_ROUNDS, validarPassword } from './password-policy';
import type { TokenPayload } from './types/auth.types';

/** Unknown user, wrong password, inactive or locked user, or no usable hash */
export class AuthError extends Error {
  readonly status = 401;

  constructor() {
    super('Credenciales inválidas');
    this.name = 'AuthError';
  }
}

/**
 * 5+ failures from the caller's IP in the last 15 minutes (429). It depends
 * on the IP only, so it reveals nothing about which users exist.
 */
export class BloqueoError extends Error {
  readonly status = 429;

  constructor() {
    super('Demasiados intentos fallidos. Espera 15 minutos o contacta al administrador.');
    this.name = 'BloqueoError';
  }
}

/** Wrong current password when confirming it (re-authentication, change) */
export class PasswordActualError extends Error {
  readonly status = 403;

  constructor() {
    super('La contraseña actual no es correcta.');
    this.name = 'PasswordActualError';
  }
}

/** New password rejected by the policy (400) */
export class PoliticaError extends Error {
  readonly status = 400;
}

// Compared against when the user does not exist, with the same cost as the
// real hashes, so a missing user takes as long as a wrong password (no user
// enumeration by response time)
const DUMMY_HASH = bcrypt.hashSync('vertex-dummy-password', BCRYPT_ROUNDS);

export interface Sesion {
  token: string;
  debe_cambiar: boolean;
}

function firmarToken(usuario: UsuarioLogin, debeCambiar: boolean): Sesion {
  const payload: TokenPayload = {
    userId: usuario.usuario_id,
    email: usuario.email,
    username: usuario.username,
    rol: usuario.roles,
    debe_cambiar: debeCambiar,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'],
  });
  return { token, debe_cambiar: debeCambiar };
}

/**
 * Compares the password with the user's bcrypt hash; always runs bcrypt
 * (dummy hash when there is no user or no bcrypt hash).
 */
async function comparar(password: string, usuario: UsuarioLogin | null): Promise<boolean> {
  // bcrypt only: argon2 hashes (also allowed by the table) never match here
  const hash = usuario?.password_hash.startsWith('$2') ? usuario.password_hash : DUMMY_HASH;
  const valid = await bcrypt.compare(password, hash);
  return !!usuario && hash !== DUMMY_HASH && valid;
}

/**
 * Checks a credential (email or username) + password against the active
 * users and returns a signed JWT with { userId, email, username, rol,
 * debe_cambiar }. Every attempt is audited by sp_vx_login_registrar_resultado,
 * which also locks a user for 15 minutes after 5 failures.
 * Throws BloqueoError (429) when the IP is locked and AuthError (401) for any
 * other refusal, a locked user included: the answer never tells whether the
 * user exists.
 */
export async function loginUser(credential: string, password: string, ip: string | null): Promise<Sesion> {
  const { ipBloqueada, usuario } = await repo.obtenerUsuario({ credencial: credential }, ip);
  const valid = await comparar(password, usuario);
  const usuarioId = usuario?.usuario_id ?? null;

  if (ipBloqueada || usuario?.bloqueado) {
    await repo.registrarIntento({
      usuarioId,
      resultado: 'DENEGADO',
      accion: 'LOGIN',
      ip,
      motivo: ipBloqueada ? 'IP bloqueada por intentos fallidos.' : 'Usuario bloqueado por intentos fallidos.',
    });
    if (ipBloqueada) throw new BloqueoError();
    throw new AuthError();
  }

  if (!usuario || !valid) {
    await repo.registrarIntento({
      usuarioId,
      resultado: 'FALLO',
      accion: 'LOGIN',
      ip,
      motivo: usuario ? 'Contraseña incorrecta.' : 'Credencial sin usuario activo.',
    });
    throw new AuthError();
  }

  await repo.registrarIntento({ usuarioId, resultado: 'EXITO', accion: 'LOGIN', ip, motivo: 'Inicio de sesión.' });
  return firmarToken(usuario, usuario.debe_cambiar_password);
}

/**
 * The signed-in user confirms their own password (re-authentication before
 * an admin action, or the current password of a change). A failure counts
 * towards the lockout like a failed login. Returns the user's data.
 */
export async function verificarPasswordPropia(
  usuarioId: string,
  password: string,
  ip: string | null,
  accion: Exclude<AccionIntento, 'LOGIN'>,
): Promise<UsuarioLogin> {
  const { ipBloqueada, usuario } = await repo.obtenerUsuario({ usuarioId }, ip);
  const valid = await comparar(password, usuario);

  if (!usuario) throw new AuthError();
  if (ipBloqueada || usuario.bloqueado) {
    await repo.registrarIntento({ usuarioId, resultado: 'DENEGADO', accion, ip, motivo: 'Bloqueo por intentos fallidos.' });
    throw new BloqueoError();
  }
  if (!valid) {
    await repo.registrarIntento({ usuarioId, resultado: 'FALLO', accion, ip, motivo: 'Contraseña actual incorrecta.' });
    throw new PasswordActualError();
  }
  await repo.registrarIntento({ usuarioId, resultado: 'EXITO', accion, ip, motivo: 'Contraseña confirmada.' });
  return usuario;
}

/** bcrypt hash of a password that already passed the policy */
export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

/**
 * The signed-in user changes their own password (mandatory after a
 * temporary one): checks the current password and the policy, stores the
 * new hash with sp_vx_password_cambiar and returns a new token without
 * debe_cambiar.
 */
export async function cambiarPasswordPropia(
  usuarioId: string,
  actual: string,
  nueva: string,
  ip: string | null,
): Promise<Sesion> {
  const usuario = await verificarPasswordPropia(usuarioId, actual, ip, 'CAMBIAR_PASSWORD');

  const regla = validarPassword(nueva, usuario);
  if (regla) throw new PoliticaError(regla);
  if (await bcrypt.compare(nueva, usuario.password_hash)) {
    throw new PoliticaError('La nueva contraseña debe ser distinta de la actual.');
  }

  await repo.cambiarPassword(usuarioId, await hashPassword(nueva), ip);
  return firmarToken(usuario, false);
}
