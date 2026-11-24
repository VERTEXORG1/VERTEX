# VERTEX

Sistema de monitoreo industrial: horas de operación, estados, eventos y
mantenimiento de motores en planta. Monorepo con frontend React, backend
Express y base de datos SQL Server.

## Plan y tablero
- **Objetivo general:** capturar automáticamente las horas de funcionamiento de un motor (por ejemplo, el de un equipo CERO), iniciando con el CERO-010 como prototipo.
- **Fuente del plan:** Taller Inception §6.2, DERS §06 y Proyecto Integrador §25 (`docs/*.docx`, versión del 30–31/10/2026). Las fechas y los responsables son de planificación, no un registro de ejecución.
- **3 fases y 6 sprints** (30 tareas, 5 por sprint):

| Fase | Sprint | Fechas | Tareas |
|---|---|---|---|
| 1 · Levantamiento y estructura del negocio | S1 Contexto y objetivos | 06/08–28/08/2026 | 1–5 |
| | S2 Requisitos y reglas | 29/08–20/09 | 6–10 |
| 2 · Base de datos demo y dashboard | S3 Base de datos | 21/09–08/10 | 11–15 |
| | S4 Dashboard en modo demo | 09/10–25/10 | 16–20 |
| 3 · Integración, seguridad y cierre | S5 API, conexión y acceso | 26/10–12/11 | 21–25 |
| | S6 Pruebas, documentación y aceptación | 13/11–30/11 | 26–30 |

- **Entregable (hasta el 30/11/2026):** aceptación del dashboard, conexión frontend → API → base de datos y visualización por fechas, con la base demo `VERTEX_DEMO` (654.470 registros del CERO-010) y acceso por roles.
- **Evolución futura (sin tareas ni fechas en el tablero):** Etapa A, prototipo y piloto físico en el CERO-010 de la Línea 6; Etapa B, expansión (demás equipos, consumo por lote, SAP/MPR). Fuera del semestre: captura física, despliegue en la Línea 6, consumo por lote, SAP/MPR, Directorio Activo y respaldos.
- **Tablero** ([Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)), reorganizado el 31/10/2026:
  - un issue por tarea, con el título "T<n> – <nombre>"; el asignado es el responsable principal y el apoyo va por nombre en el cuerpo;
  - milestone por sprint ("S1 – …" a "S6 – …"), etiqueta "Fase 1" a "Fase 3", iteraciones S1–S6 y campos Fase, Inicio y Fin con las fechas de plan;
  - estados Todo / In progress / Done (no hay "Pendiente"); al 31/10, 1–20 cerradas según el plan, 21–25 en progreso y 26–30 por hacer;
  - las notas de cierre citan solo commits o archivos reales; si no hay evidencia, "fecha real: [PENDIENTE]". Nunca se añaden coautorías sin confirmación;
  - la etiqueta "Evolución futura" marca #3 (caja de instrumentación, cerrado) y #6 (despliegue en la Línea 6, abierto, sin milestone ni fechas);
  - la correspondencia tarea ↔ issue, el reparto y la matriz están en `docs/EQUIPO.md`.

## Estado actual

### Frontend (`apps/frontend`) — React 19 + TypeScript + Vite 8, CSS Modules
- **Login** (`src/modules/auth/`)
  - `AuthFlow.tsx`: panel de marca (desktop) + tarjeta de login.
    - **Emblema de la marca** (`src/assets/vertex-emblema.jpg`, 320 × 320, 24 KB; reducido del PNG de 512 px que eligió el usuario): centrado arriba del panel de marca en lugar de "VX VERTEX" (`.brandEmblema`, `min(220px, 34vh)`, esquinas de 16 px; a 501 px de alto mide 170 px y el panel no se desplaza). En la tarjeta del teléfono va en el recuadro pequeño (`.logoMark`) junto a "VERTEX".
    - En el dashboard el mismo emblema ocupa el recuadro de 40 px del Sidebar (`.logoMark`) y de la cabecera móvil (`.mobileLogo`), con "VERTEX" al lado.
  - `LoginForm.tsx`: campo "Usuario o correo" + contraseña con botón mostrar/ocultar, estados de carga y error.
  - `auth.service.ts`: `login()`, `getStoredToken()` (descarta tokens vencidos) y `logout()`. Token en `sessionStorage` con clave `vx_token`: es de la pestaña, así que F5 conserva la sesión, pero **cada pestaña o ventana nueva (acceso directo "Iniciar VERTEX", otra pestaña, tras cerrar el navegador) pide login**. "Duplicar pestaña" de Chrome copia la sesión.
    - `getStoredToken()` borra las claves `vx_` que versiones anteriores dejaron en `localStorage` (ya no se guarda nada ahí).
    - `logout()` borra todas las claves `vx_` (token y `vx_ruta`) de `sessionStorage` y `localStorage`; un token vencido también llama a `logout()`. Al volver a entrar, el árbol empieza en las cinco áreas cerradas y el dashboard en su estado inicial (período, variable y Resumen / Detalle no se guardan en el navegador).
  - Dos modos:
    - **Normal:** `POST {VITE_API_URL}/api/identity/login`.
    - **Demo** (`VITE_DEMO_MODE=true`, para el sitio de demostración en Cloudflare): valida contra `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` sin backend y genera un token local `{ demo: true, exp: +8h }` sin firma real.
  - `App.tsx`: vista `'login' | 'dashboard'`. Si la pestaña tiene un token vigente (p. ej. tras F5), entra directo al dashboard.
