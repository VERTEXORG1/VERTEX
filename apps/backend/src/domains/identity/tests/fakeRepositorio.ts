import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import type * as Repo from '../identity.repository';

/*
 * In-memory stand-in for identity.repository with the same rules as the
 * sp_vx_* procedures (V007): 5 failures lock a user for 15 minutes, 5
 * failures from one IP in 15 minutes lock the IP, only ADMINISTRADOR and
 * ING_MANTENIMIENTO create users or reset passwords, and only ADMINISTRADOR
 * touches another ADMINISTRADOR. The procedures themselves are checked
 * against VERTEX_DEMO, not here.
 */

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const PUEDEN_ADMINISTRAR = ['ADMINISTRADOR', 'ING_MANTENIMIENTO'];

interface UsuarioFake {
  usuario_id: string;
  username: string;
  nombre: string;
  email: string | null;
  password_hash: string;
  debe_cambiar_password: boolean;
  intentos_fallidos: number;
  bloqueado_hasta: number | null;
  roles: string[];
  ultimo_acceso: Date | null;
}

export interface Auditado {
  usuarioId: string | null;
  accion: string;
  resultado: string;
  ip: string | null;
  fecha: number;
}

/** Same shape as ReglaError (status + message), thrown like a THROW 50xxx */
const regla = (status: number, message: string) => Object.assign(new Error(message), { status });

class FakeRepositorio {
  usuarios = new Map<string, UsuarioFake>();
  auditoria: Auditado[] = [];
  /** Clock of the lockout; tests move it forward */
  reloj = Date.now();

  reiniciar() {
    this.usuarios.clear();
    this.auditoria = [];
    this.reloj = Date.now();
  }

  /** Adds a user (low bcrypt cost: only the comparison matters here) */
  agregar(datos: { username: string; password: string; roles: string[]; email?: string; debeCambiar?: boolean }) {
    const usuario: UsuarioFake = {
      usuario_id: randomUUID(),
      username: datos.username,
      nombre: datos.username,
      email: datos.email ?? `${datos.username}@vertex.demo`,
      password_hash: bcrypt.hashSync(datos.password, 4),
      debe_cambiar_password: datos.debeCambiar ?? false,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      roles: datos.roles,
      ultimo_acceso: null,
    };
    this.usuarios.set(usuario.usuario_id, usuario);
    return usuario;
  }

  porNombre(username: string) {
    return [...this.usuarios.values()].find((u) => u.username === username);
  }

  private auditar(usuarioId: string | null, accion: string, resultado: string, ip: string | null) {
    this.auditoria.push({ usuarioId, accion, resultado, ip, fecha: this.reloj });
  }

  private vista(u: UsuarioFake): Repo.UsuarioLogin {
    return {
      usuario_id: u.usuario_id,
      username: u.username,
      nombre: u.nombre,
      email: u.email,
      password_hash: u.password_hash,
      debe_cambiar_password: u.debe_cambiar_password,
      bloqueado: u.bloqueado_hasta !== null && u.bloqueado_hasta > this.reloj,
      roles: [...u.roles],
    };
  }

  private actor(actorId: string, accion: string, ip: string | null) {
    const actor = this.usuarios.get(actorId);
    if (!actor || !actor.roles.some((r) => PUEDEN_ADMINISTRAR.includes(r))) {
      this.auditar(actor ? actorId : null, accion, 'DENEGADO', ip);
      throw regla(403, 'No tienes permiso para esta acción.');
    }
    return actor;
  }

  obtenerUsuario: typeof Repo.obtenerUsuario = async (buscar, ip) => {
    const fallosIp = this.auditoria.filter(
      (a) =>
        a.ip === ip &&
        a.resultado === 'FALLO' &&
        ['LOGIN', 'REAUTENTICAR', 'CAMBIAR_PASSWORD'].includes(a.accion) &&
        a.fecha > this.reloj - BLOQUEO_MS,
    ).length;
    const encontrados = [...this.usuarios.values()].filter((u) =>
      'usuarioId' in buscar
        ? u.usuario_id === buscar.usuarioId
        : u.username === buscar.credencial || u.email === buscar.credencial,
    );
    return {
      ipBloqueada: fallosIp >= MAX_INTENTOS,
      usuario: encontrados.length === 1 ? this.vista(encontrados[0]) : null,
    };
  };

