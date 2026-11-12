# VERTEX · Lista de pruebas aprobada (11/11/2026)

Aprobada por el usuario el 11/11/2026. Copia la organización de las pruebas de PLASEA
(versión del 05/11/2026).
Base: RF-01 a RF-12 y RNF-01 a RNF-12 del DERS de VERTEX (`docs\DERS_VERTEX.docx`, §04).
Fuera de alcance (N/A, sin implementación): RF-05 intervenciones, RF-07 energía por lote,
RF-11 captura física, RF-12 integración corporativa.

## Cambio del 11/11/2026 (decisión del usuario): identidad fuera de alcance

Desde el inicio del proyecto, usuarios, contraseñas, roles, bloqueos y auditoría de acceso son **potestad de TI**
(se manejan a nivel interno). El programa los contempla, pero el equipo no los prueba ni los entrega: solo se necesita
**una cuenta demo para ver el dashboard** (`admin.demo` en local, la contraseña la escribe el usuario; la credencial
demo en el sitio público). **RF-09 y RF-10 pasan a N/A** («potestad de TI»).

- **PU (17 retiradas, quedan 31):** PU-09-01 y PU-10-01 a PU-10-16.
- **CP (13 retirados, quedan 23):** CP-RF09-R01 y los 12 CP-RF10.
- **LH (2 retirados, quedan 4):** LH-04 Usuarios y LH-05 cambio de contraseña. Se mantienen LH-01 y LH-06 (pantalla de
  entrada: rendimiento y accesibilidad).
- **CA:** CA-01 «Acceso y roles» pasa a N/A. CA-02 solo con el formulario de período. CA-09 sin bcrypt ni JWT: queda la
  seguridad de la base y de la API del dashboard (`app_demo_user` sin escritura, inyección SQL y XSS en los parámetros).
- Se mantiene PU-08-01 (la cuenta demo entra sin backend) y CP-RF08-E01/E02 (sitio público en modo demo).

Se **omiten** del entregable (decisión del usuario): los escenarios «umbral real» y «sin umbral, sin línea» de PU-04-01
(no ejecutables con la configuración demo) y el defecto BUG-01, que sale de la bitácora. La diferencia de 55 / 57
bloques en 30 días no se corrige en CLAUDE.md ni se presenta.

Ajustes de CP (decisión del usuario, 11/11/2026), por cómo funciona el sistema con los datos demo:
- **CP-RF02-E01:** «30 días, con un ciclo elegido (I, II y III): la leyenda coincide con la suma de la tabla». Con
  «Todo» la leyenda suma los ciclos completos y el ciclo I empieza antes del período, así que no se compara así.
- **CP-RF04-R01:** se ejecuta con el período «Todo»; en los últimos 30 días no hay episodios de corriente (están el
  22/07 y el 26/08).
- **CP-RF06-R01** (sin cambiar el texto): período Desde 01/09/2026, en el que el ciclo II es 11/09–28/09.

## Cierre del 11/11/2026 (decisión del usuario): solo lo ejecutado

Se retira del plan todo lo que no se ejecutó; no se presenta como pendiente:
- **CP retirados:** CP-RF08-E01, CP-RF08-E02 (sitio público) y CP-RF03-E02 (SQL Server detenido). **Quedan 20 CP.**
- **CA retirados:** CA-09 (seguridad) y CA-10 (rendimiento), que necesitaban una verificación propia que no se hizo.
  CA-07 (errores) se llena con casos ya ejecutados (PU-01-03, PU-01-04, PU-01-05, PU-03-02, CP-RF01-E02, CP-RF03-E01).
  **Quedan CA-02 a CA-08** (CA-01 es N/A).
- Plan final: **31 PU, 20 CP, 4 LH (01, 02, 03, 06) y 7 CA**.

Entorno de CP, LH y CA: backend contra `VERTEX_PRUEBAS` (copia de `VERTEX_DEMO`; el login escribe en la base y
`VERTEX_DEMO` no se toca). Herramientas, solo en `Desktop\VisorVERTEX`: `puppeteer-core` (maneja Chrome y guarda las
capturas) y `lighthouse` (informes LH).

## Estructura de entrega (igual a PLASEA)

