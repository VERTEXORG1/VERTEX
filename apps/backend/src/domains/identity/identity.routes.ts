import { Router } from 'express';
import { authenticate, authenticateCambioPendiente } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { reauthenticate } from '../../shared/middleware/reauthenticate';
import { cambiarPassword, login } from './identity.controller';
import { ROLES_ADMIN_USUARIOS } from './types/auth.types';
import { crear, listar, restablecer, roles } from './usuarios.controller';

export const identityRouter = Router();

identityRouter.post('/login', login);
// Also with a temporary password: it is how the user gets rid of it
identityRouter.post('/password/cambiar', authenticateCambioPendiente, cambiarPassword);

// User administration (ADR 0007): ADMINISTRADOR and ING_MANTENIMIENTO; the
// changes also need the admin's own password
const admin = [authenticate, authorize(...ROLES_ADMIN_USUARIOS)];
identityRouter.get('/usuarios', ...admin, listar);
identityRouter.get('/roles', ...admin, roles);
identityRouter.post('/usuarios', ...admin, reauthenticate, crear);
identityRouter.post('/usuarios/:id/restablecer', ...admin, reauthenticate, restablecer);
