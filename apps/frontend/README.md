# VERTEX · Frontend (dashboard web)

Dashboard de VERTEX: inicio de sesión, árbol de equipos, dona por ciclos entre mantenimientos, estado del motor, tabla "Resumen del período" y tendencia de variables. Publicado en modo demostración en https://vertexdashboar.netlify.app.

## Quién
- **Desarrollo:** el dashboard inicial lo desarrollaron Jhoan Sebastián Blanco Rincón y Ronal Gabriel Ure Carrillo según el tablero (tarea #4, Fase III: interfaz visual); la evolución desde el 12/10/2026 la desarrolló Islender Arturo Alfonso Contreras según el tablero (tarea #5). Integrado y subido al repositorio por Islender.
- **Responsable según la matriz:** Jhoan (actividad 2: Interfaz y C3/C4).
- **Acepta:** Islender.
- Detalle en [docs/EQUIPO.md](../../docs/EQUIPO.md).

## Tecnologías
React 19, TypeScript, Vite 8 y CSS Modules. Las gráficas (dona y tendencia) son SVG propio, sin librerías de gráficos. Lint con `oxlint`.

## Ejecutar
```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run lint
npm test           # Vitest + Testing Library (jsdom): mensajes de LoginForm
```

Variables (copiar [`.env.example`](.env.example) a `.env`):
- `VITE_API_URL`: dirección de la API (por defecto `http://localhost:3000`).
- `VITE_DEMO_MODE`: `false` en local, con la API y la base; `true` para el modo demostración sin backend (el de Netlify).

## Dónde está cada cosa
- `src/modules/auth/`: inicio de sesión (normal y demo) con "¿Olvidaste tu contraseña?", y el cambio obligatorio tras una contraseña temporal ([ADR 0007](../../docs/adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md)).
  - El enlace de olvido no llama a la API: muestra "Contacta al administrador o al jefe de mantenimiento" (en demo, "En la demostración, contacta al administrador").
  - `CambiarPassword.tsx` es el cambio obligatorio; `PasswordInput.tsx`, el campo con mostrar/ocultar; `ReauthModal.tsx`, la confirmación de la contraseña propia; `passwordPolicy.ts`, la misma política que el backend.
- `src/modules/admin/UsersRolesPage.tsx`: pantalla "Usuarios" (listar, crear y restablecer contraseña), solo para `ADMINISTRADOR` e `ING_MANTENIMIENTO` y nunca en modo demo; se abre desde el Sidebar o la cabecera móvil. La contraseña temporal se muestra una sola vez.
- `src/modules/dashboard/`: árbol de equipos, dona (`DonutPanel.tsx`), tendencia (`TrendChart.tsx`), tabla (`EventsSummary.tsx`) y servicios que llaman a la API o simulan los datos en modo demo.
- `src/modules/reporting/`: estructura pendiente (archivos vacíos).
- `src/shared/api.ts`: `API_URL` y `DEMO_MODE`.