- **Dashboard** (`src/modules/dashboard/`): en modo normal, la dona, el estado del motor, la tendencia y la tabla de eventos leen la base; el resto sigue simulado (`mockData.ts`, `donutSimulation.ts`). En modo demo todo es simulado.
  - **Árbol de equipos** (`ArbolEquipos.tsx`) en lugar de las antiguas pestañas (Resumen / Motores / Mantenimiento / Producción) y del selector de CERO: Área → Sección → Grupo → Equipo → Componente.
    - **⚠ DEMO:** la estructura está en `jerarquiaDemo.ts` (`DEFINICION`); se reemplazará por tablas en la base. Solo los CERO-010…013 tienen datos (`cero`) y solo su Motor tiene sensores (`sensores`).
    - Estilo explorador de VS Code. Dos estados separados: `ruta` (lo elegido, alimenta el dashboard y `vx_ruta`) y `expandidos` (qué nodos están abiertos, local al árbol). Elegir o abrir un nodo nunca oculta otros: hermanos e hijos siguen visibles.
    - Acordeón solo en las áreas: abrir una cierra las demás con todos sus niveles. Dentro del área abierta cada nodo se abre y cierra libremente y conserva sus hijos abiertos.
    - Flecha (chevron, SVG de 16 px): clic solo abre / cierra, sin cambiar la ruta. Nombre: elige el nodo y lo abre; el nombre del nodo elegido y abierto lo cierra. Las hojas conservan el hueco de la flecha.
    - Letra de 13 px, filas de 22 px (36 px en el panel del teléfono), sangría de 8 px por nivel (`--arbol-sangria`). La flecha gira 90° con `transition` (sin animación con `prefers-reduced-motion`).
    - Líneas guía de 1 px (`.arbolGrupo::before`) bajo la flecha del padre, del primer hijo al último, una por nivel abierto; color `--arbol-guia`: `rgba(255,255,255,0.1)` en el Sidebar, `rgba(0,0,0,0.1)` en el panel del teléfono.
    - Nombres largos con "…" y `title`; fila completa del nodo elegido (cualquier nivel) resaltada con `--vx-accent`, niveles de la ruta en negrita. Botones nativos (Tab / Enter). Si se cierra el área del nodo elegido, el dashboard lo sigue mostrando.
    - Desktop y teléfono horizontal: en el Sidebar (que conserva Cerrar sesión). Teléfono vertical: `ArbolMovil`, una línea con la ruta bajo la cabecera que se despliega al tocarla y se pliega sola al elegir un equipo o componente.
    - La ruta se guarda en `sessionStorage` (`vx_ruta`): se restaura al recargar (F5) en la misma pestaña, con su camino abierto (también al reabrir el panel del teléfono); una pestaña nueva empieza en el nivel cero. Si un nivel ya no existe, vuelve a la raíz. Cerrar sesión la borra.
    - `seleccionDe()` (`DashboardPage.tsx`): sin equipo, "Elige un equipo para ver su información"; componente sin sensores, "Sin mediciones para este componente"; equipo sin datos, "Sin mediciones para este equipo" (en las cuatro tarjetas). Un CERO o su Motor cargan el dashboard de ese CERO con los mismos servicios y endpoints.
    - Verificación del CERO elegido (`GET /api/equipos/:codigo` con `useBackend`, también al restaurar la ruta): spinner, ✓ verde o "!" rojo con el mensaje bajo el equipo en el árbol. En modo demo no se consulta.
    - Arriba del dashboard solo el título "Resumen operativo" (la ruta ya está en el árbol); en teléfono vertical la ruta se ve en la línea del panel plegado.
  - **Período compartido** (`periodo.ts`: `{ dias }` o `{ desde, hasta }` AAAA-MM-DD, por defecto 30 días): uno solo para la dona, la tabla de eventos y la tendencia. Lo cambian los campos de fecha y los botones de la tabla.
  - `PeriodoSelector.tsx`: "📅 Desde [fecha] → Hasta [fecha]", dos `<input type="date">` nativos en una caja del ancho de la tarjeta de la dona, siempre en una línea (≤ 340 px de ancho: sin ícono y letra menor).
    - Clic o Enter abren el calendario del navegador (`showPicker`). Límites = primer y último registro; "Hasta" ≥ "Desde".
    - Un cambio válido se aplica al momento (sin botón). Rango inválido: caja en rojo y mensaje, sin aplicar. Campo vacío (p. ej. "Borrar"): al salir vuelve la fecha anterior.
    - Sigue al período de los botones de la tabla (`fechasDelPeriodo`) y conserva las fechas mientras carga. El rango con datos va en el `title` de la caja (sin texto debajo).
    - Sin margen inferior: la tarjeta de la dona empieza a la misma altura que la de la tendencia (mismo alto en desktop).
  - Selector de Variable: las opciones nunca se cortan; si no caben, pasan a la línea siguiente.
  - Panel de la dona (`DonutPanel.tsx`): fila superior de períodos, info del motor, unidades h/d/sem/mes y leyenda en una sola fila.
    - **Dona por ciclos entre mantenimientos:** un sector igual por cada ciclo completo que toca el período (`ciclos` de `/bloques`), del más antiguo al más reciente, en sentido horario desde las 9 (`INICIO = 270`, el eje X). 1 ciclo: dona entera sin corte; 2: partida por el eje X (arriba el ciclo I, abajo el II); 4: cruz con el ciclo I arriba a la izquierda.
    - Dentro de cada sector solo colores: Encendido, Apagado, Evento y Mantenimiento en proporción al tiempo de ese ciclo; el mantenimiento que lo cierra va pegado al eje siguiente y mide al menos 4° (`MIN_MTTO`), y los demás estados se reparten el resto en su proporción. `title` de cada sector con fechas y porcentajes.
    - Ejes entre sectores: corte del anillo en naranja de mantenimiento (`.donutCorte`) y línea en el hueco del mismo naranja tenue (`.donutEje`). Sin total en el centro.
    - **Con varios ciclos ("Todo")**: solo el número romano de cada ciclo (I, II, III…; `romano()`, `.donutNumero`, 18 de 200 unidades), en el centroide de su cuña del hueco (`radioNumero(paso)`: 2 ciclos 32, 3 → 42, 4 → 46). Sin fechas en los ejes.
    - **Con un solo ciclo** (o el elegido): sin número; sus dos fechas **dd/mm/aaaa** a lo largo del eje (`FechaEje`, como etiqueta de eje: paralelas a él, leídas desde el centro hacia afuera y giradas media vuelta donde quedarían al revés; `R_FECHA = 44`, comprobado que caben en el hueco). Antes del eje el inicio del mantenimiento que cerró el ciclo (`finCiclo`; el último registro si sigue en curso); después, su inicio (= fin del mantenimiento anterior).
    - **Fila superior "Período:"** (`.donutPeriodos`, alineada con Producto / Estado): un botón por ciclo con su número romano (`title` "Ciclo II: 11/09/2026 – 28/09/2026") y "Todo" al extremo derecho (`title` con el rango de todos los ciclos y el período consultado). Con más ciclos los botones pasan a la línea siguiente.
    - **La selección vive en `DashboardPage`** (`seleccionCiclo`, solo para la lista de ciclos actual: un período nuevo vuelve a "Todo"). Elegir un ciclo cambia la dona (solo ese ciclo), su leyenda, el **estado**, la tabla y la tendencia (`vista` = `bloquesDelCiclo()`: los `tramos` del ciclo, sin nueva petición para la tabla).
    - Leyenda en la unidad elegida (`enUnidad`): con un ciclo, sus horas; con **"Todo", la suma de los valores mostrados de cada ciclo** (I + II + III a mano da lo mismo; comprobado en las cuatro unidades); sin ciclos (cargando), las horas del período.
      - Por qué: "30 días" empieza en el último registro − 30 d (p. ej. 14/09 03:59), pero el ciclo I empieza al terminar el mantenimiento anterior (11/09 08:00). Antes "Todo" sumaba solo el período y los ciclos incluían esos días de más (0,92 d encendido, 1,92 d apagado).
    - **Estado** (izquierda): con "Todo", `estado_actual` (último registro del período consultado); con un ciclo, el último segmento del ciclo ("Mantenimiento" si lo cerró uno). Producto: "Sin asignación" solo con Apagado.
    - Una sola petición `GET /api/equipos/:codigo/bloques` (`fetchBloques`) alimenta la dona (`ciclos`, `horas`), el estado del motor (`estado_actual`) y la tabla: siempre coinciden. Debajo de la leyenda solo "Cargando…", "Sin mediciones…" o el error.
    - El fin del período se muestra como el último día incluido (`ultimoDia`); "(última medición)" solo si el período llega al último registro.
    - Modo demo: `demoBloquesData` (`bloques.service.ts`) devuelve la misma forma con bloques simulados, para días o rangos de fechas, y `demoCiclos` los ciclos completos cortados al fin de cada mantenimiento del perfil. El período termina en el último registro simulado (14/10).
    - El prototipo 2 (`CiclosPanel.tsx`, una fila por ciclo con línea de tiempo) se descartó porque obligaba a desplazarse; se borró el 18/11/2026 y queda en el historial de git.
    - Producto y línea siguen simulados.
  - **Tendencia** (`TrendChart.tsx`, SVG puro) con selector de variable (corriente, vibración, temperatura, voltaje y producción). Dibuja el **máximo** de cada intervalo con el motor encendido frente a una línea roja de referencia.
    - Título "Tendencia — Variable" y, en la misma línea a la derecha, el control **Resumen | Detalle** (por defecto Resumen; "Res." / "Det." si la tarjeta mide ≤ 300 px, por container query).
    - Eje Y fijo pegado al borde izquierdo de la tarjeta, con el valor de la línea en rojo como una marca más de la escala; la unidad va dentro de la gráfica, arriba a la izquierda. Sin títulos de ejes ni aviso de intervalo; carga / vacío / error salen sobre la gráfica.
    - Forma (`curva` en `mockData.ts`): temperatura y vibración, curva monótona (Fritsch–Carlson: pasa por cada punto sin salirse de sus vecinos); corriente y voltaje, rectas.
    - **Episodio** = puntos consecutivos con el máximo ≥ la línea (una parada o un mantenimiento lo cortan). Cada episodio, un solo punto rojo en su pico.
    - **Resumen**: solo tiempo encendido (cada punto ocupa sus minutos encendidos; apagados y mantenimientos no ocupan espacio), todo el período sin scroll, fechas de inicio de cada día sin solaparse. Con más puntos que ancho se agrupan quedándose con el más alto. Episodios sin valor ni fecha. Usa `GET /mediciones` del período (intervalo del SP: 15 min, 1 h, 4 h o diario).
    - **Detalle**: línea de tiempo continua con scroll horizontal solo en el área de trazado (abre al final); encendido = máximo del intervalo, apagado = línea tenue al fondo, mantenimiento = sobre el eje X con "Mantenimiento" en vertical, y bandas Evento (rosa pastel #FFEBEE) / MTTO (verde pastel #E3F2E1, misma claridad; se distinguen mejor que el crema #FFF3E0 de antes: ΔE 16 frente a 12). Estados de `GET /bloques` (los mismos de la dona y la tabla).
    - **Con un ciclo elegido** en la dona: eje = el ciclo; Resumen pide `/mediciones` de los días que toca (`periodoTrend`) y se queda con los intervalos que empiezan dentro; Detalle usa `fetchMedicionesDetalle` con las horas exactas del ciclo; bandas = `tramos` del ciclo. Con "Todo", el período consultado.
      - Hasta 50 marcas con fecha: primero los picos de episodio (con su valor; si hay más de 50, los más altos repartidos), luego los cambios (sube / pico / baja sobre una media móvil de ~2 h, se apaga / vuelve a encender). Si dos fechas chocan, se omite la del pico más bajo (su punto rojo queda).
      - Intervalos más cortos sin tocar el backend (`fetchMedicionesDetalle` en `operacion.service.ts`): pide el período en tramos de 2 días (15 min) si dura ≤ 16 días, o de 16 días (1 h), 3 peticiones a la vez, y los reagrupa. Ancho: 2 px por intervalo de 15 min o 4 px por hora, más si los episodios lo necesitan (máx. 24 000 px). "Todo" ≈ 6 peticiones.
    - **Se dibuja al tamaño real de su caja** (`ResizeObserver`, 1 unidad SVG = 1 px), letra de 11 px. Teléfono: caja 3:2 (máx. 320 px de alto); desktop: el alto que queda en la tarjeta. Leyenda en una fila: Máximo · Nominal · Evento · MTTO, solo lo que aparece.
    - Mientras carga un período nuevo solo usa datos del período actual (no mezcla el eje de uno con los datos de otro). Producción sigue simulada y lo indica.
  - **⚠ Líneas de referencia DEMO** (`src/modules/dashboard/referenciasTendencia.ts`, único lugar): los datos de `VERTEX_DEMO` son simulados y estas líneas también; solo existen en el frontend (no se tocó `ConfiguracionVariables`).
    - `USAR_REFERENCIAS_DEMO = true` y `REFERENCIAS_DEMO`: corriente **6,3 A**, vibración **3,4 mm/s**, temperatura **64 °C**, voltaje **225 V**, producción 100.
    - Elegidas con las 68 072 lecturas encendidas de CERO-010 (13/07 – 14/10): justo por encima del máximo de la operación normal (6,23 A, 3,31 mm/s, 63,86 °C, 224,5 V). Todos los episodios caen en las ventanas de anomalías del seed: corriente 43, temperatura 39, vibración 7; voltaje 0 (el seed no tiene anomalías de voltaje). Las anomalías son solo el 0,02–0,14 % de las lecturas, así que una línea por percentil (p98) marcaba > 1 000 episodios de ruido por variable.
    - **Al pasar a datos reales**: poner `USAR_REFERENCIAS_DEMO = false` y borrar los valores DEMO. La línea pasa a ser `UMBRAL_MAX` de `ConfiguracionVariables` (el `umbral` que ya devuelve `/mediciones`); sin umbral no hay línea, y los episodios solo se marcan si el umbral está habilitado. Revisar antes los umbrales de la base (hoy corriente 2,5 A y voltaje 396–484 V, deshabilitados).
    - Pendiente (propuesto, no implementado): para usar `NOMINAL`, `sp_vx_tendencia_variable` debería devolverlo junto a `umbral_min` / `umbral_max` y `findMediciones` (`equipos.service.ts`) incluirlo en la respuesta. `UMBRAL_MIN` llega pero la gráfica todavía no lo dibuja.
    - Modo demo: `demoMedicionesData` (`operacion.service.ts`) simula lecturas por minuto en los bloques ENCENDIDO del período demo, agrupadas como el SP, con los mismos umbrales que la base (temperatura que sube de 40 a 62 °C en el turno). La marca de evento simulada (10 min: vibración en CERO-010 el 21/09 06:11, temperatura en CERO-012 el 09/10 09:30) sale igual en la gráfica y en las `marcas` de los bloques.
  - `operacion.service.ts` (fetch de mediciones y su simulación demo) y `useBackend.ts` (hook genérico con cancelación por clave).
  - **Reintentos:** los servicios lanzan `ErrorTemporal` (`shared/api.ts`) ante falla de red o 502 / 503 / 504; `useBackend` los reintenta 2 veces (a los 2 y 5 s) mostrando "Cargando…". 400, 404 y 500 nunca se reintentan. Si sigue fallando, el estado de error trae `reintentar` y aparece el botón **"Reintentar"** (`BotonReintentar.tsx`) junto al mensaje en la dona, la tabla y la tendencia. En Detalle, si falla un tramo no se piden los demás.
  - **Resumen del período (N)** (`EventsSummary.tsx`, `bloques.service.ts`), en el lugar de las antiguas barras por turno; N = filas de la tabla (55 en 30 días, 30 con el ciclo I):
    - tabla # / Inicio / Fin / Duración / Estado con los bloques de estado del CERO seleccionado (el mismo cálculo que la dona), y botones 7 / 15 / 30 días / Todo que cambian el período compartido;
    - con un ciclo elegido en la dona, sus bloques completos (incluido el mantenimiento que lo cierra); con "Todo", los del período consultado;
    - # numera las filas en el orden mostrado: 1 es el bloque más reciente; la regla que decidió cada bloque sale como `title` de la fila;
    - Encendido / Apagado / Evento / Mantenimiento; las horas se muestran en UTC, tal como están guardadas;
    - modo normal: `GET /api/equipos/:codigo/bloques`;
    - modo demo: bloques simulados minuto a minuto con los turnos del seed (CERO-010/011/012), y CERO-013 devuelve "Equipo no encontrado" para probar el error.
    - Teléfono (todo lo que no es desktop): Estado con etiqueta corta ("Encend.", "Apagado", "Evento", "Mtto."; la completa en `title`) y celdas con menos relleno; ≤ 340 px, letra 11 px. Cabe sin desplazamiento horizontal en 360 px (304/304), 320 px (264/264) y teléfono horizontal.
  - **Batería del dispositivo de captura** (`BateriaPrototipo.tsx`, `bateria.service.ts`), arriba del placeholder del mapa en la columna derecha: barra con el último nivel (`GET /api/equipos/:codigo/bateria`) y la hora de la lectura; aviso "Cargar o cambiar la batería" si el nivel ≤ `BATERIA_AVISO_PCT`. Sin lecturas (hoy siempre: V009 no está aplicada) y en modo demo dice "Pendiente".
  - Placeholder del mapa.
  - Cerrar sesión en el Sidebar (desktop y teléfono horizontal) y en la cabecera móvil (teléfono vertical).
- **Modos de layout** (los mismos en `dashboard.module.css` y `auth.module.css`):
  - teléfono por defecto (cabecera + panel del árbol);
  - teléfono horizontal: `(orientation: landscape) and (max-height: 500px)`; Sidebar de 150 px con el árbol, sin cabecera; con menos de 640 px de contenido las tarjetas van en una columna (container query `vx-main`);
  - desktop: `(min-width: 768px) and (min-height: 501px)`, fijo a 100vh;
  - desktop compacto: alto ≤ 760;
  - desktop grande: ≥ 1440×860.
- `src/shared/api.ts`: `API_URL` (`VITE_API_URL`) y `DEMO_MODE` (`VITE_DEMO_MODE`), compartidos por los servicios.
- Variables de color para validación en `dashboard.module.css`: `--vx-ok` (#2E7D32) y `--vx-danger` (#E53935). `--vx-success` es azul, por eso no se usa para "ok".
- **Identidad (ADR 0007):** "¿Olvidaste tu contraseña?" en `LoginForm.tsx` solo muestra un mensaje (en demo, "En la demostración, contacta al administrador"); `CambiarPassword.tsx` es el cambio obligatorio tras una contraseña temporal; `modules/admin/UsersRolesPage.tsx` es la pantalla "Usuarios" (listar, crear, restablecer) para ADMINISTRADOR e ING_MANTENIMIENTO, nunca en demo; `ReauthModal.tsx` pide la contraseña propia. Pruebas: `npm test` (Vitest + Testing Library).
- **Limpieza del 18/11/2026:** se borraron los archivos vacíos (`LoginPage.tsx`, `modules/reporting`, `shared/components`, `shared/contexts`, `shared/hooks`), los componentes sin uso (`DonutChart.tsx`, `CiclosPanel.tsx`, `KpiRow.tsx`, `HorizontalBars.tsx`), `mockData.kpis` / `mockData.bars` con sus tipos y los recursos de la plantilla de Vite (`hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`). Siguen en el historial de git.

### Backend (`apps/backend`) — Express 5 + TypeScript, `mssql`, `bcrypt`, `jsonwebtoken`
- `src/main.ts`: abre el puerto **3000** enseguida y conecta el pool global de `mssql` con `conectarConReintentos` (`src/shared/db.ts`): nunca se rinde, espera 2, 4, 8, 16, 32 s y luego 60 s entre intentos, y muestra cada intento en su ventana. Mientras no conecta, las rutas de datos responden 503.
- `src/app.ts`: JSON, CORS (`CORS_ORIGIN`) y `GET /health` → `{ status: "ok", db: "conectada" | "sin conexión" }` (`estadoBase()`: `SELECT 1` real con límite de 3 s).
- **`POST /api/identity/login`**
  - Body: `{ credential, password }`, donde `credential` es el email **o** el `username`.
  - Busca un usuario activo en `dbo.Usuarios` y sus roles en `dbo.UsuarioRoles` / `dbo.Roles`, y compara con bcrypt.
  - Respuestas: 200 `{ token }`, 400 si faltan datos, 401 `{ error: "Credenciales inválidas" }`.
  - JWT: `{ userId, email, username, rol: string[] }`, vence en `JWT_EXPIRES_IN` (8h).
  - Si el usuario no existe también ejecuta bcrypt, para que el tiempo de respuesta no delate qué usuarios existen.
- **`GET /api/equipos/:codigo`** (`src/domains/equipos/`): busca un equipo activo en `dbo.EquiposCero` junto con su área.
  - 200 `{ encontrado: true, codigo, nombre, area }`.
  - 404 `{ encontrado: false, mensaje: "Equipo no encontrado" }`.
  - 503 `{ encontrado: false, mensaje: "Sin conexión a la base de datos" }` si SQL Server no responde.
  - Sin autenticación por ahora; es una prueba de conexión dashboard → backend → base de datos.
- **El cálculo de estados vive en `dbo.sp_vx_resumen_estados`** (ver Base de datos); Node solo lo ejecuta (`ejecutarResumenEstados` en `equipos.service.ts`). No hay lógica de estados en Node ni en el frontend.
- **Período** (`leerPeriodo` en el controller, tipo `Periodo` en el service) en `/resumen`, `/bloques` y `/mediciones`:
  - `?dias=N` (1 a 3650): de `MAX(event_time) - N días` al último registro;
  - `?desde=AAAA-MM-DD&hasta=AAAA-MM-DD`: días UTC con los dos extremos incluidos (hasta las 24:00 de `hasta`), recortado al último registro;
  - sin parámetros: toda la historia (`/resumen` exige uno de los dos).
  - 400 si no son válidos; 404 / 503 / 500 con `{ mensaje }`. Nunca se usa el reloj del servidor.
- **`GET /api/equipos/:codigo/bloques`**: lo usa el dashboard para la dona y la tabla (una sola ejecución del SP).
  - 200 `{ fecha_referencia, desde, primer_registro, ultimo_registro, horas: { ENCENDIDO, APAGADO, EVENTO, MANTENIMIENTO }, estado_actual, bloques: [{ inicio, fin, duracion_min, segmento, regla, marcas }], ciclos: [{ inicio, fin, completo, horas, tramos: [{ inicio, fin, segmento, regla, marcas }] }] }`, bloques del más reciente al más antiguo.
  - `ciclos`: los ciclos **completos** que toca el período (del fin del mantenimiento anterior al fin del que lo cierra, o al último registro si sigue en curso, `completo: false`), del más antiguo al más reciente, con sus horas y bloques sin recortar. El SP se ejecuta con `@ciclos = 1`.
- **`GET /api/equipos/:codigo/resumen`**: horas por estado más el detalle de cálculo (el dashboard ya no lo usa).
  - 200 `{ fecha_referencia, desde, primer_registro, ultimo_registro, horas, estado_actual, ciclos, mantenimientos }`.
  - `ciclos`: `{ inicio, ultimo_registro, registros_encendido, registros_encendido_con_evento, porcentaje, estado_evento, estado_evento_desde, primera_marca }`; `mantenimientos`: `{ inicio, fin, duracion_min }`.
  - Sin mediciones (CERO-011): `fecha_referencia: null`, horas en cero y listas vacías.
- `GET /api/equipos/:codigo/intervalos` ya no existe (leía `IntervalosFuncionamiento`).
- **`GET /api/equipos/:codigo/bateria`**: `{ nivel, event_time, aviso_pct }`, la última lectura de `NIVEL_BATERIA` del CERO (`equipo_id` del CERO, no del motor) y `ConfiguracionSistema.BATERIA_AVISO_PCT`; `nivel: null` sin lecturas o sin V009; 404 si el equipo no existe.
- **`GET /api/equipos/:codigo/mediciones?variable=CODIGO`** + período: estadísticas por intervalo de una variable, solo con el motor encendido. Solo ejecuta `dbo.sp_vx_tendencia_variable`.
  - `variable`: CORRIENTE_MOTOR, TEMPERATURA_MOT, VIBRACION_MOT, VOLTAJE_MOTOR, FRECUENCIA_RED, POTENCIA_MOT o RPM_MOTOR; si no, 400.
  - 200 `{ variable, unidad, fecha_referencia, desde, minutos_punto, umbral: { min, max, habilitado } | null, puntos: [{ inicio, dia, promedio, minimo, maximo, lecturas, marcas }] }`.
- `requestTimeout` de `mssql`: 30 s (`main.ts`); "Todo" puede tardar varios segundos.
- Errores de base (`errorDeBase` en `equipos.service.ts`), ambos 503: sin conexión → "Sin conexión a la base de datos"; consulta que agota el `requestTimeout` (`RequestError` con `ETIMEOUT`) → "La base de datos tardó demasiado en responder".
- **Identidad (Fase B, ADR 0007, commits `9a475da` y `6ddee65`):**
  - middlewares `authenticate`, `authorize` y `reauthenticate` (`src/shared/middleware/`), usados en las rutas de identidad;
  - el login devuelve `{ token, debe_cambiar }`; con contraseña temporal el token solo sirve para `POST /api/identity/password/cambiar`;
  - bloqueo de 15 minutos tras 5 fallos, por usuario y por IP (contados en `Auditoria.ip_origen`); 429 solo por IP, 401 genérico en los demás casos;
  - `GET /usuarios` y `/roles`, `POST /usuarios` y `POST /usuarios/:id/restablecer` solo para ADMINISTRADOR e ING_MANTENIMIENTO, con reautenticación; contraseña temporal generada por el servidor y mostrada una sola vez;
  - reglas en los procedimientos de V007 (`sp_vx_login_*`, `sp_vx_password_*`, `sp_vx_usuario_crear`); bcrypt de 12 rondas en Node, también en el `DUMMY_HASH`;
  - pruebas: `npm test` (Vitest + Supertest, repositorio en memoria en `identity/tests/fakeRepositorio.ts`).
- **`POST /api/captura/lotes`** (`src/domains/captura/`, 24/11/2026): recibe los lotes del dispositivo de captura (ESP32).
  - Autenticación del dispositivo, no de usuario: `X-Dispositivo: <codigo>` y `Authorization: Bearer <clave>`; Node compara el SHA-256 de la clave con `Dispositivos.clave_hash` (`sp_vx_dispositivo_credencial`, `timingSafeEqual`). Dispositivo inexistente o clave errónea: el mismo 401.
  - Body: lista de 1 a 120 lecturas `{ equipo, seq, event_time: "…Z", lecturas: { CODIGO: número | null } }`, todas del CERO del dispositivo (si no, 400).
  - Lecturas imposibles de guardar (hora < 2026, > 10 min en el futuro o inválida, variable fuera del catálogo, valor no numérico) cuentan como `rechazadas` pero se responde 200: el dispositivo solo borra su memoria con un 2xx y, si no, reenviaría para siempre.
  - 200 `{ recibidas, nuevas, duplicadas, rechazadas, mediciones }`; 503 sin base (el dispositivo reintenta).
  - Guarda con `sp_vx_captura_lote_recibir`; Node no tiene lógica de duplicados. Pruebas en `captura/tests/captura.spec.ts`.
- Pendiente:
  - las rutas de datos (`/api/equipos/...`) todavía no exigen el token (habría que enviarlo desde el frontend y desde `start-vertex.ps1`);
  - V007 y sus cinco procedimientos están aplicados en `VERTEX_DEMO`, no en `VERTEX_REAL`;
  - el resto de dominios (mantenimiento, auditoría): sus archivos vacíos se borraron el 18/11/2026 (también los 6 `*.spec.ts` vacíos, `packages/shared` y `docker-compose.yml`, vacíos); se crearán al implementarlos.
- La autenticación final será contra el Directorio Activo corporativo; la tabla de usuarios es para la demo.

### Base de datos (`database/`) — SQL Server, bases `VERTEX_DEMO` y `VERTEX_REAL`
- Migraciones `V001`–`V010` (V007 identidad; **V008 y V009 están en el repositorio sin aplicar** en `VERTEX_DEMO` local, comprobado el 18/11/2026), procedimientos `R__*`, seeds `01`–`03` e instalador `database/scripts/01_install_databases.sql`.
  - `V010` (24/11/2026, aplicada en `VERTEX_DEMO` local y del servidor, no en `VERTEX_REAL`): captura del dispositivo. `Dispositivos` + `equipo_id` (el dispositivo es del CERO), `clave_hash` (SHA-256 de la clave) y `ultimo_contacto`. Procedimientos `R__sp_vx_dispositivo_credencial` y `R__sp_vx_captura_lote_recibir`.
    - Cada lote crea una fila en `PaquetesAdquisicion`; cada lectura nueva, una en `RegistrosOriginales` (JSON tal como llegó, `record_id` = `event_time` del RTC) y una fila de `Mediciones` por variable con valor (`equipo_id` del CERO, `motor_id` del `EquipoMotorHistorial` en ese instante o NULL, `provenance = 'REAL'`).
    - Duplicados: `UQ_RegOrig_externo` (dispositivo + `record_id`) y además ninguna medición repetida del mismo CERO, variable y `event_time`. Un lote reenviado no inserta nada.
    - `app_demo_user` puede ejecutarlo pese al `DENY INSERT`: encadenamiento de propiedad (procedimiento y tablas de `dbo`).
    - `#r.record_id` y la comparación con `l.[key]` llevan `COLLATE DATABASE_DEFAULT`: tempdb y OPENJSON tienen otra intercalación (error "collation conflict").
  - Registrar un dispositivo: `database/scripts/07_registrar_dispositivo.sql` con `-E` y `-v DISPOSITIVO=… EQUIPO=… CLAVE_HASH=0x…` (el comando de Node que genera clave y hash está en su cabecera). Volver a registrarlo cambia la clave. Registrado: `ESP32-CERO011-01` → CERO-011 (local y servidor; la clave solo está en el `secrets.h` del firmware).
  - Al borrar en `Mediciones` con `sqlcmd` hace falta `-I` (QUOTED_IDENTIFIER): la tabla tiene índices que lo exigen.
  - `V008`: caché del cálculo de estados (`EstadoCalculo`, `EstadoRegistros`, `EstadoTramos`), con `R__fn_vx_estados_parametros`, `R__sp_vx_estados_recalcular` y `R__sp_vx_resumen_estados_cache`; `npm run comparar:estados` (`apps/backend/scripts/comparar-resumen-estados.ts`) compara la caché con `sp_vx_resumen_estados` en muchos períodos y sale con código 1 si hay diferencias. La API todavía no la usa.
  - `V009`: variable `NIVEL_BATERIA` (%, id `66666666-…-601`, también en `01_reference_data.sql`) y `BATERIA_AVISO_PCT = 30` en `ConfiguracionSistema`.
  - `V006`: índice `IX_Mediciones_Equipo_Tiempo (equipo_id, event_time) INCLUDE (variable_id, valor)` para el cálculo de estados (~45 MB).
- Varios `.sql` están en **UTF-16**: para buscar en ellos, decodificarlos primero; `grep` no los lee.
  - Al editarlos hay que conservar la codificación (UTF-16 LE con BOM) y los finales de línea, que mezclan CRLF y LF.
  - `03_demo_measurements_extended.sql` es la excepción: está en UTF-8 sin BOM.
- **Catálogo de variables:** lo define solo `01_reference_data.sql`, con un MERGE que inserta y actualiza las 8 variables:

| variable_id | codigo | unidad |
|---|---|---|
| `44444444-…-01` | CORRIENTE_MOTOR | A |
| `44444444-…-02` | RPM_MOTOR | RPM |
| `44444444-…-03` | TEMPERATURA_MOT | °C |
| `44444444-…-04` | VOLTAJE_MOTOR | V |
| `55555555-…-01` | VIBRACION_MOT | mm/s |
| `55555555-…-02` | FRECUENCIA_RED | Hz |
| `55555555-…-03` | POTENCIA_MOT | kW |
| `55555555-…-04` | ESTADO_MOTOR | - |

  - `02` usa esos IDs (la corriente y el sensor `SEN-CORR-CERO010-M2` van con `44444444-…-01`).
  - `03` no crea ni modifica variables: valida que existan y, si no, se detiene ("Ejecute primero 01_reference_data.sql"). Las unidades de sus mediciones salen de `dbo.Variables`.
- **Mediciones por minuto de CERO-010** (`apps/backend/scripts/seed-mediciones.ts`, `npm run seed:mediciones`):
  - Del 2026-07-13 (lunes) al último lote de 5 minutos antes de ejecutarlo; una fila por minuto de CORRIENTE, TEMPERATURA, VIBRACION, VOLTAJE y ESTADO_MOTOR (~650 000 filas, ~300–450 MB). Valores deterministas (semilla fija).
  - Turnos: lunes a viernes ~06–22 h UTC, sábado ~06–14 h, domingo apagado. Apagado = filas con `ESTADO_MOTOR = 0` y valores cerca de cero; mantenimiento = sin filas.
  - 4 mantenimientos (el 2.º es el cambio de MOT-CERO010-001 por MOT-CERO010-002 el 2026-09-11 08:00 UTC) y 3 eventos (anomalías dispersas 2–4 días antes y una parada de 20–50 min). Fechas fijas en el script.
  - También inserta `IntervalosFuncionamiento` (cierre `PARADA_NORMAL`, `FALLA` o `MANTENIMIENTO`), `IntervencionesMantenimiento` y `ContadoresCicloMotor` (5 ciclos), con `hallazgos` / `motivo_inicio` que empiezan por `SEED:` para que `sp_vx_restablecer_demo` no los borre.
  - Una sola transacción; no inserta nada si CERO-010 ya tiene datos. `--simular` (`npx tsx scripts/seed-mediciones.ts --simular`) solo calcula y muestra el resumen, sin conectarse.
  - Requisitos, con la cuenta administradora: `database/scripts/03_preparar_seed_mediciones_cero010.sql` (borra los datos simulados anteriores de CERO-010 y alinea `EquipoMotorHistorial`) y, una vez, `04_crear_login_seed.sql` (login `SEED_DB_USER`: SELECT en dbo e INSERT solo en Mediciones, IntervalosFuncionamiento, IntervencionesMantenimiento, ContadoresCicloMotor y Auditoria; toma la contraseña de la variable de entorno).
  - **Los seeds 02 y 03 vuelven a cargar datos de CERO-010** en ese período (03 borra y regenera del 11/09 al 10/10). No re-ejecutarlos sin revisarlos.
  - **Después de cualquier seed o carga de datos**, ejecutar `database/scripts/99_verificar_integridad_variables.sql`.
    - Es de solo lectura y se puede ejecutar con `app_demo_user`.
    - Revisa el catálogo, las mediciones con una unidad distinta a la de su variable, los sensores asociados a otra variable y las mediciones cuya variable no es la de su sensor; además cuenta las mediciones por variable.
    - El resumen final debe decir `OK`.
- **Cálculo de estados** (ENCENDIDO / APAGADO / EVENTO / MANTENIMIENTO): `database/procedures/R__sp_vx_resumen_estados.sql` (UTF-16 LE con BOM).
  - `EXEC dbo.sp_vx_resumen_estados @equipo_codigo, @desde, @hasta | @dias, @detalle, @ciclos`. `@hasta` se recorta al último registro. Devuelve: 1) minutos por segmento, estado actual, `primer_registro` y `ultimo_registro`; 2) ciclos con contadores; 3) mantenimientos detectados; 4) con `@detalle = 1`, bloques con su regla y marcas; con `@ciclos = 1`, 5) ciclos completos que tocan el período (inicio, fin, completo, minutos por segmento de todo el ciclo) y 6) sus bloques sin recortar, con regla y marcas como el resultado 4.
    - Con `@ciclos = 1` la lectura sigue hasta el cierre del ciclo que contiene `@hasta` (primer registro tras el siguiente hueco; sin hueco, hasta el último registro). `#t` guarda además las filas de esos ciclos fuera del período (`en_periodo = 0`) y numera los bloques por segmento **y** ciclo; los resultados 1–4 solo usan `en_periodo = 1` (idénticos con y sin `@ciclos`, comprobado). El mantenimiento que cierra un ciclo pertenece a ese ciclo.
    - Coste de `@ciclos`: +0,05–0,2 s con caché caliente (7 d 0,76 s, 15 d 1,28 s, 30 d 1,23 s, "Todo" ~6,5 s). Aplicado en `VERTEX_DEMO`; falta en `VERTEX_REAL`.
  - Solo lee `Mediciones`: **nunca se modifican sus filas** ni se usan etiquetas guardadas (`IntervalosFuncionamiento`, `calidad`…); el estado sale de los valores y de `event_time` (nunca `received_time` ni relojes del servidor).
  - Registro = filas del equipo con el mismo `event_time`. El tiempo hasta el siguiente registro se asigna al primero.
  - Reglas: 1) hueco > `TOLERANCIA_HUECO_MIN` entre registros → MANTENIMIENTO y ciclo nuevo (los huecos menores son paquetes perdidos y conservan la regla del registro anterior); 2) contadores del ciclo: registros encendidos y encendidos con marca; si el % supera `PORCENTAJE_EVENTO`, el ciclo entra en estado de evento hasta el siguiente mantenimiento; 3) ciclo en estado de evento → EVENTO; 4a) corriente > 0 → ENCENDIDO (la marca queda registrada); 4b) corriente 0 con alguna marca desde el último mantenimiento → EVENTO; 4c) si no → APAGADO.
  - Corriente 0 = `CORRIENTE_MOTOR <= CORRIENTE_CERO_MAX` (en la demo el motor apagado marca 0,001–0,081 A, no 0); sin lectura de corriente se usa `ESTADO_MOTOR = 0`. Marca = alguna variable habilitada fuera de `UMBRAL_MAX` / `UMBRAL_MIN`.
  - Para un período lee la historia desde el último mantenimiento anterior a su inicio.
  - Rendimiento:
    - La lectura (`INSERT #r`) usa `WITH (INDEX (IX_Mediciones_Equipo_Tiempo))` y `OPTION (MAXDOP 1, ORDER GROUP, LOOP JOIN)`: la agregación hash se desbordaba a tempdb (~10 s) y en paralelo variaba de 0,4 a 12 s. Un columnstore vacío en `#r` habilita el modo batch en las funciones de ventana.
    - `#t` calcula el número de bloque (`LAG` + suma acumulada) con PK `(bloque, event_time)` y `OPTION (MAXDOP 1, RECOMPILE)`, así el resultado 4 agrupa sin ordenar (`ORDER GROUP`). Antes se desbordaba (1 244 páginas, picos de 22 s).
    - Tiempos en el portátil de desarrollo: 7 días ~1,5–2,5 s, toda la historia ~5–8 s (casi todo CPU; con batería la CPU baja a 1,1 GHz). Con poca memoria libre SQL Server reduce las concesiones y alguna sentencia se desborda (ver **Memoria de SQL Server** más abajo).
    - La primera llamada tras cambiar el SP tarda más (compila).
  - Parámetros: `database/scripts/05_parametros_calculo_estados.sql` (idempotente, MERGE; re-ejecutarlo restablece estos valores). Se ejecuta con un login con escritura (`-E`), no con `app_demo_user`.

