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
| `POST /api/identity/login` | Inicio de sesión: bcrypt y JWT ([ADR 0005](../../docs/adr/0005-autenticacion-jwt-bcrypt.md)) |
| `GET /api/equipos/:codigo` | Verifica que el equipo exista |
| `GET /api/equipos/:codigo/bloques` | Horas por estado, bloques y ciclos completos (`sp_vx_resumen_estados`) |
| `GET /api/equipos/:codigo/resumen` | Horas por estado con el detalle del cálculo |
| `GET /api/equipos/:codigo/mediciones?variable=…` | Estadísticas por intervalo de una variable (`sp_vx_tendencia_variable`) |

## Pendiente
- Middlewares `authenticate`, `authorize` y `reauthenticate` (`src/shared/middleware/`): vacíos, así que ninguna ruta de datos exige el token.
- Pruebas: los 8 archivos `*.spec.ts` están vacíos y no hay comando `test`.
- Dominios `data-acquisition`, `hours-calculation`, `electrical-maintenance`, `mechanical-maintenance` y `audit`: estructura con archivos vacíos.
