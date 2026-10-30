# Registros de decisiones de arquitectura (ADR)

Cada archivo documenta una decisión de arquitectura de VERTEX: su contexto, la decisión, sus consecuencias y su estado.

- **Autor:** Islender Arturo Alfonso Contreras (actividad 1 de la matriz: Arquitectura, SQL y ADR), con asistencia de IA en la redacción.
- **Fecha de redacción:** 30/10/2026. Las decisiones se tomaron antes, durante el desarrollo; estos registros las documentan a posteriori.
- **Fuentes:** solo el código del repositorio, `CLAUDE.md` y el DERS (§05.7 "Decisiones y restricciones de diseño"). No se agregan decisiones sin respaldo en esas fuentes.
- **Estado de todas:** Propuesto; pendiente de ratificación de TI (según la matriz, TI ratifica el estándar de la actividad 1).

| ADR | Decisión | Respaldo principal |
|---|---|---|
| [0001](0001-logica-en-procedimientos-almacenados.md) | La lógica de cálculo de estados y horas vive en procedimientos `sp_vx_*` de SQL Server | DERS §05.7; `database/procedures/` |
| [0002](0002-monolito-modular.md) | API y frontend como monolito modular, organizado por dominios | Estructura de `apps/backend/src/domains/` y `apps/frontend/src/modules/` |
| [0003](0003-identificador-propio-de-equipo.md) | Identificador propio de cada equipo, independiente de SAP | DERS §05.7; `dbo.EquiposCero.codigo` |
| [0004](0004-bases-demo-y-real-separadas.md) | Bases `VERTEX_DEMO` y `VERTEX_REAL` separadas | DERS §05.7; `instalar.ps1` |
| [0005](0005-autenticacion-jwt-bcrypt.md) | Autenticación con JWT y contraseñas con bcrypt | `apps/backend/src/domains/identity/`; `CLAUDE.md` |
| [0006](0006-sitio-publico-en-modo-demostracion.md) | El sitio público (Netlify) funciona en modo demostración, sin backend | `CLAUDE.md` (Despliegue); `apps/frontend/src/shared/api.ts` |

Formato de cada ADR: Estado, Contexto, Decisión, Consecuencias y Fuentes.