| Tabla | Clave | Valor |
|---|---|---|
| `ConfiguracionCalculo` | `PORCENTAJE_EVENTO` | 30 |
| | `INTERVALO_REGISTRO_MIN` | 1 (dispositivo y demo) |
| | `TOLERANCIA_HUECO_MIN` | 30 (hueco > 30 min = mantenimiento) |
| | `CORRIENTE_CERO_MAX` | 0.1 A |
| `ConfiguracionVariables` | CORRIENTE_MOTOR `UMBRAL_MAX` / `HABILITADO` | 2.5 A / **0** (la demo trabaja a ~5,2 A) |
| | VOLTAJE_MOTOR `NOMINAL` / `UMBRAL_MIN` / `UMBRAL_MAX` / `HABILITADO` | 440 / 396 / 484 V / **0** (la demo está a ~220 V) |
| | VIBRACION_MOT `UMBRAL_MAX` / `HABILITADO` | 4.5 mm/s (ISO 10816-1 Clase I) / 1 |
| | TEMPERATURA_MOT `UMBRAL_MAX` / `HABILITADO` | 65 °C / 1 |

  - Resultado en la demo (CERO-010): 5 ciclos separados por 4 mantenimientos (6 h, 17,5 h, 26 h y 5 h); ninguno supera el 30 %, así que todo el EVENTO viene de la regla 4b (p. ej. desde la marca de vibración del 21/09 06:11 hasta el mantenimiento del 28/09). Septiembre: ENCENDIDO 21 412, APAGADO 8 258, EVENTO 10 920, MANTENIMIENTO 2 610 min.
