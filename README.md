<p align="center">
  <img src="apps/frontend/src/assets/vertex-emblema.jpg" alt="VERTEX" width="140">
</p>

<h1 align="center">VERTEX</h1>

<p align="center">
  <a href="https://vertex.sinerbyte.com"><img src="https://img.shields.io/badge/Abrir_el_dashboard-vertex.sinerbyte.com-1F3864?style=for-the-badge" alt="Abrir el dashboard"></a>
</p>

<p align="center">
  <strong><a href="https://vertex.sinerbyte.com">https://vertex.sinerbyte.com</a></strong><br>
  Respaldo: <a href="https://vertexdashboar.netlify.app">https://vertexdashboar.netlify.app</a><br>
  Sitio en <strong>modo demostración</strong>: los datos se generan en el navegador, sin backend ni base de datos.
  Las credenciales de la demo las entrega el equipo.
</p>

Plataforma industrial para monitorear las horas de operación, los estados, los eventos y el mantenimiento de los motores de los equipos aplicadores CERO de las líneas de esmaltado de Cerámica Italia S.A. (planta de Cúcuta). Prototipo con el equipo piloto CERO-010 y datos simulados.

**Objetivo general:** capturar automáticamente las horas de funcionamiento de un motor (por ejemplo, el de un equipo CERO), iniciando con el CERO-010 como prototipo, para generar información confiable que complemente los registros de SAP y apoye la transición hacia el mantenimiento basado en la condición (Taller Inception §1; DERS §03.1).

Proyecto universitario de Ingeniería de Sistemas · Repositorio: https://github.com/VERTEXORG1/VERTEX · Tablero: [Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)

---

## Contenido

