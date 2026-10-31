import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';
import { fake } from '../../domains/identity/tests/fakeRepositorio';

/*
 * Permissions of the user administration (ADR 0007), through the real
 * routes and middlewares (authenticate, authorize, reauthenticate) with the
 * in-memory repository.
 */

vi.mock('../../domains/identity/identity.repository', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../domains/identity/identity.repository')>();
  const { repositorioFalso } = await vi.importActual<
    typeof import('../../domains/identity/tests/fakeRepositorio')
  >('../../domains/identity/tests/fakeRepositorio');
  return { ...real, ...repositorioFalso };
});

// Test-only values, not real accounts
const CLAVE = 'Turbina-Azul-2026';
const TEMPORAL = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
const app = createApp();

async function tokenDe(username: string) {
  const res = await request(app).post('/api/identity/login').send({ credential: username, password: CLAVE });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

const crear = (token: string, body: object) =>
  request(app).post('/api/identity/usuarios').set('Authorization', `Bearer ${token}`).send(body);

const restablecer = (token: string, usuarioId: string, body: object = { password_actual: CLAVE }) =>
  request(app).post(`/api/identity/usuarios/${usuarioId}/restablecer`).set('Authorization', `Bearer ${token}`).send(body);

const NUEVO = { username: 'luis.gomez', nombre: 'Luis Gómez', email: 'luis.gomez@vertex.demo', rol: 'CONSULTA' };

beforeEach(() => {
  fake.reiniciar();
  fake.agregar({ username: 'admin', password: CLAVE, roles: ['ADMINISTRADOR'] });
  fake.agregar({ username: 'ing.mant', password: CLAVE, roles: ['ING_MANTENIMIENTO'] });
  fake.agregar({ username: 'tec.mec', password: CLAVE, roles: ['TECNICO_MECANICO'] });
  fake.agregar({ username: 'consulta', password: CLAVE, roles: ['CONSULTA'] });
});

describe('autenticación de las rutas de administración', () => {
  it('sin token o con un token inválido responde 401', async () => {
    expect((await request(app).get('/api/identity/usuarios')).status).toBe(401);
    const falso = await request(app).get('/api/identity/usuarios').set('Authorization', 'Bearer no.es.valido');
    expect(falso.status).toBe(401);
  });

  it('el listado no expone hashes y solo lo ven los roles permitidos', async () => {
    const res = await request(app).get('/api/identity/usuarios').set('Authorization', `Bearer ${await tokenDe('admin')}`);
    expect(res.status).toBe(200);
    expect(res.body.usuarios).toHaveLength(4);
    expect(JSON.stringify(res.body)).not.toMatch(/password_hash|\$2[aby]\$/);

    for (const u of ['tec.mec', 'consulta']) {
      const negado = await request(app).get('/api/identity/usuarios').set('Authorization', `Bearer ${await tokenDe(u)}`);
      expect(negado.status).toBe(403);
    }
  });
});

describe('crear usuarios', () => {
  it('ADMINISTRADOR e ING_MANTENIMIENTO crean usuarios con contraseña temporal', async () => {
    for (const [actor, username] of [
      ['admin', 'luis.gomez'],
      ['ing.mant', 'maria.ruiz'],
    ]) {
      const res = await crear(await tokenDe(actor), { ...NUEVO, username, email: null, password_actual: CLAVE });
      expect(res.status).toBe(201);
      expect(res.body.password_temporal).toMatch(TEMPORAL);

      // The new user signs in with it and must change it
      const login = await request(app)
        .post('/api/identity/login')
        .send({ credential: username, password: res.body.password_temporal });
      expect(login.status).toBe(200);
      expect(login.body.debe_cambiar).toBe(true);
    }
    expect(fake.auditoria.filter((a) => a.accion === 'CREAR_USUARIO' && a.resultado === 'EXITO')).toHaveLength(2);
  });

  it('los demás roles no pueden crear usuarios', async () => {
    for (const u of ['tec.mec', 'consulta']) {
      const res = await crear(await tokenDe(u), { ...NUEVO, password_actual: CLAVE });
      expect(res.status).toBe(403);
    }
    expect(fake.porNombre('luis.gomez')).toBeUndefined();
  });

  it('exige reautenticación con la contraseña propia', async () => {
    const token = await tokenDe('admin');
    expect((await crear(token, NUEVO)).status).toBe(400);
    const erronea = await crear(token, { ...NUEVO, password_actual: 'no-es-mi-clave' });
    expect(erronea.status).toBe(403);
    expect(erronea.body.error).toBe('La contraseña actual no es correcta.');
    expect(fake.porNombre('luis.gomez')).toBeUndefined();
    expect(fake.auditoria.some((a) => a.accion === 'REAUTENTICAR' && a.resultado === 'FALLO')).toBe(true);
  });

  it('ING_MANTENIMIENTO no crea administradores', async () => {
    const res = await crear(await tokenDe('ing.mant'), { ...NUEVO, rol: 'ADMINISTRADOR', password_actual: CLAVE });
    expect(res.status).toBe(403);
  });

  it('valida los datos y no repite usuarios', async () => {
    const token = await tokenDe('admin');
    expect((await crear(token, { ...NUEVO, username: 'A B', password_actual: CLAVE })).status).toBe(400);
    expect((await crear(token, { ...NUEVO, email: 'sin-arroba', password_actual: CLAVE })).status).toBe(400);
    expect((await crear(token, { ...NUEVO, username: 'consulta', password_actual: CLAVE })).status).toBe(409);
  });
});

describe('restablecer contraseñas', () => {
  it('ADMINISTRADOR e ING_MANTENIMIENTO restablecen; la clave anterior deja de servir', async () => {
    for (const actor of ['admin', 'ing.mant']) {
      fake.reiniciar();
      fake.agregar({ username: 'admin', password: CLAVE, roles: ['ADMINISTRADOR'] });
      fake.agregar({ username: 'ing.mant', password: CLAVE, roles: ['ING_MANTENIMIENTO'] });
      const tec = fake.agregar({ username: 'tec.mec', password: CLAVE, roles: ['TECNICO_MECANICO'] });

      const res = await restablecer(await tokenDe(actor), tec.usuario_id);
      expect(res.status).toBe(200);
      expect(res.body.password_temporal).toMatch(TEMPORAL);

      const vieja = await request(app).post('/api/identity/login').send({ credential: 'tec.mec', password: CLAVE });
      expect(vieja.status).toBe(401);
      const nueva = await request(app)
        .post('/api/identity/login')
        .send({ credential: 'tec.mec', password: res.body.password_temporal });
      expect(nueva.body.debe_cambiar).toBe(true);
    }
  });

  it('los demás roles no restablecen y ING_MANTENIMIENTO no toca administradores', async () => {
    const admin = fake.porNombre('admin')!;
    const consulta = fake.porNombre('consulta')!;
    expect((await restablecer(await tokenDe('tec.mec'), consulta.usuario_id)).status).toBe(403);
    expect((await restablecer(await tokenDe('consulta'), admin.usuario_id)).status).toBe(403);
    expect((await restablecer(await tokenDe('ing.mant'), admin.usuario_id)).status).toBe(403);
  });

  it('exige reautenticación y un usuario existente', async () => {
    const token = await tokenDe('admin');
    const consulta = fake.porNombre('consulta')!;
    expect((await restablecer(token, consulta.usuario_id, {})).status).toBe(400);
    expect((await restablecer(token, consulta.usuario_id, { password_actual: 'no-es-mi-clave' })).status).toBe(403);
    expect((await restablecer(token, '00000000-0000-0000-0000-000000000000')).status).toBe(404);
    expect((await restablecer(token, 'no-es-un-id')).status).toBe(404);
  });
});