```
docs\entregables_pruebas\
  1_Pruebas_unitarias\                 1_VERTEX_Pruebas_unitarias.docx + Capturas\Caja_Blanca (CB-NN) + Capturas\Caja_Negra (CN-NN) + LEEME.md
  2_Pruebas_de_aceptacion\             2_VERTEX_Pruebas_de_aceptacion.docx + Capturas + LEEME.md
  3_Pruebas_funcionales\               VERTEX_Pruebas_funcionales.docx (fichas CRUD) + Capturas CP-RFnn-Xnn[_1_|_2_]_descripcion.png / .txt + LEEME.md
  4_Pruebas_no_funcionales\            VERTEX_Pruebas_no_funcionales.docx (Lighthouse) + Capturas LH-NN + Capturas\Informes_HTML + LEEME.md
  5_Matriz_de_criterios_de_aceptacion\ matriz_criterios_aceptacion_pruebas-v2.docx + Evidencias CA-NN_*.txt + LEEME.md
  6_Guia_de_ejecucion_de_pruebas\      3_VERTEX_Guia_de_ejecucion_de_pruebas.docx
```

Nombres de captura: `CB-NN_PU-xx-yy_RF-xx_que_muestra.png`, `CN-NN_PU-xx-yy_RF-xx_que_muestra.png`,
`CP-RFnn-Xnn[_1_|_2_]_que_muestra.png` (o `.txt` si el caso no tiene pantalla), `LH-NN_RF-xx_pantalla.png`.
Todas a 1366×768, sin editar. Cada carpeta de capturas lleva su `LEEME.md` con la tabla Captura | Caso | RF | Qué muestra.

## 1 · Pruebas unitarias (48 casos, PU-RF-nn, PASS/FAIL, V(G), escenarios Normal / Límite / Inválido)

