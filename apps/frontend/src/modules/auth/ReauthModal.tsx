import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { PasswordInput } from './PasswordInput';
import authStyles from './auth.module.css';
import styles from '../admin/admin.module.css';

interface ReauthModalProps {
  titulo: string;
  descripcion: string;
  /** Runs the action with the user's own password; rejects with the message to show */
  onConfirmar: (password: string) => Promise<void>;
  onCancelar: () => void;
}

/**
 * Asks the signed-in user for their own password before a sensitive action
 * (create a user, reset a password). The backend checks it again
 * (reauthenticate middleware) and counts failures towards the lockout.
 */
export function ReauthModal({ titulo, descripcion, onConfirmar, onCancelar }: ReauthModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tituloId = useId();
  const passwordId = useId();

  // Escape closes it, as any dialog
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancelar();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onCancelar]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!password) {
      setError('Escribe tu contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConfirmar(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={tituloId} onSubmit={handleSubmit} noValidate>
        <h2 id={tituloId} className={styles.modalTitle}>
          {titulo}
        </h2>
        <p className={styles.modalText}>{descripcion}</p>

        {error && (
          <div className={authStyles.errorBanner} role="alert">
            <span>{error}</span>
          </div>
        )}

        <div className={authStyles.field}>
          <label htmlFor={passwordId} className={authStyles.label}>
            Tu contraseña
          </label>
          <PasswordInput
            id={passwordId}
            name="password_actual"
            autoComplete="current-password"
            autoFocus
            disabled={loading}
            value={password}
            onChange={setPassword}
          />
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.botonSecundario} disabled={loading} onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className={styles.botonPrimario} disabled={loading} aria-busy={loading}>
            {loading ? 'Confirmando…' : 'Confirmar'}
          </button>
        </div>
      </form>
    </div>
  );
}