- **Tendencia**: `database/procedures/R__sp_vx_tendencia_variable.sql` (UTF-16 LE con BOM). `EXEC dbo.sp_vx_tendencia_variable @equipo_codigo, @variable_codigo, @dias | @desde, @hasta [, @minutos_punto]`:
  - 1) `unidad`, `fecha_referencia`, `desde`, `minutos_punto`, `umbral_min`, `umbral_max`, `umbral_habilitado`;
  - 2) por intervalo (`inicio`, `dia`): promedio, mínimo, máximo, lecturas y `marcas` (lecturas fuera del umbral; 0 si está deshabilitado).
  - `@minutos_punto` automático según la duración: ≤ 2 días → 15 min; ≤ 16 días → 60; ≤ 60 días → 240; más → 1440. Intervalos alineados a las 00:00 UTC.
  - Encendido con el mismo criterio que el cálculo de estados: corriente > `CORRIENTE_CERO_MAX`; sin corriente, `ESTADO_MOTOR <> 0`.
  - Usa variables locales `@inicio` / `@fin` y `OPTION (RECOMPILE)`: con el plan del primer período (parameter sniffing) otros períodos eran lentísimos. ~0,1–0,5 s.
  - `sp_vx_get_serie_variable` (puntos sueltos con historial de modificaciones) es otro propósito y no lo usa el dashboard.
