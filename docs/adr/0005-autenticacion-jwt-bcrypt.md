# ADR 0005 — Autenticación con JWT y contraseñas con bcrypt

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
El prototipo necesita identificar a los usuarios del dashboard antes de que exista la integración con el Directorio Activo corporativo, que está prevista y no operativa (DERS §05.3–05.5, C4 niveles 1 a 3).

## Decisión
- `POST /api/identity/login` recibe `{ credential, password }`, busca un usuario activo en `dbo.Usuarios` (por correo o nombre de usuario) con sus roles, y compara la contraseña con **bcrypt**.
- Si las credenciales son válidas, la API emite un **JWT** firmado con `JWT_SECRET` (variable de entorno, nunca versionada), con `userId`, `email`, `username` y `rol`, que vence a las 8 horas (`JWT_EXPIRES_IN`).
- Si el usuario no existe, la API también ejecuta bcrypt, para que el tiempo de respuesta no delate qué usuarios existen.
- El frontend guarda el token en `sessionStorage` (`vx_token`): cada pestaña o ventana nueva pide iniciar sesión.

## Consecuencias
- Las contraseñas nunca se guardan en claro; los hashes de los usuarios demo se generan con `scripts/create_demo_users.ts` a partir de variables de entorno.
- **Pendiente:** los middlewares `authenticate`, `authorize` y `reauthenticate` (`apps/backend/src/shared/middleware/`) están vacíos, así que hoy **ninguna ruta de datos exige el token**. El JWT se emite, pero no se valida en el resto de la API.
- La tabla de usuarios es para la demostración: la autenticación final será contra el Directorio Activo (`CLAUDE.md`), y esta decisión deberá revisarse entonces.

## Fuentes
- `apps/backend/src/domains/identity/`, `apps/backend/src/shared/middleware/`.
- `apps/frontend/src/modules/auth/auth.service.ts`.
- `CLAUDE.md`, secciones "Login" y "Backend".
