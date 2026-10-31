-- sp_vx_resumen_estados: casos ejecutados contra VERTEX_DEMO el 2026-10-31 13:00:33.806Z (UTC)
-- Cada caso se ejecutó dentro de una transacción revertida (ROLLBACK).

-- Caso dias_7
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-010', @dias = 7;

-- Caso dias_15
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-010', @dias = 15;

-- Caso dias_30
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-010', @dias = 30;

-- Caso septiembre
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-010', @desde = '2026-09-01T00:00:00', @hasta = '2026-10-01T00:00:00';

-- Caso dias_30_detalle_ciclos
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-010', @dias = 30, @detalle = 1, @ciclos = 1;

-- Caso cero_011_sin_mediciones
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-011', @dias = 30;

-- Caso equipo_inexistente
EXEC dbo.sp_vx_resumen_estados @equipo_codigo = 'CERO-999', @dias = 7;
