# T15 · Pruebas de los procedimientos contra la base demo

- **Qué es:** ejecución real de los procedimientos almacenados `sp_vx_*` de solo lectura contra la base de demostración, con el equipo CERO-010 y períodos de 7, 15 y 30 días o un rango de fechas.
- **De dónde sale:** ejecución con el login de la aplicación (`app_demo_user`) sobre `VERTEX_DEMO`, el **31/10/2026 a las 13:00:33 UTC** (fecha real). Datos de CERO-010 entre 2026-07-13 00:00:00Z y 2026-10-14 03:59:00Z.
- **Sin cambios en los datos:** cada caso se ejecutó dentro de una transacción revertida (`ROLLBACK`). Antes y después: `Auditoria` 41 filas, `Usuarios` 7, `Mediciones` 654.470, `MedicionesModificacion` 0.
- **Sin credenciales:** la conexión se leyó de `apps/backend/.env` sin imprimirla; en `sp_vx_login_obtener_usuario` la columna `password_hash` aparece como `[oculto]`.
- **Por procedimiento** (una carpeta cada uno): `comando.sql` (los comandos usados), `salida.txt` (salida real) y `salida.png` (imagen de esa salida, generada con Microsoft Edge en modo headless; Playwright no está instalado). `resultados.json` reúne los 19 casos.

## Resumen

| Procedimiento | Caso y parámetros | Filas por resultado | Resultado esperado | Resultado obtenido | ¿Cumple? |
|---|---|---|---|---|---|
| `sp_vx_resumen_estados` | dias_7: `@equipo_codigo = 'CERO-010', @dias = 7` | 1 / 2 / 1 | 3 resultados (horas, ciclos y mantenimientos); resultado 1 con 1 fila y la suma de minutos por estado = 7 × 1440 = 10080 | 3 resultados; suma de minutos = 10080 | Cumple |
| `sp_vx_resumen_estados` | dias_15: `@equipo_codigo = 'CERO-010', @dias = 15` | 1 / 3 / 2 | 3 resultados (horas, ciclos y mantenimientos); resultado 1 con 1 fila y la suma de minutos por estado = 15 × 1440 = 21600 | 3 resultados; suma de minutos = 21600 | Cumple |
| `sp_vx_resumen_estados` | dias_30: `@equipo_codigo = 'CERO-010', @dias = 30` | 1 / 3 / 2 | 3 resultados (horas, ciclos y mantenimientos); resultado 1 con 1 fila y la suma de minutos por estado = 30 × 1440 = 43200 | 3 resultados; suma de minutos = 43200 | Cumple |
| `sp_vx_resumen_estados` | septiembre: `@equipo_codigo = 'CERO-010', @desde = '2026-09-01T00:00:00', @hasta = '2026-10-01T00:00:00'` | 1 / 3 / 2 | ENCENDIDO 21 412, APAGADO 8 258, EVENTO 10 920, MANTENIMIENTO 2 610 minutos (valores documentados en CLAUDE.md) | ENCENDIDO 21412, APAGADO 8258, EVENTO 10920, MANTENIMIENTO 2610 | Cumple |
| `sp_vx_resumen_estados` | dias_30_detalle_ciclos: `@equipo_codigo = 'CERO-010', @dias = 30, @detalle = 1, @ciclos = 1` | 1 / 3 / 2 / 57 / 3 / 60 | 6 resultados (horas, ciclos, mantenimientos, bloques, ciclos completos y sus bloques); el resultado 1 igual al de 30 días sin @ciclos | 6 resultados; 57 bloques; 3 ciclos completos; resultado 1 igual: sí | Cumple |
| `sp_vx_resumen_estados` | cero_011_sin_mediciones: `@equipo_codigo = 'CERO-011', @dias = 30` | 1 | ultimo_registro NULL y minutos en cero (CERO-011 no tiene mediciones) | ultimo_registro NULL; suma de minutos 0 | Cumple |
| `sp_vx_resumen_estados` | equipo_inexistente: `@equipo_codigo = 'CERO-999', @dias = 7` | 0 | Error "Equipo no encontrado" | Error: Equipo no encontrado. | Cumple |
| `sp_vx_tendencia_variable` | corriente_2_dias: `@equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 2` | 1 / 128 | unidad A; minutos_punto = 15; puntos con promedio entre mínimo y máximo | unidad A; minutos_punto 15; 128 puntos; mínimo ≤ promedio ≤ máximo: sí | Cumple |
| `sp_vx_tendencia_variable` | corriente_7_dias: `@equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 7` | 1 / 90 | unidad A; minutos_punto = 60; puntos con promedio entre mínimo y máximo | unidad A; minutos_punto 60; 90 puntos; mínimo ≤ promedio ≤ máximo: sí | Cumple |
| `sp_vx_tendencia_variable` | corriente_15_dias: `@equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 15` | 1 / 196 | unidad A; minutos_punto = 60; puntos con promedio entre mínimo y máximo | unidad A; minutos_punto 60; 196 puntos; mínimo ≤ promedio ≤ máximo: sí | Cumple |
| `sp_vx_tendencia_variable` | corriente_30_dias: `@equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 30` | 1 / 117 | unidad A; minutos_punto = 240; puntos con promedio entre mínimo y máximo | unidad A; minutos_punto 240; 117 puntos; mínimo ≤ promedio ≤ máximo: sí | Cumple |
| `sp_vx_tendencia_variable` | temperatura_septiembre: `@equipo_codigo = 'CERO-010', @variable_codigo = 'TEMPERATURA_MOT', @desde = '2026-09-01T00:00:00', @hasta = '2026-10-01T00:00:00'` | 1 / 114 | unidad °C; minutos_punto = 240 (30 días); umbral habilitado de 65 °C | unidad °C; minutos_punto 240; umbral_max 65; habilitado true; 114 puntos | Cumple |
| `sp_vx_tendencia_variable` | variable_inexistente: `@equipo_codigo = 'CERO-010', @variable_codigo = 'NO_EXISTE', @dias = 7` | 0 | Error por variable no encontrada | Error: Variable no encontrada. | Cumple |
| `sp_vx_get_horas_motor` | equipo_cero_010: `@equipo_id = '<equipo_id de CERO-010>'` | 1 | Se ejecuta sin error y devuelve las horas vigentes de ResultadosIndividuales del equipo | 1 resultados; filas: 1 | Cumple |
| `sp_vx_get_horas_motor` | sin_parametros: `(sin parámetros)` | 0 | Error "Debe especificar motor_id o equipo_id." | Error: Debe especificar motor_id o equipo_id. | Cumple |
| `sp_vx_get_serie_variable` | corriente_un_dia: `@variable_codigo = 'CORRIENTE_MOTOR', @equipo_id = '<equipo_id de CERO-010>', @desde = '2026-09-15T00:00:00', @hasta = '2026-09-16T00:00:00', @max_puntos = 500` | 480 | Serie de CORRIENTE_MOTOR del 15/09/2026 con 500 puntos como máximo | 1 resultados; 480 puntos en el primero | Cumple |
| `sp_vx_get_serie_variable` | variable_inexistente: `@variable_codigo = 'NO_EXISTE', @equipo_id = '<equipo_id de CERO-010>'` | 0 | Error "Variable "NO_EXISTE" no encontrada." | Error: Variable "NO_EXISTE" no encontrada. | Cumple |
| `sp_vx_login_obtener_usuario` | usuario_existente: `@credencial = 'consulta', @ip_origen = '203.0.113.200'` | 1 / 1 | 2 resultados: ip_bloqueada = 0 y 1 usuario activo con rol CONSULTA (hash oculto en esta evidencia) | 2 resultados; ip_bloqueada false; 1 usuario(s); roles CONSULTA | Cumple |
| `sp_vx_login_obtener_usuario` | usuario_inexistente: `@credencial = 'no.existe', @ip_origen = '203.0.113.200'` | 1 / 0 | 2 resultados: ip_bloqueada = 0 y 0 usuarios | 2 resultados; 0 usuario(s) | Cumple |