- **Memoria de SQL Server** (`database/scripts/06_configurar_memoria.sql`, UTF-16 LE con BOM; afecta a toda la instancia):
  - `min server memory` = 1024 MB y `max server memory` = 3072 MB. Ejecutar con una cuenta administradora: `sqlcmd -S localhost -E -i database\scripts\06_configurar_memoria.sql`. Idempotente, sin reiniciar el servicio. Volver atrás: 0 y 2147483647.
  - Por qué (diagnóstico del 16/10/2026): con el valor por defecto (16 MB) y el portátil de 7,7 GB con ~1 GB libre, SQL Server cedía su memoria (avisos "memory has been paged out", error 701). Las consultas esperaban memoria (`RESOURCE_SEMAPHORE`, hasta 1 093 s), superaban los 30 s del backend y el dashboard fallaba; también con la instancia recién arrancada. Repetir peticiones (cerrar sesión y entrar) acababa funcionando porque SQL Server recuperaba memoria entre intentos.
  - **Recomendación para el servidor de TI:** fijar `min server memory` / `max server memory` según la RAM del servidor (mínimo ≥ 1 GB para VERTEX; máximo que deje memoria al sistema operativo). "Bloquear páginas en memoria" (cuenta `NT Service\MSSQLSERVER`) queda pendiente: primero se prueba unos días solo con min/max.
  - Diagnóstico rápido: `sys.dm_os_wait_stats` (`RESOURCE_SEMAPHORE`), `sys.dm_os_process_memory` (`process_physical_memory_low`) y el `ERRORLOG`.
  - **22/10/2026:** 7 / 15 / 30 días volvieron a tardar 2–4 s sin ningún cambio en el calentamiento (`start-vertex.ps1` igual desde `e592fe8`). Causa: Windows paginó la memoria de SQL Server (71 avisos "memory has been paged out" desde el 16/10; SQL Server en 340 MB pese a `min server memory` = 1 024; 0,9 GB libres). `min server memory` no impide que Windows quite la memoria: hace falta **"Bloquear páginas en memoria"** para `NT Service\MSSQLSERVER` (`secpol.msc` → Directivas locales → Asignación de derechos de usuario; luego reiniciar `MSSQLSERVER`). Lo hace el usuario como administrador. El calentamiento nunca precalcula resultados: solo compila los planes y sube los datos a memoria; cada período ejecuta el SP (~0,7–1,5 s con caché caliente).
  - En el portátil de desarrollo, MySQL80 arranca solo (~600 MB); si no se usa: `Set-Service MySQL80 -StartupType Manual` y `Stop-Service MySQL80` (como administrador).
  - SQL Server del portátil: Enterprise **Evaluation** 16.0.1000.6 (caduca a los 180 días de instalarse; entonces el servicio no arranca).
