import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AYUDA_OLVIDO, login } from './auth.service';
import type { Ingreso } from './auth.service';
import { PasswordInput } from './PasswordInput';
import styles from './auth.module.css';

interface LoginFormProps {
  onSuccess: (ingreso: Ingreso) => void;
}

type Status = 'idle' | 'loading' | 'error';

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v6" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** Email-or-username + password form, checked against the backend */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ayudaVisible, setAyudaVisible] = useState(false);
  // Ignore a response that arrives after the form has unmounted
  const mounted = useRef(true);
  const credentialId = useId();
  const passwordId = useId();
  const ayudaId = useId();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loading = status === 'loading';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setStatus('loading');
    try {
      const ingreso = await login(credential.trim(), password);
      if (mounted.current) onSuccess(ingreso);
    } catch (err) {
      if (!mounted.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      setStatus('error');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>
      </div>

      {status === 'error' && (
        <div className={styles.errorBanner} role="alert">
          <AlertIcon />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor={credentialId} className={styles.label}>
          Usuario o correo
        </label>
        <input
          id={credentialId}
          className={styles.input}
          type="text"
          name="credential"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="tu.usuario o correo@empresa.com"
          autoFocus
          required
          disabled={loading}
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={passwordId} className={styles.label}>
          Contraseña
        </label>
        <PasswordInput
          id={passwordId}
          name="password"
          autoComplete="current-password"
          disabled={loading}
          value={password}
          onChange={setPassword}
        />
        <button
          type="button"
          className={styles.linkButton}
          aria-expanded={ayudaVisible}
          aria-controls={ayudaId}
          onClick={() => setAyudaVisible((v) => !v)}
        >
          ¿Olvidaste tu contraseña?
        </button>
        {ayudaVisible && (
          <p id={ayudaId} className={styles.infoNote} role="status">
            {AYUDA_OLVIDO}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Verificando…
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
}
