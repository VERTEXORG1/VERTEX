-- sp_vx_tendencia_variable: casos ejecutados contra VERTEX_DEMO el 2026-10-31 13:00:33.806Z (UTC)
-- Cada caso se ejecutó dentro de una transacción revertida (ROLLBACK).

-- Caso corriente_2_dias
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 2;

-- Caso corriente_7_dias
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 7;

-- Caso corriente_15_dias
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 15;

-- Caso corriente_30_dias
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'CORRIENTE_MOTOR', @dias = 30;

-- Caso temperatura_septiembre
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'TEMPERATURA_MOT', @desde = '2026-09-01T00:00:00', @hasta = '2026-10-01T00:00:00';

-- Caso variable_inexistente
EXEC dbo.sp_vx_tendencia_variable @equipo_codigo = 'CERO-010', @variable_codigo = 'NO_EXISTE', @dias = 7;