- [Qué hace](#qué-hace)
- [Plan del proyecto](#plan-del-proyecto)
- [Ejecutar en local](#ejecutar-en-local)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Equipo y responsabilidades](#equipo-y-responsabilidades)
- [Estado de seguridad y pruebas](#estado-de-seguridad-y-pruebas)
- [Documentación](#documentación)
- [Asistencia de IA](#asistencia-de-ia)

## Qué hace

- **Dona por ciclos entre mantenimientos:** un sector por cada ciclo del período consultado, con el tiempo en encendido, apagado, evento y mantenimiento. Los botones I, II, III… muestran un ciclo solo.
- **Estado del motor**, **tabla "Resumen del período"** con los bloques de estado y **tendencia** de corriente, vibración, temperatura y voltaje (vista Resumen y Detalle).
- **Árbol de equipos** (área → sección → grupo → equipo → componente) y selector de período (7, 15, 30 días, todo o un rango de fechas).
- El cálculo oficial de estados y horas vive en el procedimiento `sp_vx_resumen_estados` de SQL Server ([ADR 0001](docs/adr/0001-logica-en-procedimientos-almacenados.md)).
- Inicio de sesión con roles, bloqueo por intentos fallidos, recuperación de contraseña por el administrador y alta de usuarios sin autorregistro ([ADR 0007](docs/adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md)).

## Plan del proyecto

Tres fases de dos sprints, del 06/08 al 30/11/2026 (Taller Inception §6, DERS §06 y Proyecto Integrador §25). Las fechas y los responsables son de planificación, no un registro de ejecución.

| Fase | Sprints |
|---|---|
| **Fase 1** · Levantamiento y estructura del negocio (06/08–20/09) | S1 Contexto y objetivos (06/08–28/08) · S2 Requisitos y reglas (29/08–20/09) |
| **Fase 2** · Base de datos demo y dashboard (21/09–25/10) | S3 Base de datos (21/09–08/10) · S4 Dashboard en modo demo (09/10–25/10) |
| **Fase 3** · Integración, seguridad y cierre (26/10–30/11) | S5 API, conexión y acceso (26/10–12/11) · S6 Pruebas, documentación y aceptación (13/11–30/11) |

- **Entregable (hasta el 30/11/2026):** VERTEX validado con la base de demostración `VERTEX_DEMO` (654.470 registros del CERO-010): aceptación del dashboard, conexión entre el frontend, la API y la base de datos, y visualización de los datos por fechas, con acceso por roles.
- **Evolución futura (no son fases del semestre ni tienen tareas en el tablero):** **Etapa A**, prototipo y piloto físico en el CERO-010 de la Línea 6; **Etapa B**, expansión a los demás equipos, consumo energético por lote e integración con SAP/MPR.
- **Fuera del semestre:** captura física, despliegue en la Línea 6, consumo por lote, SAP/MPR, Directorio Activo y respaldos.
- **Tareas:** 30, una por issue en el [tablero](https://github.com/orgs/VERTEXORG1/projects/2), con milestone por sprint y etiqueta por fase. Reparto y correspondencia con la matriz en [docs/EQUIPO.md](docs/EQUIPO.md).

## Ejecutar en local

Requisitos: Windows, SQL Server 2022 con `sqlcmd`, Node.js (probado con la versión 24) y PowerShell.

### 1. Base de datos
Detalle completo en [docs/INSTALL_DATABASE.md](docs/INSTALL_DATABASE.md) y [database/README.md](database/README.md).

```powershell
# Contraseñas de los logins SQL, solo en la sesión (nunca en archivos)
$env:VERTEX_DEMO_APP_USER_PWD = "<define-tu-contraseña>"
$env:VERTEX_REAL_APP_USER_PWD = "<define-tu-contraseña>"

# Desde la raíz del repositorio: crea VERTEX_DEMO y VERTEX_REAL, migraciones, procedimientos y seeds
.\instalar.ps1
```

### 2. Variables de entorno
Copia cada `.env.example` a `.env` en la misma carpeta y completa los valores: [`.env.example`](.env.example) (raíz), [`apps/backend/.env.example`](apps/backend/.env.example) y [`apps/frontend/.env.example`](apps/frontend/.env.example). Ningún `.env` se sube a git.

### 3. Datos de demostración (opcional)
Mediciones por minuto de CERO-010 desde el 13/07/2026 (654.470 registros en la base de demostración actual, generados con semilla fija; no están versionados). Requisitos previos en [database/README.md](database/README.md).

```powershell
cd apps/backend
npm install
npm run seed:mediciones
```

### 4. Arrancar

**Opción A: todo en uno.** Arranca SQL Server, el backend, el frontend y abre el navegador cuando todo responde.

```powershell
powershell -ExecutionPolicy Bypass -File start-vertex.ps1
```

**Opción B: cada parte por separado**, en dos terminales:

```powershell
cd apps/backend
npm install
npm run dev        # API en http://localhost:3000 (GET /health para comprobarla)
```

```powershell
cd apps/frontend
npm install
npm run dev        # Dashboard en http://localhost:5173
```

Otros comandos: `npm run typecheck`, `npm test` y `npm run build` en `apps/backend`; `npm run lint`, `npm test` y `npm run build` en `apps/frontend`.

## Estructura del repositorio

| Carpeta | Qué contiene | Responsable (R según la matriz) |
|---|---|---|
| [`apps/frontend/`](apps/frontend) | Dashboard web: React 19, TypeScript, Vite 8 y CSS Modules | Jhoan (actividad 2) |
| [`apps/backend/`](apps/backend) | API REST: Node.js, Express 5, TypeScript y `mssql` | Islender (actividad 1) |
| [`database/`](database) | SQL Server: migraciones, procedimientos `sp_vx_*`, seeds y scripts | Islender (actividad 1) |
| [`docs/`](docs) | DERS, diagramas C4, ADR, equipo y guías | Varios (ver [docs/README.md](docs/README.md)) |
| [`scripts/`](scripts) | `create_demo_users.ts`: contraseñas de los usuarios demo desde variables de entorno | Islender (integración) |
| [`packages/shared/`](packages/shared) | Contratos TypeScript compartidos (vacíos por ahora) | Pendiente |
| [`instalar.ps1`](instalar.ps1), [`start-vertex.ps1`](start-vertex.ps1) | Instalador de las bases y arranque de desarrollo | Islender (integración) |

## Equipo y responsabilidades

Detalle completo, con las fuentes y sus límites: **[docs/EQUIPO.md](docs/EQUIPO.md)**.

Las fuentes se presentan tal cual, sin unificarlas:
- **El plan (Taller Inception, DERS y Proyecto Integrador)** define las 30 tareas con su responsable principal y su apoyo. Son fechas y responsables de planificación, no un registro de ejecución.
- **El tablero** se reorganizó al plan el 31/10/2026: un issue por tarea. Las tareas 1 a 20 se cerraron según el plan, citando solo los commits o archivos que existen.
- **Islender integró y subió al repositorio todo el código** (el primer commit es del 12/10/2026). Los compañeros figuran como coautores en los commits donde el tablero respalda su trabajo.

### Matriz de responsabilidades (DERS §06.3)

| # | Actividad | R (ejecuta) | A (acepta) | C / I |
|---|---|---|---|---|
| 1 | Arquitectura, SQL y ADR | Islender | Islender; TI ratifica el estándar | Jhoan, Anyul y Ronal; Mantenimiento informado |
| 2 | Interfaz y diagramas C3/C4 | Jhoan | Islender | Anyul (pruebas de la interfaz); Ronal (repositorio) |
| 3 | Requisitos, estado del arte, ficha técnica, DERS y Taller | Anyul | Islender | Mantenimiento y TI consultados; docentes informados |
| 4 | Repositorio, tablero, integración y evidencias | Ronal | Islender | Jhoan y Anyul; docente informado |
| 5 | Seguridad y pruebas con capturas | Islender (seguridad y aceptación); Ronal (conexión); Anyul (visualización por fechas) | Islender; TI para planta | Mantenimiento si hay impacto operativo |
| 6 | Demo, cierre y aceptación académica | Islender con el equipo | Equipo y docente según rúbrica | TI y Mantenimiento consultados |

### Por persona

| Integrante | Tareas del plan como principal | Parte del repositorio |
|---|---|---|
| **Islender Arturo Alfonso Contreras** ([Arturo-Civer](https://github.com/Arturo-Civer)), gerente del proyecto | 9 (30 %): 1, 6, 8, 11, 14, 21, 23, 28, 30 | [`database/`](database), [`apps/backend/`](apps/backend), evolución de [`apps/frontend/`](apps/frontend) desde el 12/10, [`docs/adr/`](docs/adr): desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender. Fase B de identidad (30/10/2026): desarrollada por Islender con asistencia de IA |
| **Anyul Lisbeth Martínez Jiménez** ([anyulM](https://github.com/anyulM)) | 9 (30 %): 2, 4, 7, 9, 15, 18, 24, 27, 29 | Requisitos y estado del arte de [`docs/DERS_VERTEX.docx`](docs/DERS_VERTEX.docx): desarrollado por Anyul según el tablero (#2); integrado y subido al repositorio por Islender |
| **Jhoan Sebastián Blanco Rincón** ([Jhoansbr](https://github.com/Jhoansbr)) | 6 (20 %): 3, 10, 16, 17, 19, 22 | Dashboard inicial de [`apps/frontend/`](apps/frontend): desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender |
| **Ronal Gabriel Ure Carrillo** ([Ronduke20](https://github.com/Ronduke20)) | 6 (20 %): 5, 12, 13, 20, 25, 26 | Dashboard inicial de [`apps/frontend/`](apps/frontend): desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Tablero y [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md) |

**Tareas abiertas:** 21 a 25 (sprint S5, en progreso) y 26 a 30 (sprint S6, del 13/11 al 30/11). Cada integrante sube su parte con su propia cuenta, en su rama y con un pull request: ver [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md).

## Estado de seguridad y pruebas

| Tema | Estado |
|---|---|
| Inicio de sesión con bcrypt y JWT (`POST /api/identity/login`) | Implementado ([ADR 0005](docs/adr/0005-autenticacion-jwt-bcrypt.md)) |
| Middlewares `authenticate`, `authorize` y `reauthenticate` | Implementados en las rutas de identidad. **Pendiente:** las rutas de datos (`/api/equipos/...`) todavía no exigen el token |
| Bloqueo, recuperación de contraseña y alta de usuarios | Implementado en `VERTEX_DEMO` (V007, [ADR 0007](docs/adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md)); **pendiente** aplicar V007 en `VERTEX_REAL` y la ratificación de TI |
| Pruebas automatizadas | `npm test` con Vitest: 21 pruebas en el backend (Supertest) y 7 en el frontend. Los otros 6 `*.spec.ts` del backend siguen vacíos. Las pruebas con capturas del plan (tareas 26 a 28, S6) están en [docs/entregables_pruebas](docs/entregables_pruebas/LEEME.md) |
| Separación de datos demo y reales | Implementado: bases `VERTEX_DEMO` y `VERTEX_REAL` ([ADR 0004](docs/adr/0004-bases-demo-y-real-separadas.md)) |
| Contraseñas y secretos | Se leen de variables de entorno; ningún `.env` se versiona |
| Autenticación corporativa (Directorio Activo) | Prevista, no implementada |

## Documentación

| Documento | Contenido |
|---|---|
| [docs/DERS_VERTEX.docx](docs/DERS_VERTEX.docx) | Documento de especificación: problema, estado del arte, objetivos, requisitos, arquitectura C4, plan (§06), pruebas y trazabilidad |
| [docs/Taller_Inception_VERTEX.docx](docs/Taller_Inception_VERTEX.docx) | Taller Inception: visión, usuarios, MoSCoW, riesgos, hoja de ruta y las 30 tareas por sprint (§6.2) |
| [docs/Proyecto_Integrador_VERTEX.docx](docs/Proyecto_Integrador_VERTEX.docx) | Proyecto Integrador: empresa, caso de negocio, objetivos, presupuesto de la Etapa A y plan de acción (§25) |
| [docs/diagramas/](docs/diagramas) | C4: [contexto](docs/diagramas/c4-nivel-1-contexto.png), [contenedores](docs/diagramas/c4-nivel-2-contenedores.png), [componentes](docs/diagramas/c4-nivel-3-componentes.png) y [código de `sp_vx_resumen_estados`](docs/diagramas/c4-nivel-4-codigo-sp_vx_resumen_estados.png) |
| [docs/adr/](docs/adr) | Decisiones de arquitectura (ADR 0001 a 0007) |
| [docs/entregables_pruebas/](docs/entregables_pruebas/LEEME.md) | Pruebas ejecutadas el 11/11/2026: unitarias (caja blanca y caja negra), aceptación, fichas funcionales, Lighthouse, matriz de criterios y guía, con sus capturas numeradas |
| [docs/EQUIPO.md](docs/EQUIPO.md) | Plan, reparto de las 30 tareas, matriz y su correspondencia con las tareas, y detalle por persona |
| [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md) | Cómo trabajar con ramas, commits propios y pull requests |
| [docs/INSTALL_DATABASE.md](docs/INSTALL_DATABASE.md) | Instalación paso a paso de las bases |
| [docs/flujo-de-datos.md](docs/flujo-de-datos.md) | Ruta de los datos desde cada acción del dashboard hasta SQL Server |
| [docs/equipos-mapping.md](docs/equipos-mapping.md) | Equipos y motores de la base frente a los del dashboard |

## Asistencia de IA

El proyecto se desarrolló con asistencia de IA (Claude, de Anthropic) en la escritura de código y documentación. Las decisiones, la revisión y la integración son del equipo.
