import type { Request, Response } from 'express';
import { ipDe, responderError } from './responder';
import { crearUsuario, leerNuevoUsuario, listarRoles, listarUsuarios, restablecerPassword } from './usuarios.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET /api/identity/usuarios → { usuarios } (no hashes) */
export async function listar(_req: Request, res: Response) {
  try {
    res.json({ usuarios: await listarUsuarios() });
  } catch (err) {
    responderError(res, err, 'listado de usuarios');
  }
}

/** GET /api/identity/roles → { roles: [{ codigo, nombre }] } */
export async function roles(_req: Request, res: Response) {
  try {
    res.json({ roles: await listarRoles() });
  } catch (err) {
    responderError(res, err, 'listado de roles');
  }
}

/**
 * POST /api/identity/usuarios  body: { username, nombre, email?, rol, password_actual }
 * → 201 { usuario_id, username, password_temporal } (shown once)
 */
export async function crear(req: Request, res: Response) {
  try {
    const datos = leerNuevoUsuario(req.body);
    res.status(201).json(await crearUsuario(req.usuario!.userId, datos, ipDe(req)));
  } catch (err) {
    responderError(res, err, 'creación de usuario');
  }
}

/**
 * POST /api/identity/usuarios/:id/restablecer  body: { password_actual }
 * → { usuario_id, password_temporal } (shown once)
 */
export async function restablecer(req: Request, res: Response) {
  const id = String(req.params.id ?? '');
  if (!UUID.test(id)) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }
  try {
    res.json(await restablecerPassword(req.usuario!.userId, id, ipDe(req)));
  } catch (err) {
    responderError(res, err, 'restablecimiento de contraseña');
  }
}
