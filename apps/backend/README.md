# VERTEX · Backend (API REST)

API de VERTEX: inicio de sesión, verificación de equipos y consulta de estados, ciclos y mediciones. No calcula estados: valida la solicitud y ejecuta los procedimientos `sp_vx_*` de SQL Server ([ADR 0001](../../docs/adr/0001-logica-en-procedimientos-almacenados.md)).

## Quién
- **Desarrollo:** desarrollado por Islender Arturo Alfonso Contreras según el tablero (tarea #5, Fase IV: piloto en un CERO); integrado y subido al repositorio por Islender.
- **Responsable según la matriz:** Islender (actividad 1: Arquitectura, SQL y ADR).
- **Acepta:** Islender; TI ratifica el estándar.
- Detalle en [docs/EQUIPO.md](../../docs/EQUIPO.md).

## Tecnologías
Node.js, Express 5, TypeScript, `mssql`, `bcrypt` y `jsonwebtoken`.

## Ejecutar
Requiere SQL Server con `VERTEX_DEMO` instalada (ver [database/README.md](../../database/README.md)).

```powershell
npm install
npm run dev              # http://localhost:3000 (tsx watch)
npm run typecheck
npm test                 # Vitest + Supertest, sin base de datos (repositorio en memoria)
npm run build            # compila a dist/
npm start                # ejecuta dist/main.js
npm run seed:mediciones  # mediciones por minuto de CERO-010 (ver database/README.md)
npm run db:export        # instantánea de solo lectura de la base en docs/db-snapshot.xlsx (no se versiona)
```

Variables: copiar [`.env.example`](.env.example) a `.env` y completar los valores (`DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`). Nunca se versiona el `.env`.

## Rutas
| Ruta | Qué hace |
|---|---|
| `GET /health` | Estado de la API y de la conexión a la base |
| `POST /api/identity/login` | Inicio de sesión: bcrypt y JWT ([ADR 0005](../../docs/adr/0005-autenticacion-jwt-bcrypt.md)); devuelve `{ token, debe_cambiar }`. Bloqueo de 15 min tras 5 fallos por usuario o por IP ([ADR 0007](../../docs/adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md)) |
| `POST /api/identity/password/cambiar` | Con sesión (también con contraseña temporal): `{ password_actual, password_nueva }` → token nuevo sin cambio pendiente |
| `GET /api/identity/usuarios`, `GET /api/identity/roles` | Solo `ADMINISTRADOR` e `ING_MANTENIMIENTO`: listado de usuarios (sin hashes) y roles |
| `POST /api/identity/usuarios` | Mismos roles y reautenticación (`password_actual`): crea un usuario con contraseña temporal, devuelta una sola vez |
| `POST /api/identity/usuarios/:id/restablecer` | Mismos roles y reautenticación: contraseña temporal nueva con cambio obligatorio |
| `GET /api/equipos/:codigo` | Verifica que el equipo exista |
| `GET /api/equipos/:codigo/bloques` | Horas por estado, bloques y ciclos completos (`sp_vx_resumen_estados`) |
| `GET /api/equipos/:codigo/resumen` | Horas por estado con el detalle del cálculo |
| `GET /api/equipos/:codigo/mediciones?variable=…` | Estadísticas por intervalo de una variable (`sp_vx_tendencia_variable`) |

## Autenticación
- `src/shared/middleware/`:
  - `authenticate`: exige `Authorization: Bearer <JWT>`; un token con `debe_cambiar` solo pasa por el cambio de contraseña;
  - `authorize(...roles)`: deja pasar solo esos roles;
  - `reauthenticate`: exige la contraseña propia en `password_actual`.
- `src/domains/identity/`:
  - `identity.service.ts`: login y cambio de contraseña;
  - `usuarios.service.ts`: alta y restablecimiento;
  - `password-policy.ts`: política y contraseña temporal;
  - `identity.repository.ts`: ejecuta los `sp_vx_*`.
- Las reglas (bloqueo, roles, auditoría) están en los procedimientos de `V007` ([database/README.md](../../database/README.md)).
- Pruebas: `src/domains/identity/tests/identity.spec.ts` y `src/__tests__/e2e/auth-permissions.e2e.spec.ts` reemplazan el repositorio por uno en memoria con las mismas reglas (`tests/fakeRepositorio.ts`).

## Pendiente
- Las rutas de datos (`/api/equipos/...`) todavía no exigen el token: hay que añadir `authenticate` y que el frontend y `start-vertex.ps1` lo envíen.
- Pruebas: los otros 6 `*.spec.ts` siguen vacíos; `vitest.config.mts` solo incluye los de identidad.
- Dominios `data-acquisition`, `hours-calculation`, `electrical-maintenance`, `mechanical-maintenance` y `audit`: estructura con archivos vacíos.
