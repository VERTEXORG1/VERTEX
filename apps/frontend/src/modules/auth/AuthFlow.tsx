import emblema from '../../assets/vertex-emblema.jpg';
import { LoginForm } from './LoginForm';
import styles from './auth.module.css';

interface AuthFlowProps {
  onSuccess: (token: string) => void;
}

const FEATURES = [
  'Horas de operación por motor en tiempo real',
  'Estados, eventos y tendencias de cada equipo',
  'Registro de mantenimientos e intervenciones',
];

/** Small logo of the card on phones: the emblem in its box and the name */
function Logo() {
  return (
    <div className={`${styles.logo} ${styles.logoDark}`}>
      <span className={styles.logoMark}>
        <img src={emblema} alt="" />
      </span>
      <span className={styles.logoText}>VERTEX</span>
    </div>
  );
}

/**
 * Sign-in screen: brand panel (desktop only) + login card. Phones show the
 * logo inside the card instead.
 */
export function AuthFlow({ onSuccess }: AuthFlowProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        {/* The brand emblem (it already reads "VERTEX"), centered on top */}
        <img src={emblema} alt="VERTEX" className={styles.brandEmblema} />
        <div className={styles.brandBody}>
          <p className={styles.brandSubtitle}>Sistema de Monitoreo Industrial</p>
          <ul className={styles.features}>
            {FEATURES.map((f) => (
              <li key={f} className={styles.feature}>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.brandFooter}>© 2025 VERTEX · v1.0</p>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardLogo}>
            <Logo />
          </div>
          <LoginForm onSuccess={onSuccess} />
        </div>
      </main>
    </div>
  );
}
