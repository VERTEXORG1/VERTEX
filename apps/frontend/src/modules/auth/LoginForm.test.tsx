import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * Messages of the login form. The backend is replaced by a fetch stub; the
 * module is imported again in each test so DEMO_MODE (read once from
 * VITE_DEMO_MODE) can change.
 */

async function renderLogin(demo = false) {
  vi.stubEnv('VITE_DEMO_MODE', demo ? 'true' : 'false');
  vi.resetModules();
  const { LoginForm } = await import('./LoginForm');
  const onSuccess = vi.fn();
  render(<LoginForm onSuccess={onSuccess} />);
  return onSuccess;
}

function responder(status: number, body: object) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function enviar(credential = 'operador', password = 'una-clave-de-prueba') {
  fireEvent.change(screen.getByLabelText('Usuario o correo'), { target: { value: credential } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('¿Olvidaste tu contraseña?', () => {
  it('muestra a quién acudir y no llama a ninguna API', async () => {
    const fetchMock = responder(200, {});
    await renderLogin();
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect(screen.getByRole('status').textContent).toBe('Contacta al administrador o al jefe de mantenimiento');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('en modo demo remite al administrador de la demostración', async () => {
    const fetchMock = responder(200, {});
    await renderLogin(true);
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect(screen.getByRole('status').textContent).toBe('En la demostración, contacta al administrador');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('mensajes de error', () => {
  it('credenciales inválidas', async () => {
    responder(401, { error: 'Credenciales inválidas' });
    await renderLogin();
    enviar();
    expect((await screen.findByRole('alert')).textContent).toBe('Credenciales inválidas');
  });

  it('bloqueo por intentos fallidos', async () => {
    const mensaje = 'Demasiados intentos fallidos. Espera 15 minutos o contacta al administrador.';
    responder(429, { error: mensaje });
    await renderLogin();
    enviar();
    expect((await screen.findByRole('alert')).textContent).toBe(mensaje);
  });

  it('backend caído: mensaje genérico', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await renderLogin();
    enviar();
    expect((await screen.findByRole('alert')).textContent).toBe('No se pudo iniciar sesión. Intenta de nuevo más tarde.');
  });
});

describe('inicio de sesión', () => {
  it('avisa del cambio obligatorio de contraseña', async () => {
    // Unsigned token with a future exp: only the shape matters here
    const payload = btoa(JSON.stringify({ username: 'operador', rol: [], debe_cambiar: true, exp: 4102444800 }));
    responder(200, { token: `e30.${payload}.firma`, debe_cambiar: true });
    const onSuccess = await renderLogin();
    enviar();
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ debeCambiar: true })));
  });

  it('conserva el botón de mostrar y ocultar la contraseña', async () => {
    await renderLogin();
    const campo = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(campo.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(campo.type).toBe('text');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(campo.type).toBe('password');
  });
});