  registrarIntento: typeof Repo.registrarIntento = async ({ usuarioId, resultado, accion, ip }) => {
    const u = usuarioId ? this.usuarios.get(usuarioId) : undefined;
    if (u && resultado === 'EXITO') {
      u.intentos_fallidos = 0;
      u.bloqueado_hasta = null;
      if (accion === 'LOGIN') u.ultimo_acceso = new Date(this.reloj);
    }
    if (u && resultado === 'FALLO' && !(u.bloqueado_hasta !== null && u.bloqueado_hasta > this.reloj)) {
      u.intentos_fallidos += 1;
      if (u.intentos_fallidos >= MAX_INTENTOS) {
        u.bloqueado_hasta = this.reloj + BLOQUEO_MS;
        u.intentos_fallidos = 0;
      }
    }
    this.auditar(u ? u.usuario_id : null, accion, resultado, ip);
  };

  cambiarPassword: typeof Repo.cambiarPassword = async (usuarioId, hash, ip) => {
    const u = this.usuarios.get(usuarioId);
    if (!u) throw regla(404, 'Usuario no encontrado.');
    Object.assign(u, { password_hash: hash, debe_cambiar_password: false, intentos_fallidos: 0, bloqueado_hasta: null });
    this.auditar(usuarioId, 'CAMBIAR_PASSWORD', 'EXITO', ip);
  };

  restablecerPassword: typeof Repo.restablecerPassword = async (actorId, usuarioId, hash, ip) => {
    const actor = this.actor(actorId, 'RESTABLECER_PASSWORD', ip);
    const u = this.usuarios.get(usuarioId);
    if (!u) throw regla(404, 'Usuario no encontrado.');
    if (u.usuario_id === actorId) throw regla(400, 'Para tu propia cuenta usa el cambio de contraseña.');
    if (u.roles.includes('ADMINISTRADOR') && !actor.roles.includes('ADMINISTRADOR')) {
      this.auditar(actorId, 'RESTABLECER_PASSWORD', 'DENEGADO', ip);
      throw regla(403, 'Solo un administrador puede restablecer la contraseña de otro administrador.');
    }
    Object.assign(u, { password_hash: hash, debe_cambiar_password: true, intentos_fallidos: 0, bloqueado_hasta: null });
    this.auditar(actorId, 'RESTABLECER_PASSWORD', 'EXITO', ip);
  };

  crearUsuario: typeof Repo.crearUsuario = async (actorId, datos, hash, ip) => {
    const actor = this.actor(actorId, 'CREAR_USUARIO', ip);
    if (!(await this.listarRoles()).some((r) => r.codigo === datos.rol)) throw regla(400, 'Rol no válido.');
    if (datos.rol === 'ADMINISTRADOR' && !actor.roles.includes('ADMINISTRADOR')) {
      this.auditar(actorId, 'CREAR_USUARIO', 'DENEGADO', ip);
      throw regla(403, 'Solo un administrador puede crear otro administrador.');
    }
    if ([...this.usuarios.values()].some((u) => u.username === datos.username || (datos.email && u.email === datos.email))) {
      throw regla(409, 'Ya existe un usuario con ese nombre de usuario o correo.');
    }
    const u = this.agregar({ username: datos.username, password: 'x', roles: [datos.rol], debeCambiar: true });
    Object.assign(u, { nombre: datos.nombre, email: datos.email, password_hash: hash });
    this.auditar(actorId, 'CREAR_USUARIO', 'EXITO', ip);
    return u.usuario_id;
  };

  listarUsuarios: typeof Repo.listarUsuarios = async () =>
    [...this.usuarios.values()].map((u) => {
      const { password_hash: _hash, intentos_fallidos: _i, bloqueado_hasta, ultimo_acceso, ...resto } = u;
      return {
        ...resto,
        activo: true,
        bloqueado: bloqueado_hasta !== null && bloqueado_hasta > this.reloj,
        ultimo_acceso: ultimo_acceso?.toISOString() ?? null,
        creado_en: new Date(0).toISOString(),
      };
    });

  listarRoles: typeof Repo.listarRoles = async () =>
    ['ADMINISTRADOR', 'ING_MANTENIMIENTO', 'TECNICO_MECANICO', 'TECNICO_ELECTRICO', 'DIRECTOR_PRODUCCION', 'CONSULTA', 'AUDITOR'].map(
      (codigo) => ({ codigo, nombre: codigo }),
    );
}

export const fake = new FakeRepositorio();

/** Functions that replace identity.repository in vi.mock */
export const repositorioFalso = {
  obtenerUsuario: fake.obtenerUsuario,
  registrarIntento: fake.registrarIntento,
  cambiarPassword: fake.cambiarPassword,
  restablecerPassword: fake.restablecerPassword,
  crearUsuario: fake.crearUsuario,
  listarUsuarios: fake.listarUsuarios,
  listarRoles: fake.listarRoles,
};
