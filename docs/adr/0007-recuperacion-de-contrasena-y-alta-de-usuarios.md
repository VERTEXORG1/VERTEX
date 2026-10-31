# ADR 0007 — Recuperación de contraseña por un administrador y alta de usuarios sin autorregistro

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.
- **Fecha:** 30/10/2026.

## Contexto
La pantalla de inicio de sesión necesita lo habitual: "¿Olvidaste tu contraseña?" y una forma de dar de alta usuarios. Hay varias restricciones reales:
- El proyecto todavía no usa datos reales ni Directorio Activo; este último está previsto a futuro según el DERS ([ADR 0005](0005-autenticacion-jwt-bcrypt.md)).
- Los correos de los usuarios demo son ficticios (`@vertex.demo`) y no hay servicio de correo.
- El sitio público de Netlify funciona en modo demostración, sin backend ([ADR 0006](0006-sitio-publico-en-modo-demostracion.md)).
- Los middlewares `authenticate`, `authorize` y `reauthenticate` estaban vacíos.
- La lógica va en procedimientos `sp_vx_*` ([ADR 0001](0001-logica-en-procedimientos-almacenados.md)).

## Decisión
- **Recuperación: restablecimiento por un administrador (opción A).**
  - El enlace "¿Olvidaste tu contraseña?" solo muestra un mensaje fijo y no llama a ninguna API:
    - modo normal: "Contacta al administrador o al jefe de mantenimiento";
    - modo demo: "En la demostración, contacta al administrador".
  - Un usuario con rol `ADMINISTRADOR` o `ING_MANTENIMIENTO` asigna una **contraseña temporal** generada por el servidor (`XXXX-XXXX-XXXX`, ~70 bits). Se muestra una sola vez al administrador y la base guarda solo su hash.
  - El usuario queda con `debe_cambiar_password = 1`. Su token solo sirve para `POST /api/identity/password/cambiar` hasta que la cambie.
- **Sin autorregistro.** Los mismos dos roles crean usuarios desde la pantalla "Usuarios": nombre de usuario, nombre, correo opcional, rol y contraseña temporal con cambio obligatorio.
  - Solo un `ADMINISTRADOR` crea otro `ADMINISTRADOR` o restablece su contraseña.
  - Nadie restablece su propia contraseña por esta vía: para eso está el cambio de contraseña.
- **Reautenticación:** crear un usuario o restablecer una contraseña exige confirmar la contraseña propia (`password_actual`, middleware `reauthenticate`).
- **Bloqueo temporal,** guardado en la base:
  - **por usuario:** 5 fallos seguidos (`intentos_fallidos`) → `bloqueado_hasta` = ahora + 15 min;
  - **por IP:** 5 fallos en los últimos 15 minutos, contados en `dbo.Auditoria.ip_origen` (sin tabla nueva).
  - Cuentan como fallos el login, la reautenticación y la contraseña actual errónea en un cambio.
- **Política de contraseña,** validada en el backend y en el frontend:
  - mínimo 10 caracteres y máximo 72 bytes (límite de bcrypt);
  - no puede contener el usuario ni el correo;
  - no puede estar en una lista corta de contraseñas comunes.
- **Mensajes genéricos:** una contraseña errónea, un usuario inexistente y un usuario bloqueado responden igual (401 "Credenciales inválidas").
  - Solo el bloqueo por IP responde distinto (429), porque depende de la IP y no revela qué usuarios existen.
  - bcrypt de 12 rondas, también en el `DUMMY_HASH`, para que un usuario inexistente tarde lo mismo que uno real.
- **Auditoría** en `dbo.Auditoria`, sin contraseñas, hashes ni la credencial escrita cuando no corresponde a un usuario:
  - logins correctos, fallidos y denegados;
  - reautenticaciones;
  - cambios y restablecimientos de contraseña;
  - creación de usuarios.
  - Cada login correcto actualiza `ultimo_acceso`.
- **Base de datos:** migración `V007__identity_recuperacion.sql`, que solo agrega columnas a `dbo.Usuarios` (`debe_cambiar_password`, `intentos_fallidos`, `bloqueado_hasta`, `password_cambiada_en`).
  - Procedimientos `R__` (re-ejecutables, como el resto): `sp_vx_login_obtener_usuario`, `sp_vx_login_registrar_resultado`, `sp_vx_password_cambiar`, `sp_vx_password_restablecer_admin` y `sp_vx_usuario_crear`.
  - bcrypt se queda en Node. Los procedimientos guardan el hash, aplican las reglas y vuelven a comprobar los roles en la base.

## Opciones descartadas o futuras
- **B. Enlace de un solo uso por correo** (token aleatorio guardado como hash, con vencimiento y uso único): descartada por ahora. No hay SMTP, los correos demo son ficticios y añade superficie de ataque (envío masivo, enumeración, tokens en registros). Si se retoma: SMTP por variables de entorno y desactivado por defecto, tabla de tokens en una migración nueva, y respuesta siempre genérica.
- **C. Directorio Activo:** es la solución prevista. La contraseña la gestiona TI y VERTEX no guarda ninguna para las cuentas corporativas. Cuando llegue, la opción A queda solo para cuentas locales de emergencia, si TI las admite.
- **Autorregistro con aprobación:** descartado. No hay usuarios reales todavía, las cuentas vendrán de TI y un formulario público en una red industrial añade riesgo sin beneficio.

## Consecuencias
- No hace falta servicio de correo. Recuperar el acceso depende de que haya un administrador o un jefe de mantenimiento disponible.
- La contraseña temporal se entrega fuera del sistema (en persona o por un canal seguro).
- Con una IP compartida (p. ej. un proxy de planta), los fallos de varios usuarios suman en la misma IP.
- Un token emitido antes de un restablecimiento sigue siendo válido hasta que vence (8 h): `authenticate` solo verifica la firma, sin consultar la base.
- Las rutas de datos (`/api/equipos/...`) todavía no exigen el token. Para protegerlas, el frontend debe enviarlo y el calentamiento de `start-vertex.ps1` también.
- Netlify: el enlace de olvido muestra el mensaje de demostración y no aparecen ni el cambio de contraseña ni la administración de usuarios.

## Fuentes
- `database/migrations/V007__identity_recuperacion.sql`, `database/procedures/R__sp_vx_login_*.sql`, `R__sp_vx_password_*.sql`, `R__sp_vx_usuario_crear.sql`.
- `apps/backend/src/domains/identity/`, `apps/backend/src/shared/middleware/`.
- `apps/frontend/src/modules/auth/`, `apps/frontend/src/modules/admin/`.