- Login SQL `app_demo_user`: solo `SELECT` / `EXECUTE` en `VERTEX_DEMO` (`DENY INSERT/UPDATE/DELETE`).
- **Datos de prueba (solo desarrollo):**
  - `CERO-011` "Equipo de prueba", insertado a mano en `dbo.EquiposCero` de `VERTEX_DEMO`, con el área, tipo y perfil de CERO-010. Sirve para probar el caso "encontrado"; no es un equipo real.
  - Para borrarlo: `DELETE FROM dbo.EquiposCero WHERE codigo = 'CERO-011';` con un login con permisos de escritura, porque `app_demo_user` no los tiene.
  - Equipos reales en la base: solo CERO-010. Ver `docs/equipos-mapping.md`.
- Hashes reales de los 7 usuarios demo: `scripts/create_demo_users.ts`, que lee `DEMO_PWD_*` del `.env` raíz.

### Servidor de producción (Hetzner, desde el 12/11/2026)
- **`https://vertex.sinerbyte.com` es VERTEX completo** (login real, backend y SQL Server con `VERTEX_DEMO`), en el servidor Hetzner `servidor-sinerbyte` (CX23: 2 núcleos x86, 4 GB + 2 GB de swap, Helsinki, Ubuntu 24.04), compartido con Synerbot. La IP y el acceso SSH están en la memoria local de Claude (`servidor-hetzner-acceso`), no en el repositorio. Instalado en la conv. 42 del proyecto Synerbot.
- **SQL Server 2025 Express** (17.0, gratis: 10 GB por base, ~1,4 GB de buffer): `memory.memorylimitmb` = 1800, solo escucha en `127.0.0.1:1433`. Contraseña de `sa` en `/root/.vertex-sql-sa` (solo root; no mostrarla). Herramientas en `/opt/mssql-tools18/bin/sqlcmd` (usar `-C`).
- Bases restauradas desde copias del PC (12/11/2026): `VERTEX_DEMO` (654.470 mediciones, 13/07–14/10/2026) y `VERTEX_REAL` (vacía), nivel de compatibilidad 160, dueño `sa`. Logins `app_demo_user`, `app_real_user` y `vertex_seed_user` con el mismo SID y contraseña que en el PC.
- Código en `/opt/vertex/apps/{backend,frontend}` (usuario de sistema `vertex`):
  - Servicio `vertex` (systemd): `node --env-file=.env dist/main.js`, puerto **3010** (`PORT` en `.env`; el 3000 es de Synerbot), `MemoryMax=400M`.
  - `.env` del servidor: el del PC con `DB_SERVER=127.0.0.1`, `CORS_ORIGIN=https://vertex.sinerbyte.com`, `PORT=3010` y un `JWT_SECRET` propio. Para pasar a datos reales: `DB_NAME=VERTEX_REAL` y `DB_USER=app_real_user` (+ su contraseña) y `systemctl restart vertex`.
  - Frontend compilado con `VITE_API_URL=https://vertex.sinerbyte.com` y `VITE_DEMO_MODE=false`, servido por **nginx** en `127.0.0.1:3011` (`/etc/nginx/sites-available/vertex`), que también reenvía `/api/` y `/health` al 3010 y pasa la IP real (`CF-Connecting-IP` → `X-Forwarded-For`).
  - Registro de tiempos por petición: `/var/log/nginx/vertex-tiempos.log` (`total=` y `backend=` en segundos).
  - Actualizar: copiar el código (sin `node_modules`, `dist` ni `.env`), `npm ci` y `npm run build` como usuario `vertex`, y `systemctl restart vertex`.
