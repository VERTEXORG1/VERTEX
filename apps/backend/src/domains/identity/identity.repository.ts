import sql from 'mssql';
import { errorDeBase } from '../equipos/equipos.service';

/*
 * Data access of the identity domain. The rules (lockout, roles allowed to
 * create users or reset passwords, audit) live in the sp_vx_* procedures;
 * Node only hashes and compares passwords with bcrypt. The tests replace
 * this module with an in-memory fake.
 */

export interface UsuarioLogin {
  usuario_id: string;
  username: string;
  nombre: string;
  email: string | null;
  password_hash: string;
  debe_cambiar_password: boolean;
  /** bloqueado_hasta is in the future */
  bloqueado: boolean;
  roles: string[];
}

export interface ResultadoBusqueda {
  /** 5+ failures from this IP in the last 15 minutes */
  ipBloqueada: boolean;
  /** Null when no active user matches (or, oddly, more than one) */
  usuario: UsuarioLogin | null;
}

export type ResultadoIntento = 'EXITO' | 'FALLO' | 'DENEGADO';
export type AccionIntento = 'LOGIN' | 'REAUTENTICAR' | 'CAMBIAR_PASSWORD';

export interface UsuarioListado {
  usuario_id: string;
  username: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  roles: string[];
  debe_cambiar_password: boolean;
  bloqueado: boolean;
  ultimo_acceso: string | null;
  creado_en: string;
}

export interface Rol {
  codigo: string;
  nombre: string;
}

export interface NuevoUsuario {
  username: string;
  nombre: string;
  email: string | null;
  rol: string;
}

/**
 * Error raised by a procedure with THROW 50400 / 50403 / 50404 / 50409 (or a
 * unique key violation, 409): the API answers that status and message.
 */
export class ReglaError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ReglaError';
  }
}

const ESTADO_DE_THROW: Record<number, number> = { 50400: 400, 50403: 403, 50404: 404, 50409: 409 };

/** Database error → DbUnavailableError, ReglaError or the error itself */
function traducir(err: unknown): unknown {
  const base = errorDeBase(err);
  if (base) return base;
  if (err instanceof sql.RequestError) {
    const numero = err.number ?? 0;
    if (ESTADO_DE_THROW[numero]) return new ReglaError(ESTADO_DE_THROW[numero], err.message);
    // UQ_Usuarios_username / UQ_Usuarios_email: two admins at the same time
    if (numero === 2627 || numero === 2601) {
      return new ReglaError(409, 'Ya existe un usuario con ese nombre de usuario o correo.');
    }
  }
  return err;
}

async function ejecutar<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw traducir(err);
  }
}

const roles = (lista: string | null) => (lista ? lista.split(',') : []);

/** dbo.sp_vx_login_obtener_usuario, by credential (email or username) or by id */
export function obtenerUsuario(
  buscar: { credencial: string } | { usuarioId: string },
  ip: string | null,
): Promise<ResultadoBusqueda> {
  return ejecutar(async () => {
    const request = new sql.Request().input('ip_origen', sql.VarChar(45), ip);
    if ('credencial' in buscar) request.input('credencial', sql.NVarChar(150), buscar.credencial);
    else request.input('usuario_id', sql.UniqueIdentifier, buscar.usuarioId);

    const result = await request.execute('dbo.sp_vx_login_obtener_usuario');
    const sets = result.recordsets as unknown as [{ ip_bloqueada: boolean }[], (Omit<UsuarioLogin, 'roles'> & { roles: string | null })[]];
    const filas = sets[1];
    // An email could in theory equal another user's username: refuse rather
    // than pick one of them
    const fila = filas.length === 1 ? filas[0] : undefined;
    return {
      ipBloqueada: !!sets[0][0]?.ip_bloqueada,
      usuario: fila ? { ...fila, roles: roles(fila.roles) } : null,
    };
  });
}

