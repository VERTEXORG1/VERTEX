-- sp_vx_get_horas_motor: casos ejecutados contra VERTEX_DEMO el 2026-10-31 13:00:33.806Z (UTC)
-- Cada caso se ejecutó dentro de una transacción revertida (ROLLBACK).

-- Caso equipo_cero_010
EXEC dbo.sp_vx_get_horas_motor @equipo_id = '<equipo_id de CERO-010>';

-- Caso sin_parametros
EXEC dbo.sp_vx_get_horas_motor;
