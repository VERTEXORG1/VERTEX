<p align="center">
  <img src="apps/frontend/src/assets/vertex-emblema.jpg" alt="VERTEX" width="140">
</p>

<h1 align="center">VERTEX</h1>

<p align="center">
  <a href="https://vertexdashboar.netlify.app"><img src="https://img.shields.io/badge/Abrir_el_dashboard-vertexdashboar.netlify.app-1F3864?style=for-the-badge" alt="Abrir el dashboard"></a>
</p>

<p align="center">
  <strong><a href="https://vertexdashboar.netlify.app">https://vertexdashboar.netlify.app</a></strong><br>
  Sitio en <strong>modo demostración</strong>: los datos se generan en el navegador, sin backend ni base de datos.
  Las credenciales de la demo las entrega el equipo.
</p>

Plataforma industrial para monitorear las horas de operación, los estados, los eventos y el mantenimiento de los motores de los equipos aplicadores CERO de las líneas de esmaltado de Cerámica Italia S.A. (planta de Cúcuta). Prototipo con el equipo piloto CERO-010 y datos simulados.

**Objetivo general:** capturar automáticamente las horas de funcionamiento de los equipos CERO, empezando por el CERO-010, para generar información confiable que complemente en el futuro los registros de SAP y apoye la transición hacia el mantenimiento basado en la condición (DERS §03.1).

Proyecto universitario de Ingeniería de Sistemas · Repositorio: https://github.com/VERTEXORG1/VERTEX · Tablero: [Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)

---

## Contenido

