# Equipo y responsabilidades de VERTEX

Proyecto universitario de Ingeniería de Sistemas. Repositorio: https://github.com/VERTEXORG1/VERTEX · Tablero: [Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2).

## Integrantes

| Integrante | Cuenta de GitHub | Programa |
|---|---|---|
| Islender Arturo Alfonso Contreras | [Arturo-Civer](https://github.com/Arturo-Civer) | Ingeniería de Sistemas |
| Jhoan Sebastián Blanco Rincón | [Jhoansbr](https://github.com/Jhoansbr) | Ingeniería de Sistemas |
| Anyul Lisbeth Martínez Jiménez | [anyulM](https://github.com/anyulM) | Ingeniería de Sistemas |
| Ronal Gabriel Ure Carrillo | [Ronduke20](https://github.com/Ronduke20) | Ingeniería de Sistemas |

## Fuentes de esta información y sus límites

Este documento usa tres fuentes. Se presentan **tal cual, sin unificarlas**, porque no siempre coinciden:

1. **Matriz de responsabilidades (RACI), marcada como PROPUESTO.** Es la asignación que acordó el equipo.
2. **Tablero de GitHub Projects** ([Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)): 8 tareas (issues #1 a #8).
   - **Los 8 issues se crearon el 29/10/2026**, después del último commit de código (27/10/2026). El tablero registra la planificación del equipo **a posteriori**; no es un seguimiento hecho al mismo tiempo que el desarrollo.
   - Las tareas no tienen fechas propias de inicio y fin: **las fechas son las de los sprints** a los que pertenecen.
3. **Historial de git.** Todos los commits los registró Islender, que integró y subió al repositorio las partes que le entregaron los compañeros.
   - Los compañeros figuran como coautores (`Co-authored-by`) en los commits donde el tablero respalda su trabajo y Islender lo confirmó.
   - Los mensajes de los 14 commits se reescribieron el 30/10/2026 para registrar esas coautorías. El contenido de los archivos, los autores y las fechas no cambiaron.

El proyecto se desarrolló **con asistencia de IA** (Claude, de Anthropic) en la escritura de código y documentación. Las decisiones, la revisión y la integración son del equipo.

## 1. Matriz de responsabilidades (PROPUESTO)

R = ejecuta · A = responde y acepta · C/I = consultados e informados.

| # | Actividad | R (ejecuta) | A (responde / acepta) | C / I | Dónde está en el repositorio |
|---|---|---|---|---|---|
| 1 | Arquitectura, SQL y ADR | Islender | Islender; TI ratifica el estándar | Jhoan, Ronal; Mantenimiento informado | [`database/`](../database), [`apps/backend/`](../apps/backend), [`docs/adr/`](adr), [`instalar.ps1`](../instalar.ps1) |
| 2 | Interfaz y C3/C4 | Jhoan | Islender | Anyul (UX), Ronal (repositorio) | [`apps/frontend/`](../apps/frontend), [`docs/diagramas/`](diagramas) |
| 3 | Requisitos, estado del arte, ficha técnica | Anyul | Islender | Mantenimiento; docentes informados | [`docs/DERS_VERTEX.docx`](DERS_VERTEX.docx) §02–§04. Ficha técnica: **no aplica** en este prototipo, porque las lecturas vienen de una base de datos de demostración y no de un equipo CERO real |
| 4 | Git, integración y evidencias | Ronal Gabriel | Islender | Jhoan, Anyul; docente informado | Tablero de GitHub Projects (no se usó Jira), [`start-vertex.ps1`](../start-vertex.ps1), [`docs/CONTRIBUIR.md`](CONTRIBUIR.md), este documento |
| 5 | Seguridad y prueba QA | Ronal + Anyul | Islender (MVP); TI para planta | Mantenimiento si hay impacto operativo | Inicio de sesión: [`apps/backend/src/domains/identity/`](../apps/backend/src/domains/identity), [`apps/frontend/src/modules/auth/`](../apps/frontend/src/modules/auth). Pruebas y middlewares: **pendientes** (ver abajo) |
| 6 | Demo, cierre y aceptación académica | Equipo completo | Equipo / docente según rúbrica | TI / Mantenimiento consultados | Sitio demo: https://vertexdashboar.netlify.app |

## 2. Tablero: tareas y sprints

| Sprint | Fechas |
|---|---|
| Sprint 1 | 15/09/2026 – 11/10/2026 |
| Sprint 2 | 12/10/2026 – 11/11/2026 |
| Sprint 3 | 12/11/2026 – 27/11/2026 |

| Issue | Tarea | Sprint | Estado (30/10/2026) | Asignados en el tablero | Parte del repositorio |
|---|---|---|---|---|---|
| [#1](https://github.com/VERTEXORG1/VERTEX/issues/1) | Carta del proyecto | 1 | Por hacer (vencida según el issue) | Ronal Gabriel, Islender | Documento fuera del repositorio |
| [#2](https://github.com/VERTEXORG1/VERTEX/issues/2) | Fase I: diagnóstico / método de captura | 1 | Hecha | Anyul, Islender | [`docs/DERS_VERTEX.docx`](DERS_VERTEX.docx) (requisitos y estado del arte) |
| [#3](https://github.com/VERTEXORG1/VERTEX/issues/3) | Fase II: diseño de caja de instrumentación | 1 | Hecha | Islender | Hardware; no está en el repositorio |
| [#4](https://github.com/VERTEXORG1/VERTEX/issues/4) | Fase III: interfaz visual | 1 | Hecha | Ronal Gabriel, Jhoan | [`apps/frontend/`](../apps/frontend) (dashboard inicial) |
| [#5](https://github.com/VERTEXORG1/VERTEX/issues/5) | Fase IV: piloto en un CERO | 2 | Hecha | Islender | [`database/`](../database), [`apps/backend/`](../apps/backend) y la evolución de [`apps/frontend/`](../apps/frontend) con los datos de CERO-010 |
| [#6](https://github.com/VERTEXORG1/VERTEX/issues/6) | Fase V: despliegue Línea 6 | 2 | En curso | Islender | Sin cambios en el repositorio todavía |
| [#7](https://github.com/VERTEXORG1/VERTEX/issues/7) | Fase VI: validación en línea | 3 | Por hacer | Ronal Gabriel, Anyul, Islender | Pendiente (validación y pruebas) |
| [#8](https://github.com/VERTEXORG1/VERTEX/issues/8) | Cierre de alcance | 3 | Por hacer | Los cuatro | Pendiente (demo y cierre) |

**Diferencia entre la matriz y el tablero:** la matriz asigna la interfaz solo a Jhoan (actividad 2) y a Ronal Gabriel Git e integración (actividad 4). El tablero asigna la interfaz visual (#4) a Jhoan **y** a Ronal Gabriel.

**Tareas todavía dentro de su rango de fechas** (al 30/10/2026):
- #6 (Sprint 2, hasta el 11/11): de Islender.
- #7 y #8 (Sprint 3, del 12/11 al 27/11): de Ronal Gabriel, Anyul, Jhoan e Islender. **Cada compañero debe subir su parte de estas tareas con su propia cuenta**, en su rama y con un pull request (ver [CONTRIBUIR.md](CONTRIBUIR.md)).

## 3. Detalle por persona

### Islender Arturo Alfonso Contreras · [Arturo-Civer](https://github.com/Arturo-Civer)
- **Matriz:** R y A de la actividad 1 (Arquitectura, SQL y ADR); A de las actividades 2 a 5; R compartido de la 6.
- **Tablero:** #3 (Sprint 1), #5 y #6 (Sprint 2); comparte #1, #2, #7 y #8.
- **Repositorio:**
  - [`database/`](../database): migraciones, procedimientos `sp_vx_*`, seeds y scripts. Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - [`apps/backend/`](../apps/backend): API REST. Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - [`apps/frontend/`](../apps/frontend), evolución del dashboard desde el 12/10/2026 (dona por ciclos, tendencia, árbol de equipos, modo demo). Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - [`docs/adr/`](adr): redactados por Islender con asistencia de IA.
  - Integración, arranque y despliegue: [`instalar.ps1`](../instalar.ps1), [`start-vertex.ps1`](../start-vertex.ps1), Netlify.

### Jhoan Sebastián Blanco Rincón · [Jhoansbr](https://github.com/Jhoansbr)
- **Matriz:** R de la actividad 2 (Interfaz y C3/C4); C/I de las actividades 1 y 4.
- **Tablero:** #4 Fase III: interfaz visual (Sprint 1, hecha), con Ronal Gabriel; comparte #8.
- **Repositorio:**
  - [`apps/frontend/`](../apps/frontend), dashboard inicial: desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Coautor del commit inicial (`99a545c`).
  - Diagramas C3/C4 ([`docs/diagramas/`](diagramas)): la matriz asigna la actividad "Interfaz y C3/C4" a Jhoan; el tablero no tiene una tarea específica para los diagramas.

### Anyul Lisbeth Martínez Jiménez · [anyulM](https://github.com/anyulM)
- **Matriz:** R de la actividad 3 (Requisitos, estado del arte, ficha técnica); R compartido de la actividad 5 (Seguridad y QA); C de la actividad 2 (UX).
- **Tablero:** #2 Fase I: diagnóstico / método de captura (Sprint 1, hecha), con Islender; comparte #7 y #8. Creó los 8 issues del tablero el 29/10/2026.
- **Repositorio:**
  - [`docs/DERS_VERTEX.docx`](DERS_VERTEX.docx), requisitos y estado del arte: desarrollado por Anyul según el tablero (#2) y la matriz; integrado y subido al repositorio por Islender. Coautora del commit que lo agregó (`a1b397b`).
  - Seguridad y QA: pendientes (ver "Estado de seguridad y pruebas").

### Ronal Gabriel Ure Carrillo · [Ronduke20](https://github.com/Ronduke20)
- **Matriz:** R de la actividad 4 (Git, integración y evidencias); R compartido de la actividad 5 (Seguridad y QA); C de las actividades 1 y 2.
- **Tablero:** #4 Fase III: interfaz visual (Sprint 1, hecha), con Jhoan; #1 Carta del proyecto (por hacer); comparte #7 y #8.
- **Repositorio:**
  - [`apps/frontend/`](../apps/frontend), dashboard inicial: desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Coautor del commit inicial (`99a545c`).
  - Evidencias y trabajo en equipo: tablero de GitHub Projects y [CONTRIBUIR.md](CONTRIBUIR.md).
  - Seguridad y QA: pendientes (ver abajo).

## 4. Estado de seguridad y pruebas

- **Pendiente: pruebas QA.** Los 8 archivos `*.spec.ts` de `apps/backend/src` están vacíos y ningún `package.json` tiene un comando `test`. La validación actual es manual, en el navegador y contra la base de demostración.
- **Pendiente: middlewares `authenticate`, `authorize` y `reauthenticate`** (`apps/backend/src/shared/middleware/`). Están vacíos, así que hoy ninguna ruta de datos exige el token JWT.
- **Implementado:** el inicio de sesión con bcrypt y JWT ([ADR 0005](adr/0005-autenticacion-jwt-bcrypt.md)) y la separación de las bases demo y real ([ADR 0004](adr/0004-bases-demo-y-real-separadas.md)). Ninguna contraseña ni secreto está en el repositorio: se leen de variables de entorno.

## 5. Arquitectura (C4)

Diagramas extraídos del DERS (§05.3 a §05.6):

| Nivel | Diagrama |
|---|---|
| 1. Contexto del sistema | [c4-nivel-1-contexto.png](diagramas/c4-nivel-1-contexto.png) |
| 2. Contenedores | [c4-nivel-2-contenedores.png](diagramas/c4-nivel-2-contenedores.png) |
| 3. Componentes | [c4-nivel-3-componentes.png](diagramas/c4-nivel-3-componentes.png) |
| 4. Código (`sp_vx_resumen_estados`) | [c4-nivel-4-codigo-sp_vx_resumen_estados.png](diagramas/c4-nivel-4-codigo-sp_vx_resumen_estados.png) |

Decisiones de arquitectura: [docs/adr/](adr).
