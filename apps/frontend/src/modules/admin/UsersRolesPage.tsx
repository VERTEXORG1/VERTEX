import { useCallback, useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import emblema from '../../assets/vertex-emblema.jpg';
import { leerSesion } from '../auth/auth.service';
import { ReauthModal } from '../auth/ReauthModal';
import authStyles from '../auth/auth.module.css';
import { LogoutIcon } from '../dashboard/LogoutIcon';
import { crearUsuario, listarRoles, listarUsuarios, restablecerPassword } from './usuarios.service';
import type { NuevoUsuario, Rol, UsuarioListado } from './usuarios.service';
import styles from './admin.module.css';

interface UsersRolesPageProps {
  onVolver: () => void;
  onLogout: () => void;
}

/** Action waiting for the admin's own password */
type Pendiente = { tipo: 'crear'; datos: NuevoUsuario } | { tipo: 'restablecer'; usuario: UsuarioListado };

/** Temporary password just generated: shown once, gone when closed */
interface Temporal {
  username: string;
  password: string;
  creado: boolean;
}

const USERNAME = /^[a-z0-9._-]{3,50}$/;
const FORM_VACIO: NuevoUsuario = { username: '', nombre: '', email: '', rol: 'CONSULTA' };

/** dd/mm/aaaa hh:mm UTC, as the rest of the dashboard */
function fechaUtc(iso: string | null): string {
  if (!iso) return 'Nunca';
  const d = new Date(iso);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())} UTC`;
}

function Estado({ u }: { u: UsuarioListado }) {
  if (!u.activo) return <span className={styles.estadoInactivo}>Inactivo</span>;
  if (u.bloqueado) return <span className={styles.estadoBloqueado}>Bloqueado 15 min</span>;
  if (u.debe_cambiar_password) return <span className={styles.estadoPendiente}>Debe cambiar contraseña</span>;
  return <span className={styles.estadoActivo}>Activo</span>;
}

/**
 * User administration (ADR 0007), for ADMINISTRADOR and ING_MANTENIMIENTO:
 * list, create users and reset passwords. Every change asks for the admin's
 * own password; the temporary password is shown once.
 */
export function UsersRolesPage({ onVolver, onLogout }: UsersRolesPageProps) {
  const sesion = leerSesion();
  const esAdministrador = !!sesion?.rol.includes('ADMINISTRADOR');
  const [usuarios, setUsuarios] = useState<UsuarioListado[] | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [errorCarga, setErrorCarga] = useState('');
  const [form, setForm] = useState<NuevoUsuario>(FORM_VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [temporal, setTemporal] = useState<Temporal | null>(null);
  const [copiada, setCopiada] = useState(false);
  const ids = { username: useId(), nombre: useId(), email: useId(), rol: useId() };

  // Bumped after each change to load the list again
  const [version, setVersion] = useState(0);
  const cargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarUsuarios(), listarRoles()]).then(
      ([lista, catalogo]) => {
        if (!vigente) return;
        setUsuarios(lista);
        setRoles(catalogo);
        setErrorCarga('');
      },
      (err: unknown) => {
        if (vigente) setErrorCarga(err instanceof Error ? err.message : 'No se pudo cargar la lista de usuarios.');
      },
    );
    return () => {
      vigente = false;
    };
  }, [version]);

  const nombreRol = (codigo: string) => roles.find((r) => r.codigo === codigo)?.nombre ?? codigo;
  // Only an ADMINISTRADOR creates another one (the backend enforces it too)
  const rolesAsignables = roles.filter((r) => esAdministrador || r.codigo !== 'ADMINISTRADOR');

  function enviarCreacion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = { ...form, username: form.username.trim().toLowerCase(), nombre: form.nombre.trim(), email: form.email.trim() };
    const problema = !USERNAME.test(datos.username)
      ? 'El usuario debe tener de 3 a 50 caracteres: letras minúsculas, números, punto, guion o guion bajo.'
      : !datos.nombre
        ? 'El nombre es obligatorio.'
        : datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)
          ? 'El correo no es válido.'
          : null;
    setErrorForm(problema ?? '');
    if (!problema) setPendiente({ tipo: 'crear', datos });
  }

  async function confirmar(password: string) {
    if (!pendiente) return;
    if (pendiente.tipo === 'crear') {
      const r = await crearUsuario(pendiente.datos, password);
      setTemporal({ username: pendiente.datos.username, password: r.password_temporal, creado: true });
      setForm(FORM_VACIO);
    } else {
      const r = await restablecerPassword(pendiente.usuario.usuario_id, password);
      setTemporal({ username: pendiente.usuario.username, password: r.password_temporal, creado: false });
    }
    setPendiente(null);
    setCopiada(false);
    cargar();
  }

  async function copiar() {
    if (!temporal) return;
    try {
      await navigator.clipboard.writeText(temporal.password);
      setCopiada(true);
    } catch {
      // clipboard blocked: the admin copies it by hand
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logoMark}>
          <img src={emblema} alt="" />
        </span>
        <h1 className={styles.headerTitle}>Usuarios</h1>
        <button type="button" className={styles.botonSecundario} onClick={onVolver}>
          Volver al dashboard
        </button>
        <button type="button" className={styles.iconButton} onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogoutIcon />
        </button>
      </header>

      <main className={styles.main}>
        {temporal && (
          <section className={`${styles.card} ${styles.temporal}`} aria-live="polite">
            <h2 className={styles.cardTitle}>
              {temporal.creado ? `Usuario ${temporal.username} creado` : `Contraseña de ${temporal.username} restablecida`}
            </h2>
            <p className={styles.texto}>Contraseña temporal (se muestra una sola vez):</p>
            <div className={styles.temporalFila}>
              <code className={styles.temporalValor}>{temporal.password}</code>
              <button type="button" className={styles.botonSecundario} onClick={copiar}>
                {copiada ? 'Copiada' : 'Copiar'}
              </button>
            </div>
            <p className={styles.texto}>
              Entrégala por un canal seguro. Al entrar, {temporal.username} deberá cambiarla.
            </p>
            <button type="button" className={styles.botonPrimario} onClick={() => setTemporal(null)}>
              Ya la entregué
            </button>
          </section>
        )}

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Crear usuario</h2>
          <p className={styles.texto}>
            El sistema genera una contraseña temporal y el usuario la cambia en su primer ingreso. No hay registro público.
          </p>
          {errorForm && (
            <div className={authStyles.errorBanner} role="alert">
              <span>{errorForm}</span>
            </div>
          )}
          <form className={styles.formGrid} onSubmit={enviarCreacion} noValidate>
            <div className={authStyles.field}>
              <label htmlFor={ids.username} className={authStyles.label}>
                Usuario
              </label>
              <input
                id={ids.username}
                className={authStyles.input}
                autoCapitalize="none"
                spellCheck={false}
                placeholder="nombre.apellido"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className={authStyles.field}>
              <label htmlFor={ids.nombre} className={authStyles.label}>
                Nombre completo
              </label>
              <input
                id={ids.nombre}
                className={authStyles.input}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className={authStyles.field}>
              <label htmlFor={ids.email} className={authStyles.label}>
                Correo (opcional)
              </label>
              <input
                id={ids.email}
                className={authStyles.input}
                type="email"
                autoCapitalize="none"
                spellCheck={false}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className={authStyles.field}>
              <label htmlFor={ids.rol} className={authStyles.label}>
                Rol
              </label>
              <select
                id={ids.rol}
                className={authStyles.input}
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                {rolesAsignables.map((r) => (
                  <option key={r.codigo} value={r.codigo}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={styles.botonPrimario} disabled={!roles.length}>
              Crear usuario
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Usuarios registrados {usuarios ? `(${usuarios.length})` : ''}</h2>
          {errorCarga && (
            <div className={authStyles.errorBanner} role="alert">
              <span>{errorCarga}</span>
            </div>
          )}
          {!usuarios && !errorCarga && <p className={styles.texto}>Cargando…</p>}
          {usuarios && (
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Último acceso</th>
                    <th>
                      <span className={styles.oculto}>Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const propio = u.usuario_id === sesion?.userId;
                    const protegido = u.roles.includes('ADMINISTRADOR') && !esAdministrador;
                    return (
                      <tr key={u.usuario_id}>
                        <td className={styles.usuario}>{u.username}</td>
                        <td>{u.nombre}</td>
                        <td>{u.email ?? '—'}</td>
                        <td>{u.roles.map(nombreRol).join(', ') || '—'}</td>
                        <td>
                          <Estado u={u} />
                        </td>
                        <td className={styles.fecha}>{fechaUtc(u.ultimo_acceso)}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.botonTabla}
                            disabled={propio || protegido || !u.activo}
                            title={
                              propio
                                ? 'Tu propia contraseña no se restablece aquí'
                                : protegido
                                  ? 'Solo un administrador restablece a otro administrador'
                                  : `Asignar una contraseña temporal a ${u.username}`
                            }
                            onClick={() => setPendiente({ tipo: 'restablecer', usuario: u })}
                          >
                            Restablecer contraseña
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {pendiente && (
        <ReauthModal
          titulo={pendiente.tipo === 'crear' ? `Crear el usuario ${pendiente.datos.username}` : `Restablecer la contraseña de ${pendiente.usuario.username}`}
          descripcion="Confirma tu propia contraseña para continuar."
          onConfirmar={confirmar}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </div>
  );
}
