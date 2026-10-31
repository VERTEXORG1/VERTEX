import { useState } from 'react';
import { AuthFlow } from './modules/auth/AuthFlow';
import { leerSesion, logout, ROLES_ADMIN_USUARIOS } from './modules/auth/auth.service';
import { UsersRolesPage } from './modules/admin/UsersRolesPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { DEMO_MODE } from './shared/api';

type View = 'login' | 'cambiar' | 'dashboard' | 'usuarios';

/** A valid token of this tab (e.g. after F5) skips the login; a temporary password goes to the change */
function vistaInicial(): View {
  const sesion = leerSesion();
  if (!sesion) return 'login';
  return sesion.debeCambiar ? 'cambiar' : 'dashboard';
}

function App() {
  // A new tab or window always starts at the login
  const [view, setView] = useState<View>(vistaInicial);

  function salir() {
    logout();
    setView('login');
  }

  if (view === 'login' || view === 'cambiar') {
    // auth.service already stored the token in sessionStorage (vx_token)
    return <AuthFlow cambioPendiente={view === 'cambiar'} onSuccess={() => setView('dashboard')} onSalir={salir} />;
  }

  // Demo mode (Netlify) has no users to manage
  const puedeAdministrar = !DEMO_MODE && !!leerSesion()?.rol.some((r) => ROLES_ADMIN_USUARIOS.includes(r));

  if (view === 'usuarios' && puedeAdministrar) {
    return <UsersRolesPage onVolver={() => setView('dashboard')} onLogout={salir} />;
  }

  return <DashboardPage onLogout={salir} onUsuarios={puedeAdministrar ? () => setView('usuarios') : undefined} />;
}

export default App;
