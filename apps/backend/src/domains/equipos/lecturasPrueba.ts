// PRUEBA-CERO011 ─ Complemento provisional para el dispositivo de prueba.
//
// El CERO-011 recibe lecturas reales del ESP32 (temperatura de la sonda y
// corriente en 0 porque todavía no hay sensor de corriente). La tendencia
// normal (dbo.sp_vx_tendencia_variable) solo cuenta minutos con el motor
// encendido, así que para este equipo no mostraría nada.
//
// Para los equipos de EQUIPOS_PRUEBA la tendencia usa TODAS las lecturas del
// período, encendido o no, y añade el último contacto del dispositivo.
// Solo lee la base (SELECT): no cambia tablas, procedimientos ni datos.
//
// Para retirarlo: borrar este archivo y las líneas marcadas "PRUEBA-CERO011"
// (equipos.controller.ts y, en el frontend, DashboardPage.tsx y
// operacion.service.ts).
import sql from 'mssql';
import { errorDeBase } from './equipos.service';
import type { MedicionesEquipo } from './equipos.service';

/** Equipos cuya tendencia no filtra por motor encendido */
export const EQUIPOS_PRUEBA: readonly string[] = ['CERO-011'];

export function esEquipoPrueba(codigo: string) {
  return EQUIPOS_PRUEBA.includes(codigo);
}

export interface DispositivoPrueba {
  codigo: string;
  /** Último lote recibido (hora del servidor, UTC) */
  ultimo_contacto: Date | null;
}

/**
 * Sustituye los puntos de la tendencia por los de todas las lecturas del
 * período (mismo intervalo, mismo umbral y mismo formato que el
 * procedimiento) y añade el dispositivo del equipo.
 */
export async function conLecturasPrueba(
  codigo: string,
  base: MedicionesEquipo,
): Promise<MedicionesEquipo & { dispositivo: DispositivoPrueba | null }> {
  try {
    const dispositivo = await new sql.Request()
      .input('codigo', sql.VarChar(30), codigo)
      .query<DispositivoPrueba>(`
        SELECT TOP (1) d.codigo, d.ultimo_contacto
        FROM dbo.Dispositivos d
        JOIN dbo.EquiposCero e ON e.equipo_id = d.equipo_id
        WHERE e.codigo = @codigo AND d.activo = 1
        ORDER BY d.ultimo_contacto DESC
      `);

    if (!base.desde || !base.fecha_referencia) {
      return { ...base, dispositivo: dispositivo.recordset[0] ?? null };
    }

    const umbral = base.umbral?.habilitado ? base.umbral : null;
    const result = await new sql.Request()
      .input('codigo', sql.VarChar(30), codigo)
      .input('variable', sql.VarChar(50), base.variable)
      .input('desde', sql.DateTime2(3), base.desde)
      .input('hasta', sql.DateTime2(3), base.fecha_referencia)
      .input('mp', sql.Int, base.minutos_punto)
      .input('umin', sql.Decimal(18, 4), umbral?.min ?? null)
      .input('umax', sql.Decimal(18, 4), umbral?.max ?? null)
      .query<{ inicio: Date; promedio: number; minimo: number; maximo: number; lecturas: number; marcas: number }>(`
        SELECT DATEADD(MINUTE, (DATEDIFF(MINUTE, '20000101', m.event_time) / @mp) * @mp, CAST('20000101' AS DATETIME2(3))) AS inicio,
               AVG(CAST(m.valor AS FLOAT)) AS promedio,
               MIN(m.valor) AS minimo,
               MAX(m.valor) AS maximo,
               COUNT(*) AS lecturas,
               SUM(CASE WHEN m.valor > @umax OR m.valor < @umin THEN 1 ELSE 0 END) AS marcas
        FROM dbo.Mediciones m
        JOIN dbo.EquiposCero e ON e.equipo_id = m.equipo_id
        JOIN dbo.Variables v ON v.variable_id = m.variable_id
        WHERE e.codigo = @codigo AND v.codigo = @variable
          AND m.event_time >= @desde AND m.event_time <= @hasta
        GROUP BY DATEDIFF(MINUTE, '20000101', m.event_time) / @mp
        ORDER BY inicio
      `);

    const r3 = (v: unknown) => Math.round(Number(v) * 1000) / 1000;
    const puntos = result.recordset.map((p) => ({
      inicio: p.inicio,
      dia: p.inicio.toISOString().slice(0, 10),
      promedio: r3(p.promedio),
      minimo: r3(p.minimo),
      maximo: r3(p.maximo),
      lecturas: Number(p.lecturas),
      marcas: Number(p.marcas),
    }));
    return { ...base, puntos, dispositivo: dispositivo.recordset[0] ?? null };
  } catch (err) {
    const errorBase = errorDeBase(err);
    if (errorBase) throw errorBase;
    throw err;
  }
}
