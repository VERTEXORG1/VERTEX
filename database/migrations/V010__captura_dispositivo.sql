SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================================
-- V010__captura_dispositivo.sql
-- Recepcion de lotes del dispositivo de captura (ESP32 de la Etapa A).
--
--   dbo.Dispositivos  + equipo_id       CERO al que pertenece el dispositivo
--                                       (el dispositivo es del CERO, no del motor)
--                     + clave_hash      SHA-256 de la clave del dispositivo; la
--                                       clave solo la conocen el ESP32 y quien la
--                                       registra (database/scripts/07_registrar_dispositivo.sql)
--                     + ultimo_contacto ultimo lote recibido (hora del servidor, UTC)
--
-- Duplicados: cada lectura se guarda en RegistrosOriginales con
-- record_id = event_time del RTC (UQ_RegOrig_externo: dispositivo + record_id),
-- asi un lote reenviado tras una falla de red no duplica nada.
-- Procedimientos: R__sp_vx_dispositivo_credencial.sql y R__sp_vx_captura_lote_recibir.sql.
--
-- Re-ejecutable. Aplica a: VERTEX_DEMO y VERTEX_REAL
-- ============================================================

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.Dispositivos', 'equipo_id') IS NULL
BEGIN
    ALTER TABLE dbo.Dispositivos ADD equipo_id UNIQUEIDENTIFIER NULL
        CONSTRAINT FK_Disp_equipo FOREIGN KEY REFERENCES dbo.EquiposCero (equipo_id);
    PRINT '++ Dispositivos.equipo_id agregada.';
END
GO

IF COL_LENGTH('dbo.Dispositivos', 'clave_hash') IS NULL
BEGIN
    ALTER TABLE dbo.Dispositivos ADD clave_hash VARBINARY(32) NULL;
    PRINT '++ Dispositivos.clave_hash agregada.';
END
GO

IF COL_LENGTH('dbo.Dispositivos', 'ultimo_contacto') IS NULL
BEGIN
    ALTER TABLE dbo.Dispositivos ADD ultimo_contacto DATETIME2(3) NULL;
    PRINT '++ Dispositivos.ultimo_contacto agregada.';
END
GO
