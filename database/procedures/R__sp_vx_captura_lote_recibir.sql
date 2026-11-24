SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ============================================================
-- R__sp_vx_captura_lote_recibir.sql
-- Guarda un lote de lecturas del dispositivo de captura (V010).
--
-- @registros: arreglo JSON que arma el backend (ya validado):
--   [{ "record_id": "2026-11-24T14:37:00Z",          -- event_time del RTC, tal como llego
--      "event_time": "2026-11-24T14:37:00.000",      -- el mismo instante, UTC
--      "registro": { "equipo": "CERO-011", "seq": 5, "event_time": "...Z",
--                    "lecturas": { "TEMPERATURA_MOT": 31.5, "CORRIENTE_MOTOR": 0 } } }]
--
-- Por cada lectura nueva: una fila en RegistrosOriginales (el JSON tal como llego)
-- y una en Mediciones por cada variable con valor (null = sin lectura).
-- Duplicados: si el dispositivo ya envio ese event_time (UQ dispositivo +
-- record_id) la lectura se ignora; tampoco se repite una medicion del mismo
-- CERO, variable y event_time. Variables que no estan en el catalogo se ignoran.
-- equipo_id = CERO del dispositivo; motor_id = motor montado en ese instante
-- (EquipoMotorHistorial, NULL si no hay); sensor_id = sensor del dispositivo
-- para esa variable (NULL si no esta registrado).
--
-- Devuelve: recibidas, nuevas, duplicadas, mediciones (filas insertadas).
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.sp_vx_captura_lote_recibir
    @dispositivo_codigo VARCHAR(50),
    @registros          NVARCHAR(MAX),
    @provenance         VARCHAR(20) = 'REAL'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @dispositivo_id UNIQUEIDENTIFIER, @equipo_id UNIQUEIDENTIFIER;
    SELECT @dispositivo_id = dispositivo_id, @equipo_id = equipo_id
    FROM dbo.Dispositivos
    WHERE codigo = @dispositivo_codigo AND activo = 1;

    IF @dispositivo_id IS NULL OR @equipo_id IS NULL
        THROW 50404, 'Dispositivo no registrado.', 1;
    IF ISJSON(@registros) = 0
        THROW 50400, 'Lote invalido.', 1;

    DECLARE @recibidas INT = (SELECT COUNT(*) FROM OPENJSON(@registros));

    CREATE TABLE #r (
        record_id   VARCHAR(100)     COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY,
        event_time  DATETIME2(3)     NOT NULL,
        registro    NVARCHAR(MAX)    NOT NULL,
        nuevo       BIT              NOT NULL DEFAULT 0,
        registro_id UNIQUEIDENTIFIER NULL
    );

    -- Un mismo event_time repetido dentro del lote cuenta una sola vez
    INSERT INTO #r (record_id, event_time, registro)
    SELECT record_id, event_time, registro
    FROM (
        SELECT j.record_id, j.event_time, j.registro,
               ROW_NUMBER() OVER (PARTITION BY j.record_id ORDER BY (SELECT NULL)) AS n
        FROM OPENJSON(@registros) WITH (
            record_id  VARCHAR(100)  '$.record_id',
            event_time DATETIME2(3)  '$.event_time',
            registro   NVARCHAR(MAX) '$.registro' AS JSON
        ) j
        WHERE j.record_id IS NOT NULL AND j.event_time IS NOT NULL AND j.registro IS NOT NULL
    ) x
    WHERE x.n = 1;

    DECLARE @paquete_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @ahora DATETIME2(3) = SYSUTCDATETIME();
    DECLARE @mediciones INT;

    BEGIN TRANSACTION;

    INSERT INTO dbo.PaquetesAdquisicion
        (paquete_id, dispositivo_id, packet_id, received_time, num_registros, estado, provenance)
    VALUES
        (@paquete_id, @dispositivo_id, 'LOTE-' + CONVERT(VARCHAR(36), @paquete_id), @ahora,
         @recibidas, 'PROCESADO', @provenance);

    -- UPDLOCK + HOLDLOCK: dos envios simultaneos del mismo lote no chocan
    UPDATE r SET nuevo = 1, registro_id = NEWID()
    FROM #r r
    WHERE NOT EXISTS (SELECT 1 FROM dbo.RegistrosOriginales o WITH (UPDLOCK, HOLDLOCK)
                      WHERE o.dispositivo_id = @dispositivo_id AND o.record_id = r.record_id);

    INSERT INTO dbo.RegistrosOriginales
        (registro_id, paquete_id, dispositivo_id, record_id, raw_payload, received_time)
    SELECT registro_id, @paquete_id, @dispositivo_id, record_id, registro, @ahora
    FROM #r
    WHERE nuevo = 1;

    INSERT INTO dbo.Mediciones
        (variable_id, equipo_id, motor_id, sensor_id, registro_id, valor, unidad,
         event_time, received_time, provenance)
    SELECT v.variable_id, @equipo_id, h.motor_id, s.sensor_id, r.registro_id,
           CAST(CAST(l.[value] AS FLOAT) AS DECIMAL(18,6)), v.unidad,
           r.event_time, @ahora, @provenance
    FROM #r r
    CROSS APPLY OPENJSON(r.registro, '$.lecturas') l
    JOIN dbo.Variables v ON v.codigo = l.[key] COLLATE DATABASE_DEFAULT
    OUTER APPLY (SELECT TOP 1 eh.motor_id
                 FROM dbo.EquipoMotorHistorial eh
                 WHERE eh.equipo_id = @equipo_id
                   AND eh.fecha_inicio <= r.event_time
                   AND (eh.fecha_fin IS NULL OR eh.fecha_fin > r.event_time)
                 ORDER BY eh.fecha_inicio DESC) h
    OUTER APPLY (SELECT TOP 1 se.sensor_id
                 FROM dbo.Sensores se
                 WHERE se.dispositivo_id = @dispositivo_id AND se.variable_id = v.variable_id AND se.activo = 1) s
    WHERE r.nuevo = 1
      AND l.[type] = 2   -- numero; null (tipo 0) = sin lectura
      AND NOT EXISTS (SELECT 1 FROM dbo.Mediciones m
                      WHERE m.equipo_id = @equipo_id AND m.variable_id = v.variable_id
                        AND m.event_time = r.event_time);
    SET @mediciones = @@ROWCOUNT;

    UPDATE dbo.Dispositivos SET ultimo_contacto = @ahora WHERE dispositivo_id = @dispositivo_id;

    COMMIT TRANSACTION;

    DECLARE @nuevas INT = (SELECT COUNT(*) FROM #r WHERE nuevo = 1);
    SELECT @recibidas              AS recibidas,
           @nuevas                 AS nuevas,
           @recibidas - @nuevas    AS duplicadas,
           @mediciones             AS mediciones;
END
GO
