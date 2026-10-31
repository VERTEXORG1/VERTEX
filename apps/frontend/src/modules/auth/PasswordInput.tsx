import { useState } from 'react';
import styles from './auth.module.css';

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 4l16 16" />}
    </svg>
  );
}

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Password field with the show / hide button (login, change, confirmation) */
export function PasswordInput({ id, name, value, onChange, autoComplete, disabled, autoFocus }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        className={`${styles.input} ${styles.passwordInput}`}
        type={showPassword ? 'text' : 'password'}
        name={name}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={styles.eyeButton}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={showPassword}
        aria-controls={id}
        disabled={disabled}
        onClick={() => setShowPassword((v) => !v)}
      >
        <EyeIcon crossed={showPassword} />
      </button>
    </div>
  );
}
