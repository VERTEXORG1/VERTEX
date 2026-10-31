import { randomInt } from 'node:crypto';

/** bcrypt cost of every stored password (and of the login's dummy hash) */
export const BCRYPT_ROUNDS = 12;

export const MIN_LENGTH = 10;
// bcrypt only uses the first 72 bytes
const MAX_BYTES = 72;

// Short list of common passwords of 10+ characters (lowercase). The frontend
// keeps the same rules in src/modules/auth/passwordPolicy.ts
const COMUNES = new Set([
  '1234567890', '0123456789', '0987654321', '1111111111', '0000000000',
  '12345678910', '123456789a', 'a123456789', '1q2w3e4r5t', 'qwertyuiop',
  'qwerty1234', 'qwerty12345', 'asdfghjkl1', 'password12', 'password123',
  'password1234', 'passw0rd123', 'contraseña', 'contrasena', 'contraseña1',
  'contrasena1', 'contraseña123', 'contrasena123', 'administrador', 'admin12345',
  'admin123456', 'iloveyou12', 'abc1234567', 'abcdefghij', 'bienvenido1',
  'bienvenido123', 'vertex12345', 'vertex123456', 'mantenimiento', 'cambiame123',
]);

export interface DatosUsuario {
  username: string;
  email: string | null;
}

/**
 * First broken rule of the password policy (ADR 0007), or null when the
 * password is acceptable: at least 10 characters (72 bytes at most), not
 * containing the username or the email, and not a common password.
 */
export function validarPassword(password: string, usuario: DatosUsuario): string | null {
  if (password.length < MIN_LENGTH) return `La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`;
  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES) return 'La contraseña es demasiado larga (máximo 72 caracteres).';

  const minuscula = password.toLowerCase();
  const propios = [usuario.username, usuario.email, usuario.email?.split('@')[0]]
    .filter((v): v is string => !!v && v.length >= 3)
    .map((v) => v.toLowerCase());
  if (propios.some((v) => minuscula.includes(v))) return 'La contraseña no puede contener tu usuario ni tu correo.';

  if (COMUNES.has(minuscula)) return 'Esa contraseña es muy común; elige otra.';
  return null;
}

// No 0/O, 1/l/I: the temporary password is read aloud or copied by hand
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

/** Random temporary password XXXX-XXXX-XXXX (~70 bits), shown once */
export function generarPasswordTemporal(): string {
  const grupos: string[] = [];
  for (let g = 0; g < 3; g++) {
    let grupo = '';
    for (let i = 0; i < 4; i++) grupo += ALFABETO[randomInt(ALFABETO.length)];
    grupos.push(grupo);
  }
  return grupos.join('-');
}
