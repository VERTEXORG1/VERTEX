-- sp_vx_login_obtener_usuario: casos ejecutados contra VERTEX_DEMO el 2026-10-31 13:00:33.806Z (UTC)
-- Cada caso se ejecutó dentro de una transacción revertida (ROLLBACK).

-- Caso usuario_existente
EXEC dbo.sp_vx_login_obtener_usuario @credencial = 'consulta', @ip_origen = '203.0.113.200';

-- Caso usuario_inexistente
EXEC dbo.sp_vx_login_obtener_usuario @credencial = 'no.existe', @ip_origen = '203.0.113.200';
