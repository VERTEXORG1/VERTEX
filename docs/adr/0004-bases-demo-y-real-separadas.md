# ADR 0004 — Bases `VERTEX_DEMO` y `VERTEX_REAL` separadas

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
El prototipo se valida con datos simulados (654.470 registros sintéticos de CERO-010 entre el 13/07 y el 14/10/2026) y debe evolucionar a datos reales capturados en planta, sin que unos se mezclen con otros.

## Decisión
Se instalan dos bases con el mismo esquema:
- `VERTEX_DEMO`: migraciones, procedimientos y datos de demostración (seeds y `npm run seed:mediciones`).
- `VERTEX_REAL`: solo migraciones y procedimientos, sin datos de demostración.

El instalador (`instalar.ps1 -Target demo | real | all`) aplica a cada una lo que le corresponde. La API se conecta a una sola base, definida en `DB_NAME`, con el login `app_demo_user`, que en `VERTEX_DEMO` solo tiene `SELECT` y `EXECUTE` (`DENY INSERT/UPDATE/DELETE`).

## Consecuencias
- Los datos simulados no contaminan la base real.
- Debe verificarse que los ambientes y las credenciales no se mezclen (DERS §05.7): cada base tiene su login y las contraseñas se leen de variables de entorno, nunca de archivos versionados.
- Los cambios de esquema deben aplicarse en las dos bases. El procedimiento `sp_vx_resumen_estados` con `@ciclos` está aplicado en `VERTEX_DEMO` y falta en `VERTEX_REAL` (ver `CLAUDE.md`).

## Fuentes
- DERS §05.7 y §01.2.
- `instalar.ps1`, `database/scripts/01_install_databases.sql`.
- `CLAUDE.md`, sección "Base de datos".