/** dbo.sp_vx_login_registrar_resultado: counters, lockout and audit */
export function registrarIntento(intento: {
  usuarioId: string | null;
  resultado: ResultadoIntento;
  accion: AccionIntento;
  ip: string | null;
  motivo: string;
}): Promise<void> {
  return ejecutar(async () => {
    await new sql.Request()
      .input('usuario_id', sql.UniqueIdentifier, intento.usuarioId)
      .input('resultado', sql.VarChar(20), intento.resultado)
      .input('accion', sql.VarChar(80), intento.accion)
      .input('ip_origen', sql.VarChar(45), intento.ip)
      .input('motivo', sql.NVarChar(200), intento.motivo)
      .execute('dbo.sp_vx_login_registrar_resultado');
  });
}

/** dbo.sp_vx_password_cambiar: the user's own new hash */
export function cambiarPassword(usuarioId: string, hash: string, ip: string | null): Promise<void> {
  return ejecutar(async () => {
    await new sql.Request()
      .input('usuario_id', sql.UniqueIdentifier, usuarioId)
      .input('password_hash', sql.NVarChar(255), hash)
      .input('ip_origen', sql.VarChar(45), ip)
      .execute('dbo.sp_vx_password_cambiar');
  });
}

/** dbo.sp_vx_password_restablecer_admin: temporary hash with a forced change */
export function restablecerPassword(actorId: string, usuarioId: string, hash: string, ip: string | null): Promise<void> {
  return ejecutar(async () => {
    await new sql.Request()
      .input('actor_id', sql.UniqueIdentifier, actorId)
      .input('usuario_id', sql.UniqueIdentifier, usuarioId)
      .input('password_hash', sql.NVarChar(255), hash)
      .input('ip_origen', sql.VarChar(45), ip)
      .execute('dbo.sp_vx_password_restablecer_admin');
  });
}

/** dbo.sp_vx_usuario_crear → the new usuario_id */
export function crearUsuario(actorId: string, datos: NuevoUsuario, hash: string, ip: string | null): Promise<string> {
  return ejecutar(async () => {
    const result = await new sql.Request()
      .input('actor_id', sql.UniqueIdentifier, actorId)
      .input('username', sql.VarChar(50), datos.username)
      .input('nombre', sql.NVarChar(100), datos.nombre)
      .input('email', sql.NVarChar(150), datos.email)
      .input('rol_codigo', sql.VarChar(50), datos.rol)
      .input('password_hash', sql.NVarChar(255), hash)
      .input('ip_origen', sql.VarChar(45), ip)
      .execute<{ usuario_id: string }>('dbo.sp_vx_usuario_crear');
    return result.recordset[0].usuario_id;
  });
}

/** Every user with its roles and state (no hashes), for the admin screen */
export function listarUsuarios(): Promise<UsuarioListado[]> {
  return ejecutar(async () => {
    const result = await new sql.Request().query<Omit<UsuarioListado, 'roles'> & { roles: string | null }>(`
      SELECT u.usuario_id, u.username, u.nombre, u.email, u.activo,
             STRING_AGG(r.codigo, ',') AS roles,
             u.debe_cambiar_password,
             CAST(CASE WHEN u.bloqueado_hasta > SYSUTCDATETIME() THEN 1 ELSE 0 END AS BIT) AS bloqueado,
             u.ultimo_acceso, u.creado_en
      FROM dbo.Usuarios u
      LEFT JOIN dbo.UsuarioRoles ur ON ur.usuario_id = u.usuario_id
      LEFT JOIN dbo.Roles r         ON r.rol_id = ur.rol_id AND r.activo = 1
      GROUP BY u.usuario_id, u.username, u.nombre, u.email, u.activo,
               u.debe_cambiar_password, u.bloqueado_hasta, u.ultimo_acceso, u.creado_en
      ORDER BY u.username
    `);
    return result.recordset.map((u) => ({ ...u, roles: roles(u.roles) }));
  });
}

/** Active roles, for the "create user" form */
export function listarRoles(): Promise<Rol[]> {
  return ejecutar(async () => {
    const result = await new sql.Request().query<Rol>(
      'SELECT codigo, nombre FROM dbo.Roles WHERE activo = 1 ORDER BY nombre',
    );
    return result.recordset;
  });
}
