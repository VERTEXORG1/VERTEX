-- sp_vx_get_serie_variable: casos ejecutados contra VERTEX_DEMO el 2026-10-31 13:00:33.806Z (UTC)
-- Cada caso se ejecutó dentro de una transacción revertida (ROLLBACK).

-- Caso corriente_un_dia
EXEC dbo.sp_vx_get_serie_variable @variable_codigo = 'CORRIENTE_MOTOR', @equipo_id = '<equipo_id de CERO-010>', @desde = '2026-09-15T00:00:00', @hasta = '2026-09-16T00:00:00', @max_puntos = 500;

-- Caso variable_inexistente
EXEC dbo.sp_vx_get_serie_variable @variable_codigo = 'NO_EXISTE', @equipo_id = '<equipo_id de CERO-010>';
