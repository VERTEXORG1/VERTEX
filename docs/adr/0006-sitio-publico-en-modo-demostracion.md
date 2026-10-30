# ADR 0006 — Sitio público en modo demostración, sin backend

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
La API necesita SQL Server, que corre en la red interna. Aun así, docentes y evaluadores deben poder ver el dashboard desde internet.

## Decisión
El frontend se publica en Netlify (https://vertexdashboar.netlify.app) compilado con `VITE_DEMO_MODE=true`. En ese modo:
- el inicio de sesión se valida contra `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`, sin backend;
- los bloques de estado, los ciclos y las mediciones se generan en el navegador con la misma forma que devuelve la API (`demoBloquesData` en `bloques.service.ts` y `demoMedicionesData` en `operacion.service.ts`).

En la red interna, el mismo frontend con `VITE_DEMO_MODE=false` consulta la API y la base reales.

## Consecuencias
- El dashboard se puede mostrar sin exponer la base de datos ni la API a internet.
- Los datos del sitio público son simulados y no salen de la base.
- Vite copia las variables `VITE_*` dentro del JavaScript público: la contraseña demo debe ser desechable, y ninguna credencial real puede ir en esas variables.
- Cada push a `main` lanza un despliegue en Netlify, salvo que el commit lleve `[skip netlify]`.

## Fuentes
- `CLAUDE.md`, sección "Despliegue".
- `apps/frontend/src/shared/api.ts`, `apps/frontend/src/modules/dashboard/bloques.service.ts`, `operacion.service.ts`.