| ID | Componente | Función o regla | Qué se verifica |
|---|---|---|---|
| PU-01-01 | frontend `dashboard/periodo.ts` | `periodoQuery` | Con días y con rango arma la consulta correcta |
| PU-01-02 | frontend `dashboard/periodo.ts` | `esRango`, `esDias`, `periodoClave` | Clasificación y clave del período |
| PU-01-03 | backend `equipos.controller.ts` | `leerPeriodo` (días) | 1 y 3650 aceptados; 0, 3651 y "abc" → 400 |
| PU-01-04 | backend `equipos.controller.ts` | `leerPeriodo` (rango) | Rango válido aceptado; hasta < desde o fecha mal formada → 400 |
| PU-01-05 | backend equipos | `GET /api/equipos/:codigo` | 200 encontrado, 404 no encontrado, 503 sin base |
| PU-01-06 | frontend `jerarquiaDemo.ts` | `resolverRuta` | Ruta válida devuelve el camino; nivel inexistente → null |
| PU-01-07 | frontend `jerarquiaDemo.ts` | `textoRuta` | Texto de la ruta elegida |
| PU-02-01 | SQL `sp_vx_resumen_estados` | Minutos por segmento | Septiembre CERO-010: ENCENDIDO 21 412, APAGADO 8 258, EVENTO 10 920, MANTENIMIENTO 2 610 min |
| PU-02-02 | SQL `sp_vx_resumen_estados` | Regla 1 (hueco) | Hueco de 30 min no es mantenimiento; de 31 min sí (datos sintéticos, ROLLBACK) |
| PU-02-03 | SQL `sp_vx_resumen_estados` | Regla 4 (corriente cero) | 0,10 A apagado; 0,11 A encendido; sin corriente usa ESTADO_MOTOR |
| PU-02-04 | SQL `sp_vx_resumen_estados` | Regla 4b | Marca del 21/09 06:11 deja EVENTO hasta el mantenimiento del 28/09 |
| PU-02-05 | SQL `sp_vx_resumen_estados` | `@ciclos = 1` | Los resultados 1 a 4 no cambian |
| PU-02-06 | SQL `sp_vx_resumen_estados` | Sin datos | CERO-011 sin mediciones y equipo inexistente |
| PU-02-07 | frontend `bloques.service.ts` | `demoBloquesData` | La suma de los bloques es igual a las horas |
| PU-03-01 | backend `equipos.service.ts` | `findBloques` | Bloques del más reciente al más antiguo; ciclos del más antiguo al más reciente; `completo: false` |
| PU-03-02 | backend `equipos.service.ts` | `errorDeBase` | Sin conexión y ETIMEOUT → 503 con su mensaje |
| PU-03-03 | frontend `shared/api.ts`, `useBackend.ts` | Reintentos | 502/503/504 y red se reintentan 2 veces (2 s y 5 s); 400/404/500 no |
| PU-03-04 | frontend `DonutPanel.tsx` | `romano`, `radioNumero` | 1→I, 4→IV; radio 32 / 42 / 46 (requiere exportar) |
| PU-03-05 | frontend `DashboardPage.tsx` | `bloquesDelCiclo` | Con "Todo" la leyenda es la suma de los ciclos (requiere exportar) |
| PU-03-06 | backend `app.ts` | `GET /health` | db "conectada" / "sin conexión" |
| PU-04-01 | frontend `referenciasTendencia.ts` | `lineaReferencia` | Demo 6,3 A / 3,4 mm/s / 64 °C / 225 V; umbral real; sin umbral sin línea |
| PU-04-02 | frontend `operacion.service.ts` | `minutosDetalle` | ≤ 16 días → 15 min; > 16 días → 60 min |
| PU-04-03 | SQL `sp_vx_tendencia_variable` | Intervalo automático | 2 d → 15; 16 d → 60; 60 d → 240; más → 1440 |
| PU-04-04 | backend equipos | `GET /mediciones` | 7 variables válidas → 200; inválida o vacía → 400 |
| PU-04-05 | frontend `operacion.service.ts`, `bloques.service.ts` | `demoMedicionesData`, `demoMarca` | La marca demo sale igual en la tendencia y en los bloques |
| PU-04-06 | frontend `TrendChart.tsx` | Episodios | Puntos consecutivos ≥ línea forman uno; parada o mantenimiento lo cortan (requiere exportar) |
| PU-06-01 | SQL `sp_vx_resumen_estados` | Ciclos | 5 ciclos separados por 4 mantenimientos (6 h, 17,5 h, 26 h y 5 h) |
| PU-06-02 | SQL `sp_vx_resumen_estados` | Regla 2 (% evento) | 30 % exacto no entra en estado de evento; más de 30 % sí (datos sintéticos, ROLLBACK) |
| PU-06-03 | SQL `sp_vx_resumen_estados` | Cierre de ciclo | El ciclo que contiene `@hasta` se lee hasta su cierre |
| PU-08-01 | frontend `auth.service.ts` | `login` en demo | Token local `demo: true` de 8 h sin llamar a la API |
| PU-08-02 | SQL `99_verificar_integridad_variables.sql` | Integridad | El resumen final dice OK |
| PU-09-01 | backend identity | Auditoría | Cada intento de login queda registrado con su IP |
| PU-10-01 a PU-10-10 | backend `identity.spec.ts` (ya existen, 12 pruebas) | Identidad | Login por usuario o correo, mensaje genérico, 400, bloqueo por IP y por usuario, contraseña temporal, cambio con política, sesión exigida, política y contraseña temporal |
| PU-10-11 | backend `authorize.ts` | Rol sin permiso | 403 |
| PU-10-12 | backend `reauthenticate.ts` | Contraseña propia errónea | 401 |
| PU-10-13 | backend `authenticate.ts` | Token vencido o firma inválida | 401 |
| PU-10-14 | frontend `LoginForm.test.tsx` (ya existen, 7 pruebas) | Pantalla de login | Olvido, mensajes de error, cambio obligatorio, mostrar/ocultar |
| PU-10-15 | frontend `auth.service.ts` | `getStoredToken`, `logout` | Token vencido se descarta; logout borra las claves `vx_` |
| PU-10-16 | frontend `passwordPolicy.ts` | `validarPassword` | Mismos casos que la política del backend |

## 2 y 3 · Pruebas de aceptación y funcionales (36 casos, CP-RFnn-Xnn, A / C / R)

Los mismos casos en dos formatos, como en PLASEA (tabla en el 2 y fichas CRUD en el 3).
Entorno: local, `http://localhost:5173` + backend `:3000` + `VERTEX_DEMO`; RF-08 en `https://vertex.sinerbyte.com`.

