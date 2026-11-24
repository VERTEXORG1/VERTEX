import sql from 'mssql';
import { errorDeBase } from '../equipos/equipos.service';

/*
 * Data access of the capture domain (V010). Duplicates, catalog and motor
 * lookups live in dbo.sp_vx_captura_lote_recibir; Node only authenticates the
 * device and validates the batch. The tests replace this module with a fake.
 */

export interface CredencialDispositivo {
  codigo: string;
  /** SHA-256 of the device key */
  clave_hash: Buffer;
  /** CERO the device belongs to */
  equipo_codigo: string;
}

/** One reading as the procedure receives it (already validated) */
export interface RegistroLote {
  /** event_time exactly as the device sent it: the duplicate key */
  record_id: string;
  /** Same instant, UTC, without the Z (DATETIME2) */
  event_time: string;
  /** The reading as it arrived, kept in RegistrosOriginales */
  registro: unknown;
}

export interface ResultadoLote {
  recibidas: number;
  nuevas: number;
  duplicadas: number;
  mediciones: number;
}

// dbo.Dispositivos.codigo is VARCHAR(50)
export const MAX_CODIGO_DISPOSITIVO = 50;

async function ejecutar<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw errorDeBase(err) ?? err;
  }
}

/** dbo.sp_vx_dispositivo_credencial: null when it cannot send batches */
export function obtenerCredencial(codigo: string): Promise<CredencialDispositivo | null> {
  return ejecutar(async () => {
    const result = await new sql.Request()
      .input('codigo', sql.VarChar(MAX_CODIGO_DISPOSITIVO), codigo)
      .execute<CredencialDispositivo>('dbo.sp_vx_dispositivo_credencial');
    return result.recordset[0] ?? null;
  });
}

/** dbo.sp_vx_captura_lote_recibir */
export function recibirLote(dispositivo: string, registros: RegistroLote[]): Promise<ResultadoLote> {
  return ejecutar(async () => {
    const result = await new sql.Request()
      .input('dispositivo_codigo', sql.VarChar(MAX_CODIGO_DISPOSITIVO), dispositivo)
      .input('registros', sql.NVarChar(sql.MAX), JSON.stringify(registros))
      .input('provenance', sql.VarChar(20), 'REAL')
      .execute<ResultadoLote>('dbo.sp_vx_captura_lote_recibir');
    return result.recordset[0];
  });
}