- **Túnel de Cloudflare propio** `vertex` (separado del de Synerbot): `/opt/vertex/tunel.yml`, servicio `vertex-tunel`, CNAME `vertex.sinerbyte.com`. Reiniciarlo no afecta al bot.
- Código para el servidor (en GitHub desde el 18/11/2026): `apps/backend/src/main.ts` lee `PORT` (3000 por defecto) y `HOST` (`0.0.0.0` por defecto; en el servidor `HOST=127.0.0.1`, solo nginx llega a la API), y `apps/backend/src/app.ts` usa `trust proxy = loopback`, para que el bloqueo por IP vea la IP del visitante y no la de nginx.
- **Velocidad medida el 12/11/2026** (registro de nginx, `bloques` = `sp_vx_resumen_estados`): 7 d 2,0 s, 15 d 2,5 s, 30 d 3,1 s, Todo 6,3 s; `mediciones` 0,1–0,8 s. El servidor calcula ~2× más lento que el portátil en los períodos cortos. El tablero pide equipo → mediciones → bloques en serie (~3,5–7 s percibidos). No hay calentamiento en el servidor (solo existe en `start-vertex.ps1`).
- **Caché de estados (en desarrollo, V008):** el estado de cada registro solo depende de la historia desde el último mantenimiento, no del período: los bloques se calculan una vez y `sp_vx_resumen_estados_cache` solo recorta y suma. Falta aplicarla, comprobarla con `npm run comparar:estados` (resultados idénticos) y que la API la use; también que el tablero pida en paralelo.
- **24/11/2026:** desplegados V010, sus procedimientos y el backend del repositorio (con `/api/captura/lotes` y `/bateria`; antes el servidor tenía el backend anterior a la batería). Respaldos previos: `/opt/vertex/respaldo-backend-20261124-0957.tgz` y `/var/opt/mssql/backup/VERTEX_DEMO-antes-V010-20261124-0957.bak`. El ESP32 envía a `https://vertex.sinerbyte.com` y sus lecturas del CERO-011 quedan en `VERTEX_DEMO`.
- Pendientes antes de `VERTEX_REAL`: las rutas `/api/equipos/...` no exigen token; V010 y el registro del dispositivo en `VERTEX_REAL`. La base ya separa `event_time` (hora de la lectura en la fuente) de `received_time`.

### Sitio de demostración (Cloudflare)
- GitHub: `https://github.com/VERTEXORG1/VERTEX` (rama `main`), conectado a Cloudflare Workers. **Netlify se desvinculó el 18/11/2026**: ya no hace falta `[skip netlify]` ni avisar de Netlify.
- **Worker `vertex` de Cloudflare** (modo demo, archivos estáticos sin script): desde el 12/11/2026 **ya no tiene el dominio `vertex.sinerbyte.com`** (pasó al servidor); sigue en su dirección `workers.dev` (cuenta `islenderalfonso`).
  - Debe llamarse igual que el `name` de `apps/frontend/wrangler.jsonc`, que define `assets.directory = "./dist/"` y `not_found_handling = "single-page-application"`.
  - Root directory `apps/frontend`; build command `npm run build`; deploy command `npx wrangler deploy`.
  - Variables **de build** (no de runtime): `VITE_DEMO_MODE`, `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD`. Sus valores están solo en el panel de Cloudflare.
  - Build watch paths `apps/frontend/*`: Cloudflare solo compila cuando un push cambia `apps/frontend`.
- Sirve el frontend en **modo demo**, sin backend: solo entra el usuario demo (`VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`); los usuarios de `dbo.Usuarios` no funcionan. Si se olvida la contraseña demo, está en el panel de Cloudflare o en el JavaScript publicado; al cambiarla hay que lanzar un despliegue nuevo.
- Vite copia las variables `VITE_*` dentro del JavaScript público. La contraseña demo debe ser desechable.
- **Reglas de publicación:** antes de cualquier push, indicar qué cambios afectan al sitio (`apps/frontend`). Todo push solo cuando el usuario diga "aprobado", después de revisar los cambios en local (`localhost:5173`).

### Firmware del dispositivo (`firmware/`, 23–24/11/2026)
- Montaje provisional en protoboard: ESP32 DevKit de 30 pines (USB CP2102, **COM5** en el portátil), RTC DS3231 (SDA → D21, SCL → D22) y sonda DS18B20 (datos → D4, resistencia de 4,7 kΩ a 3V3). Todo a 3V3, nunca VIN. Diagrama: `firmware/conexiones.svg`; guía paso a paso: `firmware/README.md`.
- `vertex_prueba_envio/vertex_prueba_envio.ino`, por etapas (`#define ETAPA`): 1 hora del RTC; 2 Wi-Fi + NTP (ajusta el RTC en UTC si difiere > 2 s); 3 una lectura por minuto del RTC y lote cada 5 min en el monitor; **4 (la actual)** envío real a `VX_URL/api/captura/lotes`.
  - `event_time` = minuto exacto del DS3231. Cola circular de 1 440 lecturas (24 h; si se llena, se descarta la más antigua) y lotes de hasta 60; solo se borra un lote con 2xx (un 400 lo descarta para no bloquear la cola).
  - Equipo `CERO-011` (prueba, para no mezclar con la demo del CERO-010). `CORRIENTE_MOTOR` va en 0: todavía no hay sensor de corriente.
  - Dos redes con `WiFiMulti` (`WIFI_SSID` y opcional `WIFI_SSID_2`, la zona Wi-Fi del celular): usa la de mejor señal y reintenta cada 30 s. Solo 2,4 GHz y los nombres distinguen mayúsculas.
  - HTTPS con `useBuiltinCACertBundle()` (certificados raíz de Mozilla); `http://` solo para pruebas con el backend del PC en la misma red. Ocupa el 93 % de la memoria de programa.
- `vertex_prueba_envio/secrets.h` (fuera de git, `.gitignore`): `WIFI_*`, `VX_URL`, `VX_DISPOSITIVO` y `VX_CLAVE`. Plantilla: `secrets.h.example`. Hoy `VX_URL = https://vertex.sinerbyte.com`.
- `firmware/wokwi/`: el mismo programa en ETAPA 3 para el simulador Wokwi (RTC DS1307, red `Wokwi-GUEST`); no tiene los cambios de la ETAPA 4.
- Compilar y subir: Arduino IDE 2.3.11 (placa **ESP32 Dev Module**, paquete esp32 4.0.0; bibliotecas RTClib, OneWire y DallasTemperature en `Documents\Arduino\libraries`) o su `arduino-cli` (`resources\app\lib\backend\resources\arduino-cli.exe`, `compile --fqbn esp32:esp32:esp32 --upload -p COM5`). Con el monitor serie abierto el COM5 está ocupado.
  - Claude ve su `AppData` redirigido (carpeta del paquete de Claude): lo que instale con `arduino-cli` no lo ve el IDE del usuario. Los paquetes se instalan desde el IDE.
- Pendiente: cortar el diodo de carga del DS3231 antes de usarlo con batería; mostrar las lecturas del CERO-011 en el tablero (hoy el árbol solo tiene datos demo).

## Estructura