| ID | Qué se verifica |
|---|---|
| CP-RF01-E01 | Elegir CERO-010 en el árbol: ✓ verde y el dashboard carga |
| CP-RF01-E02 | CERO-012 (no está en la base): "!" rojo y "Equipo no encontrado" |
| CP-RF01-E03 | Componente sin sensores: "Sin mediciones para este componente" |
| CP-RF01-E04 | Rango Desde/Hasta válido se aplica sin botón |
| CP-RF01-E05 | Rango inválido: caja en rojo sin aplicar; campo vacío vuelve a la fecha anterior |
| CP-RF01-E06 | Botones 7 / 15 / 30 / Todo cambian dona, tabla y tendencia |
| CP-RF01-R01 | F5 conserva la ruta; una pestaña nueva pide login y empieza en el nivel cero |
| CP-RF02-E01 | 30 días: la leyenda coincide con la suma de la tabla por estado |
| CP-RF02-E02 | "Todo": la leyenda es I + II + … en h, d, sem y mes |
| CP-RF02-E03 | Septiembre (01/09–30/09) coincide con el SP |
| CP-RF03-R01 | Tabla: # 1 es el bloque más reciente; la regla en el `title` |
| CP-RF03-R02 | Estado del motor = último bloque; con ciclo elegido, último segmento del ciclo |
| CP-RF03-R03 | Ciclo elegido: la tabla trae sus bloques con el mantenimiento que lo cierra |
| CP-RF03-E01 | Backend detenido: "Reintentar"; al volver, carga |
| CP-RF03-E02 | SQL Server detenido: 503 "Sin conexión a la base de datos" (lo ejecuta el usuario, requiere administrador) |
| CP-RF04-R01 | Resumen de corriente 30 días: línea 6,3 A y episodios en rojo |
| CP-RF04-R02 | Vibración, temperatura, voltaje (0 episodios) y producción (simulada) |
| CP-RF04-R03 | Detalle: scroll, bandas Evento / MTTO y "Mantenimiento" en vertical |
| CP-RF04-R04 | Ciclo elegido: el eje es el ciclo en Resumen y Detalle |
| CP-RF06-R01 | Botones I, II, III… con fechas en el `title` (ciclo II: 11/09–28/09) |
| CP-RF06-R02 | Un ciclo: dona entera y fechas dd/mm/aaaa en el eje |
| CP-RF08-E01 | Sitio público en modo demo sin llamadas a la API (credenciales demo las escribe el usuario) |
| CP-RF08-E02 | Demo: CERO-013 devuelve "Equipo no encontrado" |
| CP-RF09-R01 | Auditoría de login exitoso, fallido, alta y restablecimiento (consulta → `.txt`) |
| CP-RF10-E01 | Login de cada rol con usuario y con correo |
| CP-RF10-E02 | Contraseña errónea y usuario inexistente: el mismo mensaje |
| CP-RF10-E03 | 5 fallos: bloqueo de 15 minutos |
| CP-RF10-E04 | Contraseña temporal: cambio obligatorio, política, luego entra |
| CP-RF10-C01 | Crear usuario PRB con reautenticación; contraseña temporal mostrada una vez |
| CP-RF10-C02 | Usuario o correo repetido rechazado |
| CP-RF10-U01 | Restablecer la contraseña del usuario PRB |
| CP-RF10-R01 | Lista de usuarios y roles |
| CP-RF10-E05 | Rol sin permiso: no ve "Usuarios"; la API responde 403 |
| CP-RF10-E06 | Reautenticación con contraseña errónea rechazada |
| CP-RF10-E07 | Cerrar sesión o token vencido vuelve al login |
| CP-RF10-D01 | La pantalla Usuarios no ofrece eliminar |

## 4 · No funcionales (Lighthouse, 6)

LH-01 login · LH-02 dashboard CERO-010 desktop · LH-03 dashboard móvil · LH-04 Usuarios ·
LH-05 cambio de contraseña · LH-06 login del sitio público.

## 5 · Matriz de criterios (CA-01 a CA-10, mismas filas que PLASEA)

CA-01 Acceso y roles (RF-10) · CA-02 Formularios (login, período, usuarios) · CA-03 Lógica de negocio (RF-02, RF-06) ·
CA-04 Consultas y filtros (RF-01, RF-03) · CA-05 Salidas (dona, tabla, tendencia) · CA-06 Interfaz (Lighthouse, RNF-08, RNF-12) ·
CA-07 Errores (`.txt`) · CA-08 Integridad (RF-08, RNF-05) · CA-09 Seguridad (`app_demo_user` con DENY, bcrypt, JWT, inyección SQL, XSS; `.txt`) ·
CA-10 Rendimiento (7 / 15 / 30 días / Todo frente a 1–3 s de RNF-07).

## 6 · Guía de ejecución

Mismas secciones que la de PLASEA: términos, reparto, entorno, cuentas y datos PRB, procedimiento,
bitácora BUG-nn, orden de ejecución, rondas, dictamen y matriz de cobertura RF × casos.
