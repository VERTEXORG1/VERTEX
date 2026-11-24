-- ============================================================
-- 07_registrar_dispositivo.sql
-- Registra (o actualiza) un dispositivo de captura y su clave (V010).
-- Ejecutar con un login con escritura (-E), nunca con app_demo_user:
--
--   sqlcmd -S localhost -E -d VERTEX_DEMO -i database\scripts\07_registrar_dispositivo.sql ^
--          -v DISPOSITIVO="ESP32-CERO011-01" EQUIPO="CERO-011" CLAVE_HASH="0x<sha256 en hex>"
--
-- CLAVE_HASH es el SHA-256 de la clave, no la clave: la clave va solo en el
-- secrets.h del ESP32 (fuera de git) y no se guarda en ningun archivo versionado.
-- Generar clave y hash (imprime "clave 0xhash"; la clave se copia al secrets.h y no se guarda en otro lado):
--   node -e "const c=require('crypto');const k=c.randomBytes(32).toString('hex');console.log(k,'0x'+c.createHash('sha256').update(k).digest('hex'))"
-- Registrar de nuevo el mismo codigo cambia la clave (la anterior deja de servir).
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @codigo     VARCHAR(50)    = '$(DISPOSITIVO)';
DECLARE @equipo     VARCHAR(30)    = '$(EQUIPO)';
DECLARE @clave_hash VARBINARY(32)  = $(CLAVE_HASH);

DECLARE @equipo_id UNIQUEIDENTIFIER =
    (SELECT equipo_id FROM dbo.EquiposCero WHERE codigo = @equipo AND activo = 1);
IF @equipo_id IS NULL
    THROW 50404, 'El equipo no existe o esta inactivo.', 1;
IF DATALENGTH(@clave_hash) <> 32
    THROW 50400, 'CLAVE_HASH debe ser un SHA-256 (32 bytes).', 1;

MERGE dbo.Dispositivos AS tgt
USING (SELECT @codigo AS codigo) AS src ON tgt.codigo = src.codigo
WHEN MATCHED THEN
    UPDATE SET equipo_id = @equipo_id, clave_hash = @clave_hash, activo = 1
WHEN NOT MATCHED THEN
    INSERT (codigo, nombre, descripcion, tipo, activo, equipo_id, clave_hash)
    VALUES (@codigo, N'Dispositivo de captura ' + @codigo,
            N'ESP32 + RTC DS3231 + sonda DS18B20 (Etapa A)', 'SENSOR_STANDALONE', 1, @equipo_id, @clave_hash);

SELECT d.codigo, e.codigo AS equipo, d.activo, d.ultimo_contacto
FROM dbo.Dispositivos d JOIN dbo.EquiposCero e ON e.equipo_id = d.equipo_id
WHERE d.codigo = @codigo;
