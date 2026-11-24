SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================================
-- R__sp_vx_dispositivo_credencial.sql
-- Datos para autenticar un dispositivo de captura (V010): el backend compara
-- el SHA-256 de la clave recibida con clave_hash. Sin filas si el dispositivo
-- no existe, esta inactivo, no tiene clave o no pertenece a un CERO activo.
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.sp_vx_dispositivo_credencial
    @codigo VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT d.codigo, d.clave_hash, e.codigo AS equipo_codigo
    FROM dbo.Dispositivos d
    JOIN dbo.EquiposCero  e ON e.equipo_id = d.equipo_id
    WHERE d.codigo = @codigo
      AND d.activo = 1
      AND d.clave_hash IS NOT NULL
      AND e.activo = 1;
END
GO