**Total:** 19 de 19 casos cumplen.

## Procedimientos no ejecutados

Estos procedimientos **escriben** en la base, así que no se ejecutaron en esta prueba de solo lectura:

- `sp_vx_login_registrar_resultado`: Auditoria y Usuarios.
- `sp_vx_password_cambiar`: Auditoria y Usuarios.
- `sp_vx_password_restablecer_admin`: Auditoria y Usuarios.
- `sp_vx_usuario_crear`: Usuarios, UsuarioRoles y Auditoria.
- `sp_vx_modificar_medicion_demo`: Mediciones, MedicionesModificacion y Auditoria.
- `sp_vx_registrar_intervencion`: IntervencionesMantenimiento, ContadoresCicloMotor, AutorizacionesOperacion y Auditoria.
- `sp_vx_restablecer_demo`: borra y actualiza datos demo.

Los cinco de identidad (V007) tienen pruebas automatizadas con un repositorio en memoria (`apps/backend`, `npm test`) y se verificaron contra VERTEX_DEMO el 30/10/2026, hora de Colombia (ADR 0007); esa verificación no forma parte de esta carpeta.

## Notas

- Los valores esperados de septiembre (ENCENDIDO 21.412, APAGADO 8.258, EVENTO 10.920 y MANTENIMIENTO 2.610 minutos) y los intervalos de la tendencia (≤ 2 días → 15 min; ≤ 16 → 60; ≤ 60 → 240) son los documentados en `CLAUDE.md`.
- `sp_vx_get_horas_motor` lee `ResultadosIndividuales`, que la base demo tiene con 5 filas; su resultado se compara solo con "se ejecuta y devuelve datos", porque no hay un valor esperado documentado.
- Antes de esta ejecución final, el script de prueba se corrigió dos veces por supuestos del propio script, no de los procedimientos: los nombres de columna del resultado 1 de `sp_vx_resumen_estados` (`min_encendido`…, en minúsculas; para CERO-011 se usa `ultimo_registro`, porque `fecha_referencia` es un campo de la API) y el número de resultados sin `@detalle` (3, no 4). Los valores que devolvieron los procedimientos fueron los mismos en todas las ejecuciones.
- Fecha de plan de la tarea: 05/10–08/10/2026. Esta ejecución es posterior (31/10/2026).