```
apps/
  frontend/            React + Vite (src/modules/{auth,dashboard,...}, src/contracts)
  backend/             Express API (src/domains/<dominio>/, src/shared/middleware)
database/              migrations/, procedures/, seeds/, scripts/
firmware/              ESP32 del dispositivo de captura (ver "Firmware del dispositivo")
scripts/               create_demo_users.ts
docs/                  entrega_final/ (entrega del 30/11), entregables_pruebas/, INSTALL_DATABASE.md, equipos-mapping.md, flujo-de-datos.md (ruta de los datos por disparador, para el informe técnico)
instalar.ps1           Instalador de las bases de datos (PowerShell)
start-vertex.ps1       Arranque de desarrollo: SQL Server + backend + frontend + navegador
```

## Entregable de pruebas (`docs/entregables_pruebas/`, ejecutado el 11/11/2026)
- Siete carpetas (la 7 es el informe de pruebas, `7_Informe_de_pruebas/`, en git desde el 18/11/2026) con la organización de las plantillas de la docente (copias de PLASEA, que no se modifica):
  - 1, pruebas unitarias;
  - 2, aceptación;
  - 3, fichas funcionales;
  - 4, Lighthouse;
  - 5, matriz de criterios;
  - 6, guía de ejecución.
  
  Cada carpeta de capturas lleva su `LEEME.md`. Lista y decisiones: `00_Lista_de_pruebas_aprobada.md`.
- Solo lo ejecutado, sin pendientes ni defectos:
  - 31 PU (106 escenarios, todos PASS);
  - 20 CP (todos A);
  - 4 LH (todos A);
  - 7 CA (dictamen APROBADO, 100 %).
- **Numeración única documento ↔ evidencia**:
  - CB-001…CB-106 y CN-001…CN-097: unitarias, caja blanca y caja negra;
  - CN-098…CN-130: aceptación;
  - CP-RFnn-Xnn: nombre de las capturas funcionales;
  - LH-01…LH-04;
  - CA-01…CA-07.
- Fuera de alcance:
  - RF-09 y RF-10 (usuarios, contraseñas, roles y auditoría): potestad de TI; solo se usa la cuenta demo;
  - RF-05, RF-07, RF-11 y RF-12: sin implementación en el semestre.
- Docente: Prof. Jover Alonso; formato: Prof. Nataly Duque Páez. "Ejecutó" = integrante asignado, nunca Claude.
- Herramientas y generadores, fuera del repo, en `Desktop\VisorVERTEX`:
  - trazador, `puppeteer-core` y `lighthouse`;
  - `trazador\empaquetar.py` numera y copia la evidencia;
  - `trazador\generar_docs.py` arma los .docx.
- La base de pruebas `VERTEX_PRUEBAS` (copia de `VERTEX_DEMO`) y su `.bak` se borraron al terminar.
- Lighthouse dejó tres observaciones que no cambian el estado A:
  - contraste de grises pequeños (#757575 sobre #F5F5F5, #90A4AE sobre blanco);
  - botones del árbol de 16–22 px en escritorio;
  - SEO 83: sin meta description, y `/robots.txt` devuelve `index.html`.

## Entrega final (`docs/entrega_final/`, 30/11/2026)
- Plantillas de la docente (zip "Material propuesto entrega final"): guía de proyecto de aula, diapositivas (10), póster A1, DERS (IEEE 830) y rúbrica. Rellenadas el 17–18/11/2026 y aprobadas por el usuario el 18/11/2026.
- Archivos: `Guia_Proyecto_Aula_VERTEX.docx`, `Diapositivas_Sustentacion_VERTEX.pptx`, `Poster_VERTEX.pptx` y `DERS_VERTEX_actualizado.docx` (el original `docs/DERS_VERTEX.docx` no se tocó), cada uno con su PDF, y `Matriz_Rubrica_Evidencias.md`. Paquete para la docente: `docs/VERTEX_Entrega_Final.zip` (carpetas 1–5; los `.zip` no se versionan).
- Título único: "VERTEX: monitoreo de horas y estados de los motores de los equipos CERO". Metodología: enfoque ágil iterativo e incremental (Larman y Basili, 2003), 3 fases y 6 sprints. 4 objetivos específicos.
- Normas: impersonal, sin pendientes, trabajo futuro (Etapa A/B) en futuro, lo tomado de internet en negrilla, APA 7 al final, sin estilos "Título N" en Word. **Nada del hardware del prototipo** (componentes, batería, presupuesto) en los entregables; solo "en la Etapa A se instalará un dispositivo de captura que enviará lecturas reales a `VERTEX_REAL`".
- Generadores y material de trabajo en `.trabajo/` (excluido en `.git/info/exclude`, no se versiona): `gen/guia.py`, `diapositivas.py`, `poster.py`, `ders.py` y `ders_diagramas.py` (python-docx / python-pptx; ejecutar con `python -P -E`), `ESTADO.md` y `datos.md`.

## Variables de entorno

Ningún `.env` se sube a git (`.gitignore`). Cada carpeta tiene su `.env.example`.

**`apps/backend/.env`**

| Variable | Uso |
|---|---|
| `DB_SERVER`, `DB_PORT` | SQL Server (por defecto `localhost`, `1433`) |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `app_demo_user` sobre `VERTEX_DEMO` |
| `DB_TRUST_SERVER_CERTIFICATE` | `true` por defecto (certificado autofirmado local) |
| `SEED_DB_USER`, `SEED_DB_PASSWORD` | Solo `npm run seed:mediciones`: login de escritura creado con `database/scripts/04_crear_login_seed.sql` |
| `JWT_SECRET` | Obligatorio. Generar con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `8h` |
| `CORS_ORIGIN` | `http://localhost:5173` (lista separada por comas) |

**`apps/frontend/.env`**

| Variable | Uso |
|---|---|
| `VITE_API_URL` | `http://localhost:3000` |
| `VITE_DEMO_MODE` | `false` en local y en el servidor, `true` en Cloudflare |
| `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD` | Solo en el panel de Cloudflare (variables de build), nunca en el repo |

**`.env` raíz:** instalador y `scripts/create_demo_users.ts` (`VERTEX_DEMO_*`, `DEMO_PWD_*`).

## Comandos de desarrollo

**Arranque rápido:** doble clic en el acceso directo "Iniciar VERTEX" del escritorio, que ejecuta
`powershell -ExecutionPolicy Bypass -File start-vertex.ps1`. El script:
- comprueba que el servicio `MSSQLSERVER` está en marcha y, si no, lo arranca (pide permisos de administrador si hacen falta);
- verifica el puerto `DB_PORT`;
- ejecuta `npm install` si falta `node_modules`;
- abre dos terminales ("VERTEX Backend" y "VERTEX Frontend") con `npm run dev`, sin duplicarlas si el 3000 o el 5173 ya están ocupados;
- espera hasta 90 s a que `GET /health` diga `db: "conectada"` y a que Vite (5173) responda, con un aviso cada 15 s. Si no lo logra, **no abre el navegador** y explica si falla el backend o la base (revisar la ventana "VERTEX Backend", que muestra cada intento de conexión);
- calienta las consultas del dashboard (`/bloques` y `/mediciones` de CERO-010, 30 días, una tras otra, con su tiempo; si fallan solo avisa) y abre `http://localhost:5173`.
  - Si el dashboard aun así recibe un error, lo reintenta solo y ofrece "Reintentar"; no hace falta cerrar sesión.
  - Si el calentamiento agota los 30 s, falta memoria en SQL Server (ver **Memoria de SQL Server**).

```bash
# Backend (requiere SQL Server con VERTEX_DEMO instalada)
cd apps/backend
npm install
npm run dev          # tsx watch, http://localhost:3000
npm run typecheck
npm run build && npm start

# Frontend
cd apps/frontend
npm install
npm run dev          # Vite, http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run lint         # oxlint
```

## Convenciones
- La interfaz y los mensajes van en español; el `index.html` tiene `lang="es"` para que el navegador no traduzca la página.
- Las variables CSS `--vx-*` están definidas en `dashboard.module.css` y no se redefinen.
- No hay dependencias de gráficos: la dona y la tendencia son SVG puro. Los íconos son SVG inline.
- Nunca guardar contraseñas, tokens ni hashes en archivos versionados.
- Commits y push solo cuando el usuario lo apruebe explícitamente ("aprobado").
- Al probar en el navegador con Chrome headless, cerrar todos sus procesos (perfil temporal) al terminar: si quedan abiertos agotan la memoria y SQL Server deja de responder.

## Reglas de trabajo con Claude

**Regla de contexto**
- Al iniciar una sesión nueva (primera conversación del día), leer CLAUDE.md una sola vez y confirmar que se leyó.
- Durante la sesión NO volver a leerlo salvo que el usuario lo pida.

**Regla de actualización**
- Al completar una tarea aprobada, preguntar: "¿Apruebas guardar estos cambios en CLAUDE.md?"
- Solo si el usuario responde "sí" o "aprobado", actualizar CLAUDE.md.
- No hacer commit de CLAUDE.md hasta que el usuario diga "aprobado".
