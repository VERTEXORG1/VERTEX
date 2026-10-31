import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../../app';
import { generarPasswordTemporal, validarPassword } from '../password-policy';
import type { TokenPayload } from '../types/auth.types';
import { fake } from './fakeRepositorio';

vi.mock('../identity.repository', async (importOriginal) => {
  const real = await importOriginal<typeof import('../identity.repository')>();
  const { repositorioFalso } = await vi.importActual<typeof import('./fakeRepositorio')>('./fakeRepositorio');
  return { ...real, ...repositorioFalso };
});

// Test-only values, not real accounts
const CLAVE = 'Turbina-Azul-2026';
const app = createApp();

const login = (credential: string, password: string) =>
  request(app).post('/api/identity/login').send({ credential, password });

beforeEach(() => {
  fake.reiniciar();
  fake.agregar({ username: 'operador', password: CLAVE, roles: ['CONSULTA'] });
});

describe('POST /api/identity/login', () => {
  it('entra con usuario o correo y devuelve el token con sus datos', async () => {
    for (const credential of ['operador', 'operador@vertex.demo']) {
      const res = await login(credential, CLAVE);
      expect(res.status).toBe(200);
      expect(res.body.debe_cambiar).toBe(false);
      const payload = jwt.decode(res.body.token) as TokenPayload;
      expect(payload).toMatchObject({ username: 'operador', rol: ['CONSULTA'], debe_cambiar: false });
    }
    expect(fake.porNombre('operador')!.ultimo_acceso).toBeInstanceOf(Date);
    expect(fake.auditoria.filter((a) => a.accion === 'LOGIN' && a.resultado === 'EXITO')).toHaveLength(2);
  });

  it('responde lo mismo a una contraseña errónea y a un usuario inexistente', async () => {
    const erronea = await login('operador', 'otra-clave-cualquiera');
    const inexistente = await login('nadie.existe', 'otra-clave-cualquiera');
    expect(erronea.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(erronea.body).toEqual(inexistente.body);
    expect(erronea.body).toEqual({ error: 'Credenciales inválidas' });
    // Both failures are audited, the unknown one without a user
    expect(fake.auditoria.map((a) => [a.resultado, a.usuarioId !== null])).toEqual([
      ['FALLO', true],
      ['FALLO', false],
    ]);
  });

  it('pide usuario y contraseña', async () => {
    const res = await login('', '');
    expect(res.status).toBe(400);
  });
});

describe('bloqueo tras 5 intentos fallidos', () => {
  it('bloquea la IP 15 minutos: luego ni la contraseña correcta entra', async () => {
    for (let i = 0; i < 5; i++) expect((await login('operador', 'clave-equivocada')).status).toBe(401);

    const bloqueado = await login('operador', CLAVE);
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toMatch(/Demasiados intentos fallidos/);
    // The lock does not depend on the user: any credential gets the same answer
    expect((await login('nadie.existe', 'x')).body).toEqual(bloqueado.body);

    fake.reloj += 15 * 60 * 1000 + 1;
    expect((await login('operador', CLAVE)).status).toBe(200);
  });

  it('bloquea al usuario tras 5 fallos desde otras IP, sin revelar que existe', async () => {
    const id = fake.porNombre('operador')!.usuario_id;
    for (let i = 0; i < 5; i++) {
      await fake.registrarIntento({ usuarioId: id, resultado: 'FALLO', accion: 'LOGIN', ip: `203.0.113.${i}`, motivo: '' });
    }

    const res = await login('operador', CLAVE);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas' });

    fake.reloj += 15 * 60 * 1000 + 1;
    expect((await login('operador', CLAVE)).status).toBe(200);
  });
});

describe('cambio obligatorio de contraseña', () => {
  const TEMPORAL = 'Abcd-Efgh-Jkmn';

  beforeEach(() => {
    fake.agregar({ username: 'nuevo.tecnico', password: TEMPORAL, roles: ['ADMINISTRADOR'], debeCambiar: true });
  });

  it('con contraseña temporal el login avisa y el token solo sirve para cambiarla', async () => {
    const res = await login('nuevo.tecnico', TEMPORAL);
    expect(res.status).toBe(200);
    expect(res.body.debe_cambiar).toBe(true);

    const otraRuta = await request(app).get('/api/identity/usuarios').set('Authorization', `Bearer ${res.body.token}`);
    expect(otraRuta.status).toBe(403);
    expect(otraRuta.body.debe_cambiar).toBe(true);
  });

  it('aplica la política y deja un token sin cambio pendiente', async () => {
    const { token } = (await login('nuevo.tecnico', TEMPORAL)).body;
    const cambiar = (actual: string, nueva: string) =>
      request(app)
        .post('/api/identity/password/cambiar')
        .set('Authorization', `Bearer ${token}`)
        .send({ password_actual: actual, password_nueva: nueva });

    expect((await cambiar(TEMPORAL, 'corta')).body.error).toMatch(/al menos 10/);
    expect((await cambiar(TEMPORAL, 'xx-nuevo.tecnico-xx')).body.error).toMatch(/usuario ni tu correo/);
    expect((await cambiar(TEMPORAL, 'Password123')).body.error).toMatch(/muy común/);
    expect((await cambiar('no-es-la-actual', 'Rodamiento-Firme-88')).status).toBe(403);

    const ok = await cambiar(TEMPORAL, 'Rodamiento-Firme-88');
    expect(ok.status).toBe(200);
    expect(ok.body.debe_cambiar).toBe(false);
    expect((jwt.decode(ok.body.token) as TokenPayload).debe_cambiar).toBe(false);

    expect((await login('nuevo.tecnico', TEMPORAL)).status).toBe(401);
    const nuevo = await login('nuevo.tecnico', 'Rodamiento-Firme-88');
    expect(nuevo.status).toBe(200);
    expect(nuevo.body.debe_cambiar).toBe(false);
    expect(fake.auditoria.some((a) => a.accion === 'CAMBIAR_PASSWORD' && a.resultado === 'EXITO')).toBe(true);
  });

  it('exige sesión', async () => {
    const res = await request(app).post('/api/identity/password/cambiar').send({ password_actual: 'a', password_nueva: 'b' });
    expect(res.status).toBe(401);
  });
});

describe('política de contraseña', () => {
  const usuario = { username: 'ana.perez', email: 'ana.perez@vertex.demo' };

  it('acepta una contraseña larga y propia', () => {
    expect(validarPassword('Compresor-Silencioso-7', usuario)).toBeNull();
  });

  it('rechaza corta, con el usuario o el correo, común o de más de 72 bytes', () => {
    expect(validarPassword('Corta-1', usuario)).toMatch(/al menos 10/);
    expect(validarPassword('ANA.PEREZ-2026', usuario)).toMatch(/usuario ni tu correo/);
    expect(validarPassword('1234567890', usuario)).toMatch(/muy común/);
    expect(validarPassword('ñ'.repeat(40), usuario)).toMatch(/demasiado larga/);
  });

  it('genera contraseñas temporales XXXX-XXXX-XXXX distintas', () => {
    const a = generarPasswordTemporal();
    expect(a).toMatch(/^[A-HJ-NP-Za-km-z2-9]{4}-[A-HJ-NP-Za-km-z2-9]{4}-[A-HJ-NP-Za-km-z2-9]{4}$/);
    expect(generarPasswordTemporal()).not.toBe(a);
  });
});
