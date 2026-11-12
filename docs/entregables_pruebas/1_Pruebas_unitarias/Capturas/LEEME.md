# Capturas de las pruebas unitarias

Caja blanca (CB-NN): el visor de trazas paso a paso (código, variables, pila y resultado) o, en PU-03-03, la prueba Vitest con sus aserciones. Caja negra (CN-NN): entradas, resultado esperado y obtenido. 1366×768, sin editar. El número es el que cita la columna «Resultado observado» de *1_VERTEX_Pruebas_unitarias.docx*.

| Captura | Caso | RF | Qué muestra |
|---|---|---|---|
| CB-001 | PU-01-01 | RF-01 | Caja blanca · Normal: periodo query rango |
| CB-002 | PU-01-01 | RF-01 | Caja blanca · Normal (días): periodo query dias |
| CB-003 | PU-01-01 | RF-01 | Caja blanca · Límite (Todo): periodo query todo vacio |
| CB-004 | PU-01-02 | RF-01 | Caja blanca · Normal: periodo clave rango |
| CB-005 | PU-01-02 | RF-01 | Caja blanca · Límite (Todo): es dias todo |
| CB-006 | PU-01-02 | RF-01 | Caja blanca · Inválido: es dias con rango falso |
| CB-007 | PU-01-03 | RF-01 | Caja blanca · Normal: leer periodo dias 30 |
| CB-008 | PU-01-03 | RF-01 | Caja blanca · Límite (1): leer periodo dias 1 aceptado |
| CB-009 | PU-01-03 | RF-01 | Caja blanca · Límite (3650): leer periodo dias 3650 aceptado |
| CB-010 | PU-01-03 | RF-01 | Caja blanca · Inválido (0): leer periodo dias 0 400 |
| CB-011 | PU-01-03 | RF-01 | Caja blanca · Inválido (3651): leer periodo dias 3651 400 |
| CB-012 | PU-01-03 | RF-01 | Caja blanca · Inválido (abc): leer periodo dias texto 400 |
| CB-013 | PU-01-04 | RF-01 | Caja blanca · Normal: leer periodo rango septiembre |
| CB-014 | PU-01-04 | RF-01 | Caja blanca · Límite (un día): leer periodo rango un dia |
| CB-015 | PU-01-04 | RF-01 | Caja blanca · Inválido (hasta < desde): leer periodo rango invertido 400 |
| CB-016 | PU-01-04 | RF-01 | Caja blanca · Inválido (30/02): leer periodo fecha inexistente 400 |
| CB-017 | PU-01-05 | RF-01 | Caja blanca · Normal (200): get equipo cero010 encontrado |
| CB-018 | PU-01-05 | RF-01 | Caja blanca · Límite (minúsculas y espacios): get equipo codigo normalizado |
| CB-019 | PU-01-05 | RF-01 | Caja blanca · Inválido (404): get equipo cero012 no encontrado |
| CB-020 | PU-01-05 | RF-01 | Caja blanca · Inválido (503): get equipo sin base 503 |
| CB-021 | PU-01-06 | RF-01 | Caja blanca · Normal: resolver ruta cero010 |
| CB-022 | PU-01-06 | RF-01 | Caja blanca · Inválido: resolver ruta nivel inexistente null |
| CB-023 | PU-01-06 | RF-01 | Caja blanca · Límite: resolver ruta vacia |
| CB-024 | PU-01-07 | RF-01 | Caja blanca · Normal: texto ruta cero010 |
| CB-025 | PU-01-07 | RF-01 | Caja blanca · Inválido: texto ruta inexistente vacio |
| CB-026 | PU-02-01 | RF-02 | Caja blanca · Normal (septiembre de CERO-010): minutos por segmento septiembre |
| CB-027 | PU-02-02 | RF-02 | Caja blanca · Límite (hueco de 30 y de 31 min): regla1 hueco 30 no 31 si |
| CB-028 | PU-02-03 | RF-02 | Caja blanca · Límite (0,10 A / 0,11 A / ESTADO_MOTOR): regla4 corriente cero y estado motor |
| CB-029 | PU-02-04 | RF-02 | Caja blanca · Normal (marca del 21/09 06:11): regla4b evento hasta mantenimiento |
| CB-030 | PU-02-05 | RF-02 | Caja blanca · Normal (30 días): ciclos no cambian resultados 1 a 4 30d |
| CB-031 | PU-02-05 | RF-02 | Caja blanca · Normal (septiembre): ciclos no cambian resultados 1 a 4 septiembre |
| CB-032 | PU-02-06 | RF-02 | Caja blanca · Sin datos (CERO-011): sin mediciones cero011 |
| CB-033 | PU-02-06 | RF-02 | Caja blanca · Inválido (equipo inexistente): equipo inexistente |
| CB-034 | PU-02-07 | RF-02 | Caja blanca · Normal (30 días): demo bloques 30 dias |
| CB-035 | PU-02-07 | RF-02 | Caja blanca · Normal (septiembre): demo bloques septiembre |
| CB-036 | PU-02-07 | RF-02 | Caja blanca · Límite (Todo): demo bloques todo |
| CB-037 | PU-02-07 | RF-02 | Caja blanca · Inválido (CERO-013): demo bloques equipo no encontrado |
| CB-038 | PU-03-01 | RF-03 | Caja blanca · Normal (30 días): find bloques 30 dias orden y ciclo en curso |
| CB-039 | PU-03-01 | RF-03 | Caja blanca · Normal (septiembre): find bloques septiembre |
| CB-040 | PU-03-01 | RF-03 | Caja blanca · Límite (sin mediciones): find bloques cero011 sin mediciones |
| CB-041 | PU-03-01 | RF-03 | Caja blanca · Inválido (no existe): find bloques equipo inexistente null |
| CB-042 | PU-03-02 | RF-03 | Caja blanca · Normal (sin conexión): error de base sin conexion |
| CB-043 | PU-03-02 | RF-03 | Caja blanca · Normal (ETIMEOUT): error de base timeout |
| CB-044 | PU-03-02 | RF-03 | Caja blanca · Límite (solo código): error de base codigo econnreset |
| CB-045 | PU-03-02 | RF-03 | Caja blanca · Inválido (error de consulta): error de base otro error null |
| CB-046 | PU-03-03 | RF-03 | Caja blanca · Límite (502): error de respuesta 502 |
| CB-047 | PU-03-03 | RF-03 | Caja blanca · Normal (503): error de respuesta 503 |
| CB-048 | PU-03-03 | RF-03 | Caja blanca · Límite (504): error de respuesta 504 |
| CB-049 | PU-03-03 | RF-03 | Caja blanca · Inválido (400): error de respuesta 400 |
| CB-050 | PU-03-03 | RF-03 | Caja blanca · Inválido (404): error de respuesta 404 |
| CB-051 | PU-03-03 | RF-03 | Caja blanca · Límite (500): error de respuesta 500 |
| CB-052 | PU-03-03 | RF-03 | Caja blanca · Falla temporal (502): reintento 502 |
| CB-053 | PU-03-03 | RF-03 | Caja blanca · Falla temporal (503): reintento 503 |
| CB-054 | PU-03-03 | RF-03 | Caja blanca · Falla temporal (504): reintento 504 |
| CB-055 | PU-03-03 | RF-03 | Caja blanca · Sin red: reintento sin red |
| CB-056 | PU-03-03 | RF-03 | Caja blanca · Recuperación: reintento recupera |
| CB-057 | PU-03-03 | RF-03 | Caja blanca · Error definitivo (400): sin reintento 400 |
| CB-058 | PU-03-03 | RF-03 | Caja blanca · Error definitivo (404): sin reintento 404 |
| CB-059 | PU-03-03 | RF-03 | Caja blanca · Error definitivo (500): sin reintento 500 |
| CB-060 | PU-03-03 | RF-03 | Caja blanca · Botón Reintentar: boton reintentar |
| CB-061 | PU-03-04 | RF-06 | Caja blanca · Normal: romano 4 IV |
| CB-062 | PU-03-04 | RF-06 | Caja blanca · Límite (1): romano 1 I |
| CB-063 | PU-03-04 | RF-06 | Caja blanca · Inválido (0): romano 0 vacio |
| CB-064 | PU-03-04 | RF-06 | Caja blanca · Normal (2 ciclos): radio numero 2 ciclos 32 |
| CB-065 | PU-03-04 | RF-06 | Caja blanca · Normal (3 ciclos): radio numero 3 ciclos 42 |
| CB-066 | PU-03-04 | RF-06 | Caja blanca · Límite (4 ciclos): radio numero 4 ciclos 46 |
| CB-067 | PU-03-05 | RF-06 | Caja blanca · Normal (ciclo II): bloques del ciclo II |
| CB-068 | PU-03-05 | RF-06 | Caja blanca · Límite (ciclo en curso): bloques del ciclo en curso |
| CB-069 | PU-03-05 | RF-06 | Caja blanca · Normal (Todo = I + II + …): suma de ciclos igual a todo |
| CB-070 | PU-03-06 | RF-03 | Caja blanca · Normal: health base conectada |
| CB-071 | PU-03-06 | RF-03 | Caja blanca · Inválido (sin base): health base sin conexion |
| CB-072 | PU-04-01 | RF-04 | Caja blanca · Normal: linea referencia corriente |
| CB-073 | PU-04-01 | RF-04 | Caja blanca · Normal (vibración): linea referencia vibracion |
| CB-074 | PU-04-01 | RF-04 | Caja blanca · Normal (temperatura): linea referencia temperatura |
| CB-075 | PU-04-01 | RF-04 | Caja blanca · Normal (voltaje): linea referencia voltaje |
| CB-076 | PU-04-01 | RF-04 | Caja blanca · Límite (producción): linea referencia produccion sin marcar |
| CB-077 | PU-04-02 | RF-04 | Caja blanca · Normal: minutos detalle 2 dias 15 |
| CB-078 | PU-04-02 | RF-04 | Caja blanca · Límite (16 días): minutos detalle 16 dias 15 |
| CB-079 | PU-04-02 | RF-04 | Caja blanca · Límite (16 días + 1 ms): minutos detalle mas 16 dias 60 |
| CB-080 | PU-04-03 | RF-04 | Caja blanca · Límite (2 días): intervalo automatico 2 dias |
| CB-081 | PU-04-03 | RF-04 | Caja blanca · Límite (3 días): intervalo automatico 3 dias |
| CB-082 | PU-04-03 | RF-04 | Caja blanca · Límite (16 días): intervalo automatico 16 dias |
| CB-083 | PU-04-03 | RF-04 | Caja blanca · Límite (17 días): intervalo automatico 17 dias |
| CB-084 | PU-04-03 | RF-04 | Caja blanca · Límite (60 días): intervalo automatico 60 dias |
| CB-085 | PU-04-03 | RF-04 | Caja blanca · Límite (61 días: más): intervalo automatico 61 dias |
| CB-086 | PU-04-04 | RF-04 | Caja blanca · Normal (7 variables): mediciones siete variables 200 |
| CB-087 | PU-04-04 | RF-04 | Caja blanca · Límite (minúsculas): mediciones variable en minusculas |
| CB-088 | PU-04-04 | RF-04 | Caja blanca · Inválido (PRESION): mediciones variable inexistente 400 |
| CB-089 | PU-04-04 | RF-04 | Caja blanca · Inválido (vacía): mediciones variable vacia 400 |
| CB-090 | PU-04-04 | RF-04 | Caja blanca · Inválido (sin variable): mediciones sin variable 400 |
| CB-091 | PU-04-05 | RF-04 | Caja blanca · Normal (CERO-010): demo marca cero010 |
| CB-092 | PU-04-05 | RF-04 | Caja blanca · Normal (CERO-012): demo marca cero012 |
| CB-093 | PU-04-05 | RF-04 | Caja blanca · Límite (sin marca): demo marca cero011 null |
| CB-094 | PU-04-05 | RF-04 | Caja blanca · Normal (tendencia = bloques): marca igual en tendencia y bloques |
| CB-095 | PU-04-06 | RF-04 | Caja blanca · Normal: episodios dos tramos |
| CB-096 | PU-04-06 | RF-04 | Caja blanca · Normal (parada): episodios parada corta |
| CB-097 | PU-04-06 | RF-04 | Caja blanca · Límite (= línea): episodios igual a la linea |
| CB-098 | PU-04-06 | RF-04 | Caja blanca · Inválido (sin puntos): episodios sin puntos |
| CB-099 | PU-06-01 | RF-06 | Caja blanca · Normal (toda la historia): cinco ciclos cuatro mantenimientos |
| CB-100 | PU-06-02 | RF-06 | Caja blanca · Límite (30 % y más de 30 %): regla2 porcentaje evento 30 |
| CB-101 | PU-06-03 | RF-06 | Caja blanca · Normal (@hasta a mitad de un ciclo): ciclo leido hasta su cierre |
| CB-102 | PU-08-01 | RF-08 | Caja blanca · Normal: login demo token local 8h |
| CB-103 | PU-08-01 | RF-08 | Caja blanca · Límite (mayúsculas): login demo correo sin distinguir mayusculas |
| CB-104 | PU-08-01 | RF-08 | Caja blanca · Inválido (contraseña): login demo contrasena erronea |
| CB-105 | PU-08-01 | RF-08 | Caja blanca · Inválido (sin credenciales demo): login demo sin variables vacio |
| CB-106 | PU-08-02 | RF-08 | Caja blanca · Normal (VERTEX_PRUEBAS): integridad variables resumen ok |
| CN-001 | PU-01-01 | RF-01 | Caja negra · Normal: periodo query rango |
| CN-002 | PU-01-01 | RF-01 | Caja negra · Normal (días): periodo query dias |
| CN-003 | PU-01-01 | RF-01 | Caja negra · Límite (Todo): periodo query todo vacio |
| CN-004 | PU-01-02 | RF-01 | Caja negra · Normal: periodo clave rango |
| CN-005 | PU-01-02 | RF-01 | Caja negra · Límite (Todo): es dias todo |
| CN-006 | PU-01-02 | RF-01 | Caja negra · Inválido: es dias con rango falso |
| CN-007 | PU-01-03 | RF-01 | Caja negra · Normal: leer periodo dias 30 |
| CN-008 | PU-01-03 | RF-01 | Caja negra · Límite (1): leer periodo dias 1 aceptado |
| CN-009 | PU-01-03 | RF-01 | Caja negra · Límite (3650): leer periodo dias 3650 aceptado |
| CN-010 | PU-01-03 | RF-01 | Caja negra · Inválido (0): leer periodo dias 0 400 |
| CN-011 | PU-01-03 | RF-01 | Caja negra · Inválido (3651): leer periodo dias 3651 400 |
| CN-012 | PU-01-03 | RF-01 | Caja negra · Inválido (abc): leer periodo dias texto 400 |
| CN-013 | PU-01-04 | RF-01 | Caja negra · Normal: leer periodo rango septiembre |
| CN-014 | PU-01-04 | RF-01 | Caja negra · Límite (un día): leer periodo rango un dia |
| CN-015 | PU-01-04 | RF-01 | Caja negra · Inválido (hasta < desde): leer periodo rango invertido 400 |
| CN-016 | PU-01-04 | RF-01 | Caja negra · Inválido (30/02): leer periodo fecha inexistente 400 |
| CN-017 | PU-01-05 | RF-01 | Caja negra · Normal (200): get equipo cero010 encontrado |
| CN-018 | PU-01-05 | RF-01 | Caja negra · Límite (minúsculas y espacios): get equipo codigo normalizado |
| CN-019 | PU-01-05 | RF-01 | Caja negra · Inválido (404): get equipo cero012 no encontrado |
| CN-020 | PU-01-05 | RF-01 | Caja negra · Inválido (503): get equipo sin base 503 |
| CN-021 | PU-01-06 | RF-01 | Caja negra · Normal: resolver ruta cero010 |
| CN-022 | PU-01-06 | RF-01 | Caja negra · Inválido: resolver ruta nivel inexistente null |
| CN-023 | PU-01-06 | RF-01 | Caja negra · Límite: resolver ruta vacia |
| CN-024 | PU-01-07 | RF-01 | Caja negra · Normal: texto ruta cero010 |
| CN-025 | PU-01-07 | RF-01 | Caja negra · Inválido: texto ruta inexistente vacio |
| CN-026 | PU-02-01 | RF-02 | Caja negra · Normal (septiembre de CERO-010): minutos por segmento septiembre |
| CN-027 | PU-02-02 | RF-02 | Caja negra · Límite (hueco de 30 y de 31 min): regla1 hueco 30 no 31 si |
| CN-028 | PU-02-03 | RF-02 | Caja negra · Límite (0,10 A / 0,11 A / ESTADO_MOTOR): regla4 corriente cero y estado motor |
| CN-029 | PU-02-04 | RF-02 | Caja negra · Normal (marca del 21/09 06:11): regla4b evento hasta mantenimiento |
| CN-030 | PU-02-05 | RF-02 | Caja negra · Normal (30 días): ciclos no cambian resultados 1 a 4 30d |
| CN-031 | PU-02-05 | RF-02 | Caja negra · Normal (septiembre): ciclos no cambian resultados 1 a 4 septiembre |
| CN-032 | PU-02-06 | RF-02 | Caja negra · Sin datos (CERO-011): sin mediciones cero011 |
| CN-033 | PU-02-06 | RF-02 | Caja negra · Inválido (equipo inexistente): equipo inexistente |
| CN-034 | PU-02-07 | RF-02 | Caja negra · Normal (30 días): demo bloques 30 dias |
| CN-035 | PU-02-07 | RF-02 | Caja negra · Normal (septiembre): demo bloques septiembre |
| CN-036 | PU-02-07 | RF-02 | Caja negra · Límite (Todo): demo bloques todo |
| CN-037 | PU-02-07 | RF-02 | Caja negra · Inválido (CERO-013): demo bloques equipo no encontrado |
| CN-038 | PU-03-01 | RF-03 | Caja negra · Normal (30 días): find bloques 30 dias orden y ciclo en curso |
| CN-039 | PU-03-01 | RF-03 | Caja negra · Normal (septiembre): find bloques septiembre |
| CN-040 | PU-03-01 | RF-03 | Caja negra · Límite (sin mediciones): find bloques cero011 sin mediciones |
| CN-041 | PU-03-01 | RF-03 | Caja negra · Inválido (no existe): find bloques equipo inexistente null |
| CN-042 | PU-03-02 | RF-03 | Caja negra · Normal (sin conexión): error de base sin conexion |
| CN-043 | PU-03-02 | RF-03 | Caja negra · Normal (ETIMEOUT): error de base timeout |
| CN-044 | PU-03-02 | RF-03 | Caja negra · Límite (solo código): error de base codigo econnreset |
| CN-045 | PU-03-02 | RF-03 | Caja negra · Inválido (error de consulta): error de base otro error null |
| CN-046 | PU-03-03 | RF-03 | Caja negra · Límite (502): error de respuesta 502 |
| CN-047 | PU-03-03 | RF-03 | Caja negra · Normal (503): error de respuesta 503 |
| CN-048 | PU-03-03 | RF-03 | Caja negra · Límite (504): error de respuesta 504 |
| CN-049 | PU-03-03 | RF-03 | Caja negra · Inválido (400): error de respuesta 400 |
| CN-050 | PU-03-03 | RF-03 | Caja negra · Inválido (404): error de respuesta 404 |
| CN-051 | PU-03-03 | RF-03 | Caja negra · Límite (500): error de respuesta 500 |
| CN-052 | PU-03-04 | RF-06 | Caja negra · Normal: romano 4 IV |
| CN-053 | PU-03-04 | RF-06 | Caja negra · Límite (1): romano 1 I |
| CN-054 | PU-03-04 | RF-06 | Caja negra · Inválido (0): romano 0 vacio |
| CN-055 | PU-03-04 | RF-06 | Caja negra · Normal (2 ciclos): radio numero 2 ciclos 32 |
| CN-056 | PU-03-04 | RF-06 | Caja negra · Normal (3 ciclos): radio numero 3 ciclos 42 |
| CN-057 | PU-03-04 | RF-06 | Caja negra · Límite (4 ciclos): radio numero 4 ciclos 46 |
| CN-058 | PU-03-05 | RF-06 | Caja negra · Normal (ciclo II): bloques del ciclo II |
| CN-059 | PU-03-05 | RF-06 | Caja negra · Límite (ciclo en curso): bloques del ciclo en curso |
| CN-060 | PU-03-05 | RF-06 | Caja negra · Normal (Todo = I + II + …): suma de ciclos igual a todo |
| CN-061 | PU-03-06 | RF-03 | Caja negra · Normal: health base conectada |
| CN-062 | PU-03-06 | RF-03 | Caja negra · Inválido (sin base): health base sin conexion |
| CN-063 | PU-04-01 | RF-04 | Caja negra · Normal: linea referencia corriente |
| CN-064 | PU-04-01 | RF-04 | Caja negra · Normal (vibración): linea referencia vibracion |
| CN-065 | PU-04-01 | RF-04 | Caja negra · Normal (temperatura): linea referencia temperatura |
| CN-066 | PU-04-01 | RF-04 | Caja negra · Normal (voltaje): linea referencia voltaje |
| CN-067 | PU-04-01 | RF-04 | Caja negra · Límite (producción): linea referencia produccion sin marcar |
| CN-068 | PU-04-02 | RF-04 | Caja negra · Normal: minutos detalle 2 dias 15 |
| CN-069 | PU-04-02 | RF-04 | Caja negra · Límite (16 días): minutos detalle 16 dias 15 |
| CN-070 | PU-04-02 | RF-04 | Caja negra · Límite (16 días + 1 ms): minutos detalle mas 16 dias 60 |
| CN-071 | PU-04-03 | RF-04 | Caja negra · Límite (2 días): intervalo automatico 2 dias |
| CN-072 | PU-04-03 | RF-04 | Caja negra · Límite (3 días): intervalo automatico 3 dias |
| CN-073 | PU-04-03 | RF-04 | Caja negra · Límite (16 días): intervalo automatico 16 dias |
| CN-074 | PU-04-03 | RF-04 | Caja negra · Límite (17 días): intervalo automatico 17 dias |
| CN-075 | PU-04-03 | RF-04 | Caja negra · Límite (60 días): intervalo automatico 60 dias |
| CN-076 | PU-04-03 | RF-04 | Caja negra · Límite (61 días: más): intervalo automatico 61 dias |
| CN-077 | PU-04-04 | RF-04 | Caja negra · Normal (7 variables): mediciones siete variables 200 |
| CN-078 | PU-04-04 | RF-04 | Caja negra · Límite (minúsculas): mediciones variable en minusculas |
| CN-079 | PU-04-04 | RF-04 | Caja negra · Inválido (PRESION): mediciones variable inexistente 400 |
| CN-080 | PU-04-04 | RF-04 | Caja negra · Inválido (vacía): mediciones variable vacia 400 |
| CN-081 | PU-04-04 | RF-04 | Caja negra · Inválido (sin variable): mediciones sin variable 400 |
| CN-082 | PU-04-05 | RF-04 | Caja negra · Normal (CERO-010): demo marca cero010 |
| CN-083 | PU-04-05 | RF-04 | Caja negra · Normal (CERO-012): demo marca cero012 |
| CN-084 | PU-04-05 | RF-04 | Caja negra · Límite (sin marca): demo marca cero011 null |
| CN-085 | PU-04-05 | RF-04 | Caja negra · Normal (tendencia = bloques): marca igual en tendencia y bloques |
| CN-086 | PU-04-06 | RF-04 | Caja negra · Normal: episodios dos tramos |
| CN-087 | PU-04-06 | RF-04 | Caja negra · Normal (parada): episodios parada corta |
| CN-088 | PU-04-06 | RF-04 | Caja negra · Límite (= línea): episodios igual a la linea |
| CN-089 | PU-04-06 | RF-04 | Caja negra · Inválido (sin puntos): episodios sin puntos |
| CN-090 | PU-06-01 | RF-06 | Caja negra · Normal (toda la historia): cinco ciclos cuatro mantenimientos |
| CN-091 | PU-06-02 | RF-06 | Caja negra · Límite (30 % y más de 30 %): regla2 porcentaje evento 30 |
| CN-092 | PU-06-03 | RF-06 | Caja negra · Normal (@hasta a mitad de un ciclo): ciclo leido hasta su cierre |
| CN-093 | PU-08-01 | RF-08 | Caja negra · Normal: login demo token local 8h |
| CN-094 | PU-08-01 | RF-08 | Caja negra · Límite (mayúsculas): login demo correo sin distinguir mayusculas |
| CN-095 | PU-08-01 | RF-08 | Caja negra · Inválido (contraseña): login demo contrasena erronea |
| CN-096 | PU-08-01 | RF-08 | Caja negra · Inválido (sin credenciales demo): login demo sin variables vacio |
| CN-097 | PU-08-02 | RF-08 | Caja negra · Normal (VERTEX_PRUEBAS): integridad variables resumen ok |
