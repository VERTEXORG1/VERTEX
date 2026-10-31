import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { cambiarPassword, leerSesion } from './auth.service';
import { MIN_LENGTH, validarPassword } from './passwordPolicy';
import { PasswordInput } from './PasswordInput';
import styles from './auth.module.css';

interface CambiarPasswordProps {
  onSuccess: () => void;
  /** Leaves without changing it (ends the session) */
  onCancel: () => void;
}

/**
 * Mandatory password change after signing in with a temporary password
 * (ADR 0007): the dashboard opens only once it is done.
 */
export function CambiarPassword({ onSuccess, onCancel }: CambiarPasswordProps) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const actualId = useId();
  const nuevaId = useId();
  const repetidaId = useId();
  const reglaId = useId();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const sesion = leerSesion();
    const regla =
      !actual || !nueva
        ? 'Completa los tres campos.'
        : validarPassword(nueva, { username: sesion?.username ?? '', email: sesion?.email ?? null }) ??
          (nueva !== repetida ? 'Las contraseñas nuevas no coinciden.' : null) ??
          (nueva === actual ? 'La nueva contraseña debe ser distinta de la actual.' : null);
    if (regla) {
      setError(regla);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await cambiarPassword(actual, nueva);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h1 className={styles.title}>Cambia tu contraseña</h1>
        <p className={styles.subtitle}>Entraste con una contraseña temporal. Elige una nueva para continuar.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor={actualId} className={styles.label}>
          Contraseña temporal
        </label>
        <PasswordInput
          id={actualId}
          name="password_actual"
          autoComplete="current-password"
          autoFocus
          disabled={loading}
          value={actual}
          onChange={setActual}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={nuevaId} className={styles.label}>
          Nueva contraseña
        </label>
        <PasswordInput
          id={nuevaId}
          name="password_nueva"
          autoComplete="new-password"
          disabled={loading}
          value={nueva}
          onChange={setNueva}
        />
        <p id={reglaId} className={styles.hint}>
          Mínimo {MIN_LENGTH} caracteres, sin tu usuario ni tu correo y que no sea una contraseña común.
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor={repetidaId} className={styles.label}>
          Repite la nueva contraseña
        </label>
        <PasswordInput
          id={repetidaId}
          name="password_repetida"
          autoComplete="new-password"
          disabled={loading}
          value={repetida}
          onChange={setRepetida}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Guardando…
          </>
        ) : (
          'Cambiar contraseña'
        )}
      </button>
      <button type="button" className={styles.linkButton} disabled={loading} onClick={onCancel}>
        Salir sin cambiarla
      </button>
    </form>
  );
}
