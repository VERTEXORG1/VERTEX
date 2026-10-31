# Equipo y responsabilidades de VERTEX

Proyecto universitario de Ingeniería de Sistemas. Repositorio: https://github.com/VERTEXORG1/VERTEX · Tablero: [Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2).

**Objetivo general:** capturar automáticamente las horas de funcionamiento de un motor (por ejemplo, el de un equipo CERO), iniciando con el CERO-010 como prototipo, para generar información confiable que complemente los registros de SAP y apoye la transición hacia el mantenimiento basado en la condición.

## Integrantes

| Integrante | Cuenta de GitHub | Programa |
|---|---|---|
| Islender Arturo Alfonso Contreras (gerente del proyecto) | [Arturo-Civer](https://github.com/Arturo-Civer) | Ingeniería de Sistemas |
| Jhoan Sebastián Blanco Rincón | [Jhoansbr](https://github.com/Jhoansbr) | Ingeniería de Sistemas |
| Anyul Lisbeth Martínez Jiménez | [anyulM](https://github.com/anyulM) | Ingeniería de Sistemas |
| Ronal Gabriel Ure Carrillo | [Ronduke20](https://github.com/Ronduke20) | Ingeniería de Sistemas |

## Fuentes de esta información y sus límites

Este documento usa tres fuentes. Se presentan **tal cual, sin unificarlas**, porque no siempre coinciden:

1. **Plan del proyecto** (Taller Inception §6, DERS §06 y Proyecto Integrador §25, versión del 30/10/2026): las 3 fases, los 6 sprints, las 30 tareas con su responsable principal y su apoyo, y la matriz de responsabilidades. **Las fechas y los responsables son de planificación, no un registro de ejecución.**
2. **Tablero de GitHub Projects** ([Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)):
   - Los 8 issues originales (#1 a #8) se crearon el 29/10/2026, después del último commit de código de ese momento (27/10/2026).
   - El 31/10/2026 el tablero se reorganizó al plan: un issue por cada una de las 30 tareas (5 issues originales reutilizados y 25 nuevos), un milestone por sprint, las etiquetas "Fase 1" a "Fase 3" y "Evolución futura", y los campos Fase, Inicio y Fin.
   - Las tareas 1 a 20 se cerraron **según el plan**: su comentario de cierre cita solo los commits o archivos que existen y marca "fecha real: [PENDIENTE]" cuando no hay evidencia en el repositorio.
3. **Historial de git.** Todos los commits los registró Islender, que integró y subió al repositorio las partes que le entregaron los compañeros.
   - El primer commit es del 12/10/2026, así que las fechas de los commits no coinciden con las fechas de plan de las tareas anteriores.
   - Los compañeros figuran como coautores (`Co-authored-by`) en los commits donde el tablero respalda su trabajo y Islender lo confirmó.
   - Los mensajes de los 14 commits se reescribieron el 30/10/2026 para registrar esas coautorías. El contenido de los archivos, los autores y las fechas no cambiaron.

El proyecto se desarrolló **con asistencia de IA** (Claude, de Anthropic) en la escritura de código y documentación. Las decisiones, la revisión y la integración son del equipo.

## 1. Plan del proyecto: 3 fases y 6 sprints

| Fase | Sprint | Fechas | Tareas |
|---|---|---|---|
| Fase 1 · Levantamiento y estructura del negocio (06/08–20/09/2026) | S1 – Contexto y objetivos | 06/08–28/08 | 1–5 |
| | S2 – Requisitos y reglas | 29/08–20/09 | 6–10 |
| Fase 2 · Base de datos demo y dashboard (21/09–25/10/2026) | S3 – Base de datos | 21/09–08/10 | 11–15 |
| | S4 – Dashboard en modo demo | 09/10–25/10 | 16–20 |
| Fase 3 · Integración, seguridad y cierre (26/10–30/11/2026) | S5 – API, conexión y acceso | 26/10–12/11 | 21–25 |
| | S6 – Pruebas, documentación y aceptación | 13/11–30/11 | 26–30 |

**Alcance del entregable (hasta el 30/11/2026):** VERTEX validado con la base de demostración `VERTEX_DEMO` (654.470 registros del CERO-010): aceptación del dashboard, conexión entre el frontend, la API y la base de datos, y visualización de los datos por fechas, con acceso por roles.

**Evolución futura (posterior al 30/11/2026; sin tareas ni fechas en el tablero):**
- **Etapa A:** prototipo y piloto físico en el CERO-010 de la Línea 6 (captura física, despliegue en la Línea 6, Directorio Activo y respaldos según TI).
- **Etapa B:** expansión (demás equipos, consumo energético por lote e integración con SAP/MPR).

Los issues #3 (caja de instrumentación) y #6 (despliegue en la Línea 6) llevan la etiqueta "Evolución futura" (Etapa A).

## 2. Reparto de tareas del plan

Fuente: Taller Inception §6.2 y DERS §06.2 y §06.3. Estado en el tablero al 31/10/2026: 1–20 cerradas según el plan, 21–25 en progreso, 26–30 por hacer.

| Tarea | Issue | Fechas de plan | Principal (apoyo) |
|---|---|---|---|
| 1. Diagnóstico del problema y caso de negocio | [#1](https://github.com/VERTEXORG1/VERTEX/issues/1) | 06/08–14/08 | Islender (Anyul) |
| 2. Objetivo general y objetivos específicos | [#9](https://github.com/VERTEXORG1/VERTEX/issues/9) | 10/08–19/08 | Anyul (Islender) |
| 3. Mapa de partes interesadas | [#10](https://github.com/VERTEXORG1/VERTEX/issues/10) | 12/08–21/08 | Jhoan (Anyul) |
| 4. Estado del arte y ficha técnica | [#11](https://github.com/VERTEXORG1/VERTEX/issues/11) | 14/08–26/08 | Anyul (Ronal) |
| 5. Acuerdos del equipo y plan de trabajo | [#12](https://github.com/VERTEXORG1/VERTEX/issues/12) | 17/08–28/08 | Ronal (Islender) |
| 6. Reuniones con TI: red, alojamiento, stack, seguridad, roles y respaldo | [#13](https://github.com/VERTEXORG1/VERTEX/issues/13) | 31/08–09/09 | Islender (Anyul) |
| 7. Reuniones con Mantenimiento: variables, anomalías y ciclos | [#14](https://github.com/VERTEXORG1/VERTEX/issues/14) | 02/09–11/09 | Anyul (Islender) |
| 8. Reglas de negocio: estados, tolerancia de 30 minutos, regla del 30 % y corriente de 0,1 A | [#15](https://github.com/VERTEXORG1/VERTEX/issues/15) | 07/09–15/09 | Islender (Anyul) |
| 9. Matriz de requisitos funcionales y no funcionales | [#2](https://github.com/VERTEXORG1/VERTEX/issues/2) | 09/09–17/09 | Anyul (Ronal) |
| 10. Mapa de procesos con carriles (BPMN) | [#16](https://github.com/VERTEXORG1/VERTEX/issues/16) | 11/09–18/09 | Jhoan (Anyul) |
| 11. Modelo de datos con los lineamientos de TI | [#17](https://github.com/VERTEXORG1/VERTEX/issues/17) | 21/09–29/09 | Islender (Anyul) |
| 12. Migraciones y bases VERTEX_DEMO y VERTEX_REAL | [#18](https://github.com/VERTEXORG1/VERTEX/issues/18) | 28/09–02/10 | Ronal (Islender) |
| 13. Generación de la base demo del CERO-010 | [#19](https://github.com/VERTEXORG1/VERTEX/issues/19) | 30/09–06/10 | Ronal (Islender) |
| 14. Procedimientos almacenados sp_vx_* | [#5](https://github.com/VERTEXORG1/VERTEX/issues/5) | 24/09–07/10 | Islender (Anyul) |
| 15. Pruebas de los procedimientos contra la base demo | [#20](https://github.com/VERTEXORG1/VERTEX/issues/20) | 05/10–08/10 | Anyul (Islender) |
| 16. Diseño de la interfaz: colores corporativos, tipografía Neutra y diseño responsivo | [#4](https://github.com/VERTEXORG1/VERTEX/issues/4) | 09/10–13/10 | Jhoan (Anyul) |
| 17. Árbol de equipos y selector de período (7, 15, 30 días o rango) | [#21](https://github.com/VERTEXORG1/VERTEX/issues/21) | 12/10–17/10 | Jhoan (Islender) |
| 18. Dona de distribución por estado y estado actual del motor | [#22](https://github.com/VERTEXORG1/VERTEX/issues/22) | 14/10–21/10 | Anyul (Jhoan) |
| 19. Tabla de bloques y tendencias | [#23](https://github.com/VERTEXORG1/VERTEX/issues/23) | 16/10–22/10 | Jhoan (Islender) |
| 20. Modo demostración y publicación del sitio | [#24](https://github.com/VERTEXORG1/VERTEX/issues/24) | 20/10–25/10 | Ronal (Jhoan) |
| 21. API REST: autenticación, equipos, resumen y tendencias | [#25](https://github.com/VERTEXORG1/VERTEX/issues/25) | 26/10–03/11 | Islender (Ronal) |
| 22. Conexión entre el frontend, la API y la base de datos | [#26](https://github.com/VERTEXORG1/VERTEX/issues/26) | 30/10–06/11 | Jhoan (Islender) |
| 23. Inicio de sesión, roles y bloqueo de cuentas | [#27](https://github.com/VERTEXORG1/VERTEX/issues/27) | 26/10–05/11 | Islender (Anyul) |
| 24. Recuperación de contraseña y alta de usuarios por el administrador | [#28](https://github.com/VERTEXORG1/VERTEX/issues/28) | 02/11–10/11 | Anyul (Islender) |
| 25. Repositorio y tablero de GitHub, ADR y diagramas C3/C4 | [#29](https://github.com/VERTEXORG1/VERTEX/issues/29) | 26/10–12/11 | Ronal (Islender y Jhoan) |
| 26. Pruebas de conexión entre frontend, API y base de datos, con capturas | [#30](https://github.com/VERTEXORG1/VERTEX/issues/30) | 13/11–20/11 | Ronal (Anyul) |
| 27. Pruebas de visualización de datos por fechas, con capturas | [#31](https://github.com/VERTEXORG1/VERTEX/issues/31) | 16/11–23/11 | Anyul (Islender) |
| 28. Pruebas de seguridad de acceso, con capturas | [#32](https://github.com/VERTEXORG1/VERTEX/issues/32) | 18/11–25/11 | Islender (Ronal) |
| 29. DERS final y Taller Inception final | [#33](https://github.com/VERTEXORG1/VERTEX/issues/33) | 20/11–27/11 | Anyul (Islender) |
| 30. Pruebas de aceptación, demo y entrega del MVP | [#8](https://github.com/VERTEXORG1/VERTEX/issues/8) | 26/11–30/11 | Islender (equipo) |

**Carga como responsable principal** (DERS §06.3): Islender 9 tareas (1, 6, 8, 11, 14, 21, 23, 28, 30), 30 %; Anyul 9 (2, 4, 7, 9, 15, 18, 24, 27, 29), 30 %; Jhoan 6 (3, 10, 16, 17, 19, 22), 20 %; Ronal 6 (5, 12, 13, 20, 25, 26), 20 %. Todos participan además como apoyo.

**Issues antiguos:** #7 (validación en línea) se cerró con una nota que remite a T26, T27 y T28; #3 y #6 pasaron a "Evolución futura".

## 3. Matriz de responsabilidades

R = ejecuta · A = responde y acepta · C/I = consultados e informados. Versión del DERS §06.3 (los responsables son los asignados en la planificación).

| # | Actividad | R (ejecuta) | A (responde / acepta) | C / I |
|---|---|---|---|---|
| 1 | Arquitectura, SQL y ADR | Islender | Islender; TI ratifica el estándar | Jhoan, Anyul y Ronal; Mantenimiento informado |
| 2 | Interfaz y diagramas C3/C4 | Jhoan | Islender | Anyul (pruebas de la interfaz); Ronal (repositorio) |
| 3 | Requisitos, estado del arte, ficha técnica, DERS y Taller | Anyul | Islender | Mantenimiento y TI consultados; docentes informados |
| 4 | Repositorio, tablero, integración y evidencias | Ronal | Islender | Jhoan y Anyul; docente informado |
| 5 | Seguridad y pruebas con capturas | Islender (seguridad y aceptación); Ronal (conexión); Anyul (visualización por fechas) | Islender; TI para planta | Mantenimiento si hay impacto operativo |
| 6 | Demo, cierre y aceptación académica | Islender con el equipo | Equipo y docente según rúbrica | TI y Mantenimiento consultados |

La versión anterior de este documento (marcada como PROPUESTO) asignaba la actividad 5 a Ronal y Anyul, y la 6 al equipo completo; el DERS la reemplaza.

### Correspondencia entre las actividades y las 30 tareas

Los documentos fuente no detallan esta correspondencia: es una **propuesta por contenido** de este documento, donde cada tarea aparece una sola vez.

| # | Actividad | Tareas |
|---|---|---|
| 1 | Arquitectura, SQL y ADR | 8, 11, 12, 13, 14, 21 |
| 2 | Interfaz y diagramas C3/C4 | 16, 17, 18, 19, 20, 22 |
| 3 | Requisitos, estado del arte, ficha técnica, DERS y Taller | 1, 2, 3, 4, 6, 7, 9, 10, 29 |
| 4 | Repositorio, tablero, integración y evidencias | 5, 25 (incluye los ADR y los diagramas C3/C4 en el repositorio) |
| 5 | Seguridad y pruebas con capturas | 15, 23, 24, 26, 27, 28 |
| 6 | Demo, cierre y aceptación académica | 30 |

## 4. Detalle por persona

Las tareas de plan de cada integrante están en la sección 2. Lo que sigue registra quién desarrolló cada parte del repositorio.

### Islender Arturo Alfonso Contreras · [Arturo-Civer](https://github.com/Arturo-Civer)
- **Repositorio:**
  - [`database/`](../database): migraciones, procedimientos `sp_vx_*`, seeds y scripts. Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - [`apps/backend/`](../apps/backend): API REST. Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - [`apps/frontend/`](../apps/frontend), evolución del dashboard desde el 12/10/2026 (dona por ciclos, tendencia, árbol de equipos, modo demo). Desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender.
  - Fase B de identidad (30/10/2026, commits `9a475da` y `6ddee65`): middlewares, bloqueo, recuperación por el administrador, alta de usuarios y pruebas. Desarrollada por Islender con asistencia de IA; integrada y subida al repositorio por Islender.
  - [`docs/adr/`](adr): redactados por Islender con asistencia de IA.
  - Integración, arranque y despliegue: [`instalar.ps1`](../instalar.ps1), [`start-vertex.ps1`](../start-vertex.ps1), Netlify.

### Jhoan Sebastián Blanco Rincón · [Jhoansbr](https://github.com/Jhoansbr)
- **Repositorio:**
  - [`apps/frontend/`](../apps/frontend), dashboard inicial: desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Coautor del commit inicial (`99a545c`).
  - Diagramas C3/C4 ([`docs/diagramas/`](diagramas)): la matriz asigna la actividad "Interfaz y diagramas C3/C4" a Jhoan.

### Anyul Lisbeth Martínez Jiménez · [anyulM](https://github.com/anyulM)
- Creó los 8 issues del tablero el 29/10/2026 (los originales, #1 a #8).
- **Repositorio:**
  - [`docs/DERS_VERTEX.docx`](DERS_VERTEX.docx), requisitos y estado del arte: desarrollado por Anyul según el tablero (#2) y la matriz; integrado y subido al repositorio por Islender. Coautora del commit que lo agregó (`a1b397b`).

### Ronal Gabriel Ure Carrillo · [Ronduke20](https://github.com/Ronduke20)
- **Repositorio:**
  - [`apps/frontend/`](../apps/frontend), dashboard inicial: desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Coautor del commit inicial (`99a545c`).
  - Evidencias y trabajo en equipo: tablero de GitHub Projects y [CONTRIBUIR.md](CONTRIBUIR.md).

**Cada compañero sube su parte de las tareas abiertas con su propia cuenta**, en su rama y con un pull request (ver [CONTRIBUIR.md](CONTRIBUIR.md)).

## 5. Estado de seguridad y pruebas (31/10/2026)

- **Implementado:**
  - inicio de sesión con bcrypt y JWT ([ADR 0005](adr/0005-autenticacion-jwt-bcrypt.md));
  - middlewares `authenticate`, `authorize` y `reauthenticate` (`apps/backend/src/shared/middleware/`);
  - bloqueo de 15 minutos tras 5 intentos fallidos, por usuario y por IP;
  - recuperación de contraseña por el administrador y alta de usuarios sin autorregistro ([ADR 0007](adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md)), con la migración V007 y cinco procedimientos aplicados en `VERTEX_DEMO`;
  - pruebas automatizadas con Vitest (`npm test`): 21 en el backend (Supertest) y 7 en el frontend (mensajes del inicio de sesión);
  - separación de las bases demo y real ([ADR 0004](adr/0004-bases-demo-y-real-separadas.md)); ninguna contraseña ni secreto está en el repositorio.
- **Pendiente:**
  - las rutas de datos (`/api/equipos/...`) todavía no exigen el token;
  - V007 no está aplicada en `VERTEX_REAL`;
  - los otros 6 archivos `*.spec.ts` siguen vacíos;
  - las pruebas con capturas del plan (tareas 26 a 28) son del sprint S6;
  - el ADR 0007 está pendiente de ratificación de TI.

## 6. Arquitectura (C4)

Diagramas extraídos del DERS (§05.3 a §05.6):

| Nivel | Diagrama |
|---|---|
| 1. Contexto del sistema | [c4-nivel-1-contexto.png](diagramas/c4-nivel-1-contexto.png) |
| 2. Contenedores | [c4-nivel-2-contenedores.png](diagramas/c4-nivel-2-contenedores.png) |
| 3. Componentes | [c4-nivel-3-componentes.png](diagramas/c4-nivel-3-componentes.png) |
| 4. Código (`sp_vx_resumen_estados`) | [c4-nivel-4-codigo-sp_vx_resumen_estados.png](diagramas/c4-nivel-4-codigo-sp_vx_resumen_estados.png) |

Decisiones de arquitectura: [docs/adr/](adr).
