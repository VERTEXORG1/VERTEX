import emblema from '../../assets/vertex-emblema.jpg';
import { ArbolEquipos } from './ArbolEquipos';
import type { CeroCheck } from './ArbolEquipos';
import type { NodoArbol } from './jerarquiaDemo';
import { LogoutIcon } from './LogoutIcon';
import { UsuariosIcon } from './UsuariosIcon';
import styles from './dashboard.module.css';

interface SidebarProps {
  ruta: string[];
  onRutaChange: (ruta: string[], elegido?: NodoArbol) => void;
  verificacion: CeroCheck;
  onLogout: () => void;
  /** Opens the user administration; absent for roles without access */
  onUsuarios?: () => void;
}

/** Left panel (desktop and phone landscape): logo, equipment tree, users and logout */
export function Sidebar({ ruta, onRutaChange, verificacion, onLogout, onUsuarios }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logoMark}>
          <img src={emblema} alt="" />
        </div>
        <span className={styles.logoText}>VERTEX</span>
      </div>
      <nav className={styles.sidebarArbol} aria-label="Equipos">
        <ArbolEquipos ruta={ruta} onRutaChange={onRutaChange} verificacion={verificacion} />
      </nav>
      {onUsuarios && (
        <button type="button" className={`${styles.sidebarItem} ${styles.sidebarUsuarios}`} onClick={onUsuarios}>
          <UsuariosIcon className={styles.sidebarIcon} />
          Usuarios
        </button>
      )}
      <button type="button" className={`${styles.sidebarItem} ${styles.sidebarLogout}`} onClick={onLogout}>
        <LogoutIcon className={styles.sidebarIcon} />
        Cerrar sesión
      </button>
    </aside>
  );
}