- [Qué hace](#qué-hace)
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
Mediciones por minuto de CERO-010 desde el 13/07/2026 (unos 650.000 registros generados con semilla fija; no están versionados). Requisitos previos en [database/README.md](database/README.md).

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

Otros comandos: `npm run typecheck` y `npm run build` en `apps/backend`; `npm run lint` y `npm run build` en `apps/frontend`.

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

Las tres fuentes se presentan tal cual, sin unificarlas:
- **La matriz de responsabilidades es la asignación PROPUESTA** por el equipo.
- **Los 8 issues del tablero se crearon el 29/10/2026**, después del último commit de código (27/10/2026). Sus fechas son las de los sprints: no es un seguimiento hecho al mismo tiempo que el desarrollo.
- **Islender integró y subió al repositorio todo el código.** Los compañeros figuran como coautores en los commits donde el tablero respalda su trabajo.

### Matriz de responsabilidades (PROPUESTO)

| # | Actividad | R (ejecuta) | A (acepta) | C / I |
|---|---|---|---|---|
| 1 | Arquitectura, SQL y ADR | Islender | Islender; TI ratifica el estándar | Jhoan, Ronal; Mantenimiento informado |
| 2 | Interfaz y C3/C4 | Jhoan | Islender | Anyul (UX), Ronal (repositorio) |
| 3 | Requisitos, estado del arte, ficha técnica | Anyul | Islender | Mantenimiento; docentes informados |
| 4 | Git, integración y evidencias | Ronal Gabriel | Islender | Jhoan, Anyul; docente informado |
| 5 | Seguridad y prueba QA | Ronal + Anyul | Islender (MVP); TI para planta | Mantenimiento si hay impacto operativo |
| 6 | Demo, cierre y aceptación académica | Equipo completo | Equipo / docente según rúbrica | TI / Mantenimiento consultados |

La ficha técnica (actividad 3) no aplica en este prototipo: las lecturas vienen de una base de datos de demostración y no de un equipo CERO real. En el tablero se usó GitHub Projects; no se usó Jira.

### Por persona

Sprints del tablero: **Sprint 1** del 15/09 al 11/10/2026 · **Sprint 2** del 12/10 al 11/11/2026 · **Sprint 3** del 12/11 al 27/11/2026.

| Integrante | Programa | Actividades que ejecuta (R) | Tareas del tablero | Parte del repositorio |
|---|---|---|---|---|
| **Islender Arturo Alfonso Contreras** ([Arturo-Civer](https://github.com/Arturo-Civer)) | Ingeniería de Sistemas | 1 Arquitectura, SQL y ADR; 6 Demo y cierre | #3 Caja de instrumentación (S1, hecha); #5 Piloto en un CERO (S2, hecha); #6 Despliegue Línea 6 (S2, en curso); comparte #1, #2, #7 y #8 | [`database/`](database), [`apps/backend/`](apps/backend), evolución de [`apps/frontend/`](apps/frontend) desde el 12/10, [`docs/adr/`](docs/adr): desarrollado por Islender según el tablero (#5); integrado y subido al repositorio por Islender |
| **Jhoan Sebastián Blanco Rincón** ([Jhoansbr](https://github.com/Jhoansbr)) | Ingeniería de Sistemas | 2 Interfaz y C3/C4; 6 Demo y cierre | #4 Interfaz visual (S1, hecha), con Ronal Gabriel; comparte #8 | Dashboard inicial de [`apps/frontend/`](apps/frontend): desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender |
| **Anyul Lisbeth Martínez Jiménez** ([anyulM](https://github.com/anyulM)) | Ingeniería de Sistemas | 3 Requisitos y estado del arte; 5 Seguridad y QA; 6 Demo y cierre | #2 Diagnóstico / método de captura (S1, hecha), con Islender; comparte #7 y #8 | Requisitos y estado del arte de [`docs/DERS_VERTEX.docx`](docs/DERS_VERTEX.docx): desarrollado por Anyul según el tablero (#2); integrado y subido al repositorio por Islender |
| **Ronal Gabriel Ure Carrillo** ([Ronduke20](https://github.com/Ronduke20)) | Ingeniería de Sistemas | 4 Git, integración y evidencias; 5 Seguridad y QA; 6 Demo y cierre | #4 Interfaz visual (S1, hecha), con Jhoan; #1 Carta del proyecto (S1, por hacer); comparte #7 y #8 | Dashboard inicial de [`apps/frontend/`](apps/frontend): desarrollado por Jhoan y Ronal Gabriel según el tablero (#4); integrado y subido al repositorio por Islender. Tablero y [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md) |

**Tareas abiertas:** #7 Validación en línea y #8 Cierre de alcance (Sprint 3, del 12/11 al 27/11). Cada integrante sube su parte con su propia cuenta, en su rama y con un pull request: ver [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md).

## Estado de seguridad y pruebas

| Tema | Estado |
|---|---|
| Inicio de sesión con bcrypt y JWT (`POST /api/identity/login`) | Implementado ([ADR 0005](docs/adr/0005-autenticacion-jwt-bcrypt.md)) |
| Middlewares `authenticate`, `authorize` y `reauthenticate` | **Pendiente.** Los archivos de `apps/backend/src/shared/middleware/` están vacíos: hoy ninguna ruta de datos exige el token |
| Pruebas automatizadas (QA) | **Pendiente.** Los 8 archivos `*.spec.ts` de `apps/backend/src` están vacíos y no hay comando `test`. La validación actual es manual |
| Separación de datos demo y reales | Implementado: bases `VERTEX_DEMO` y `VERTEX_REAL` ([ADR 0004](docs/adr/0004-bases-demo-y-real-separadas.md)) |
| Contraseñas y secretos | Se leen de variables de entorno; ningún `.env` se versiona |
| Autenticación corporativa (Directorio Activo) | Prevista, no implementada |

## Documentación

| Documento | Contenido |
|---|---|
| [docs/DERS_VERTEX.docx](docs/DERS_VERTEX.docx) | Documento de especificación: problema, estado del arte, objetivos, requisitos, arquitectura C4, pruebas y trazabilidad |
| [docs/diagramas/](docs/diagramas) | C4: [contexto](docs/diagramas/c4-nivel-1-contexto.png), [contenedores](docs/diagramas/c4-nivel-2-contenedores.png), [componentes](docs/diagramas/c4-nivel-3-componentes.png) y [código de `sp_vx_resumen_estados`](docs/diagramas/c4-nivel-4-codigo-sp_vx_resumen_estados.png) |
| [docs/adr/](docs/adr) | Decisiones de arquitectura (ADR 0001 a 0006) |
| [docs/EQUIPO.md](docs/EQUIPO.md) | Matriz, tablero y detalle por persona |
| [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md) | Cómo trabajar con ramas, commits propios y pull requests |
| [docs/INSTALL_DATABASE.md](docs/INSTALL_DATABASE.md) | Instalación paso a paso de las bases |
| [docs/flujo-de-datos.md](docs/flujo-de-datos.md) | Ruta de los datos desde cada acción del dashboard hasta SQL Server |
| [docs/equipos-mapping.md](docs/equipos-mapping.md) | Equipos y motores de la base frente a los del dashboard |

## Asistencia de IA

El proyecto se desarrolló con asistencia de IA (Claude, de Anthropic) en la escritura de código y documentación. Las decisiones, la revisión y la integración son del equipo.
