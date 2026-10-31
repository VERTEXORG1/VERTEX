/*
 * Password policy (ADR 0007), checked here to answer at once; the backend
 * checks it again (apps/backend/src/domains/identity/password-policy.ts,
 * same rules and messages).
 */

export const MIN_LENGTH = 10;
// bcrypt only uses the first 72 bytes
const MAX_BYTES = 72;

const COMUNES = new Set([
  '1234567890', '0123456789', '0987654321', '1111111111', '0000000000',
  '12345678910', '123456789a', 'a123456789', '1q2w3e4r5t', 'qwertyuiop',
  'qwerty1234', 'qwerty12345', 'asdfghjkl1', 'password12', 'password123',
  'password1234', 'passw0rd123', 'contraseña', 'contrasena', 'contraseña1',
  'contrasena1', 'contraseña123', 'contrasena123', 'administrador', 'admin12345',
  'admin123456', 'iloveyou12', 'abc1234567', 'abcdefghij', 'bienvenido1',
  'bienvenido123', 'vertex12345', 'vertex123456', 'mantenimiento', 'cambiame123',
]);

/** First broken rule, or null when the password is acceptable */
export function validarPassword(password: string, usuario: { username: string; email: string | null }): string | null {
  if (password.length < MIN_LENGTH) return `La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`;
  if (new TextEncoder().encode(password).length > MAX_BYTES) return 'La contraseña es demasiado larga (máximo 72 caracteres).';

  const minuscula = password.toLowerCase();
  const propios = [usuario.username, usuario.email, usuario.email?.split('@')[0]]
    .filter((v): v is string => !!v && v.length >= 3)
    .map((v) => v.toLowerCase());
  if (propios.some((v) => minuscula.includes(v))) return 'La contraseña no puede contener tu usuario ni tu correo.';

  if (COMUNES.has(minuscula)) return 'Esa contraseña es muy común; elige otra.';
  return null;
}
