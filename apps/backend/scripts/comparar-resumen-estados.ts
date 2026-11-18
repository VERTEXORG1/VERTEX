/**
 * Compara dbo.sp_vx_resumen_estados (cálculo directo sobre Mediciones) con
 * dbo.sp_vx_resumen_estados_cache (cache de V008) en muchos períodos: deben
 * devolver exactamente lo mismo (mismos resultados, columnas, tipos y valores).
 *
 *   npm run comparar:estados                 (desde apps/backend, lee apps/backend/.env)
 *   npm run comparar:estados -- --rapido     (menos períodos, para una revisión corta)
 *
 * Requisitos en la base: V008, R__fn_vx_estados_parametros,
 * R__sp_vx_estados_recalcular y R__sp_vx_resumen_estados_cache aplicados.
 * Basta con app_demo_user: el SP de la cache escribe sus tablas por
 * encadenamiento de propietario (dbo).
 *
 * Qué hace:
 *   1. Recalcula la cache entera (@completo = 1) de cada equipo con datos.
 *   2. Ejecuta los dos SP con los mismos parámetros en cada período y
 *      combinación de @detalle / @ciclos, y compara resultado por resultado.
 *   3. Prueba el recálculo parcial: para varios momentos t, recalcula como
 *      si los datos hubieran cambiado desde t y compara las tablas de la
 *      cache con las del recálculo completo; luego repite algunos períodos.
 *   4. Muestra los tiempos de los dos SP.
 *
 * Solo lee dbo.Mediciones; escribe únicamente las tablas de la cache.
 * Sale con código 1 si encuentra alguna diferencia.
 */
import sql from 'mssql';

type Fila = Record<string, unknown>;
type Periodo = { dias: number | null } | { desde: Date; hasta: Date };

const RAPIDO = process.argv.includes('--rapido');
const MAX_DIFERENCIAS_MOSTRADAS = 20;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

const MIN = 60_000;
const DIA = 24 * 60 * MIN;

/** Generador determinista (mulberry32): los mismos períodos en cada ejecución */
function aleatorio(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Resultado {
  recordsets: sql.IRecordSet<Fila>[];
  error: string | null;
  ms: number;
}

async function ejecutar(
  sp: string,
  codigo: string,
  periodo: Periodo,
  detalle: boolean,
  ciclos: boolean,
): Promise<Resultado> {
  const rango = 'desde' in periodo;
  const inicio = performance.now();
  try {
    const r = await new sql.Request()
      .input('equipo_codigo', sql.VarChar(30), codigo)
      .input('dias', sql.Int, rango ? null : periodo.dias)
      .input('desde', sql.DateTime2(3), rango ? periodo.desde : null)
      .input('hasta', sql.DateTime2(3), rango ? periodo.hasta : null)
      .input('detalle', sql.Bit, detalle)
      .input('ciclos', sql.Bit, ciclos)
      .execute(sp);
    return { recordsets: r.recordsets as sql.IRecordSet<Fila>[], error: null, ms: performance.now() - inicio };
  } catch (err) {
    return { recordsets: [], error: err instanceof Error ? err.message : String(err), ms: performance.now() - inicio };
  }
}

/** Nombre, tipo, precisión y escala de cada columna (sin la nulabilidad) */
function columnas(rs: sql.IRecordSet<Fila>): string[] {
  return Object.values(rs.columns)
    .sort((a, b) => a.index - b.index)
    .map((c) => {
      const tipo = (c.type as unknown as { declaration?: string; name?: string }).declaration ?? String(c.type);
      return `${c.name}:${tipo}(${c.length ?? ''},${c.precision ?? ''},${c.scale ?? ''})`;
    });
}

function valor(v: unknown): string {
  if (v instanceof Date) return `D${v.toISOString()}`;
  if (v === null || v === undefined) return 'NULL';
  if (Buffer.isBuffer(v)) return `B${v.toString('hex')}`;
  return `${typeof v}:${String(v)}`;
}

/** Diferencias entre dos ejecuciones (vacío: idénticas) */
function comparar(a: Resultado, b: Resultado): string[] {
  const dif: string[] = [];
  if (a.error !== b.error) return [`error: «${a.error}» ≠ «${b.error}»`];
  if (a.recordsets.length !== b.recordsets.length) {
    return [`resultados: ${a.recordsets.length} ≠ ${b.recordsets.length}`];
  }
  a.recordsets.forEach((ra, k) => {
    const rb = b.recordsets[k];
    const ca = columnas(ra).join(', ');
    const cb = columnas(rb).join(', ');
    if (ca !== cb) dif.push(`resultado ${k + 1}, columnas:\n      ${ca}\n    ≠ ${cb}`);
    if (ra.length !== rb.length) {
      dif.push(`resultado ${k + 1}: ${ra.length} filas ≠ ${rb.length}`);
      return;
    }
    ra.forEach((fa, i) => {
      const fb = rb[i];
      for (const col of Object.keys(fa)) {
        if (valor(fa[col]) !== valor(fb[col])) {
          dif.push(`resultado ${k + 1}, fila ${i + 1}, ${col}: ${valor(fa[col])} ≠ ${valor(fb[col])}`);
        }
      }
    });
  });
  return dif;
}

const fmt = (d: Date) => d.toISOString().replace('.000Z', 'Z');
const describir = (p: Periodo) => ('desde' in p ? `${fmt(p.desde)} → ${fmt(p.hasta)}` : p.dias === null ? 'Todo' : `${p.dias} días`);

interface Equipo {
  equipo_id: string;
  codigo: string;
  primero: Date | null;
  ultimo: Date | null;
}

/** Períodos de prueba de un equipo con datos */
async function periodosDe(eq: Equipo): Promise<Periodo[]> {
  const periodos: Periodo[] = [];
  const dias = RAPIDO ? [1, 7, 15, 30, null] : [1, 2, 3, 5, 7, 10, 14, 15, 20, 30, 45, 60, 90, 120, 365, 3650, null];
  for (const d of dias) periodos.push({ dias: d });
  if (!eq.primero || !eq.ultimo) return periodos;

  const p0 = eq.primero.getTime();
  const u0 = eq.ultimo.getTime();
  const rango = (desde: number, hasta: number) => periodos.push({ desde: new Date(desde), hasta: new Date(hasta) });

  // Días UTC completos, como los pide el dashboard (?desde=&hasta=)
  const dia0 = Math.floor(p0 / DIA) * DIA;
  const paso = RAPIDO ? 7 : 1;
  for (let d = dia0 - DIA; d <= u0 + DIA; d += paso * DIA) rango(d, d + DIA);
  for (let d = dia0; d <= u0; d += (RAPIDO ? 14 : 3) * DIA) rango(d, d + 7 * DIA);

  // Bordes de los mantenimientos (inicio y fin del hueco), exactos y a ±1 min / ±30,5 s
  const mant = await new sql.Request()
    .input('equipo_id', sql.UniqueIdentifier, eq.equipo_id)
    .query<{ inicio: Date; fin: Date }>(`
      SELECT inicio, fin FROM dbo.EstadoTramos
      WHERE equipo_id = @equipo_id AND segmento = 'MANTENIMIENTO' ORDER BY inicio`);
  const desplazamientos = [0, -MIN, MIN, -30_500, 30_500];
  for (const m of mant.recordset) {
    for (const borde of [m.inicio.getTime(), m.fin.getTime()]) {
      for (const dx of desplazamientos) {
        rango(borde + dx, borde + dx + 3 * DIA);
        rango(borde + dx - 3 * DIA, borde + dx);
        rango(borde + dx - 2 * DIA, borde + dx + 2 * DIA);
      }
    }
    rango(m.inicio.getTime(), m.fin.getTime()); // solo el hueco
    rango(m.inicio.getTime() + MIN, m.fin.getTime() - MIN); // dentro del hueco
  }

  // Cambios de bloque y de regla (bordes de tramo) de algunos tramos
  const tramos = await new sql.Request()
    .input('equipo_id', sql.UniqueIdentifier, eq.equipo_id)
    .query<{ inicio: Date }>(`SELECT inicio FROM dbo.EstadoTramos WHERE equipo_id = @equipo_id ORDER BY inicio`);
  const cadaTramo = RAPIDO ? 25 : 5;
  tramos.recordset.forEach((t, i) => {
    if (i % cadaTramo !== 0) return;
    const x = t.inicio.getTime();
    rango(x, x + 12 * 60 * MIN);
    rango(x - 12 * 60 * MIN, x);
    rango(x - 1, x + 1); // 2 ms alrededor del borde
  });

  // Aleatorios (incluye antes del primer y después del último registro, y segundos fraccionarios)
  const azar = aleatorio(20261112);
  const n = RAPIDO ? 30 : 300;
  for (let i = 0; i < n; i++) {
    const a = p0 - 2 * DIA + azar() * (u0 - p0 + 4 * DIA);
    const largo = azar() < 0.5 ? azar() * 2 * DIA : azar() * 40 * DIA;
    rango(Math.round(a), Math.round(a + largo));
  }

  // Extremos: todo el rango exacto, un solo instante y fuera de los datos
  rango(p0, u0);
  rango(u0, u0 + DIA);
  rango(p0 - 10 * DIA, p0 - 5 * DIA);
  rango(u0 + DIA, u0 + 5 * DIA);
  return periodos;
}

/** Contenido completo de la cache de un equipo, para comparar recálculos */
async function fotoCache(equipoId: string): Promise<string[]> {
  const consultas = [
    `SELECT primer_registro, ultimo_registro, ultimo_segmento, parametros, pendiente_desde
       FROM dbo.EstadoCalculo WHERE equipo_id = @e`,
    `SELECT event_time, ciclo, reg_enc, reg_enc_marca, marca, sin_dato
       FROM dbo.EstadoRegistros WHERE equipo_id = @e ORDER BY event_time`,
    `SELECT inicio, fin, bloque, ciclo, segmento, regla, registros, marcas
       FROM dbo.EstadoTramos WHERE equipo_id = @e ORDER BY inicio`,
    `SELECT ciclo, inicio, ultimo_registro, evento_desde, primera_marca
       FROM dbo.EstadoCiclos WHERE equipo_id = @e ORDER BY ciclo`,
  ];
  const lineas: string[] = [];
  for (const q of consultas) {
    const r = await new sql.Request().input('e', sql.UniqueIdentifier, equipoId).query<Fila>(q);
    for (const f of r.recordset) lineas.push(Object.values(f).map(valor).join('|'));
    lineas.push('--');
  }
  return lineas;
}

async function recalcular(equipoId: string, opciones: { completo?: boolean; desdeCambio?: Date }) {
  await new sql.Request()
    .input('equipo_id', sql.UniqueIdentifier, equipoId)
    .input('desde_cambio', sql.DateTime2(3), opciones.desdeCambio ?? null)
    .input('completo', sql.Bit, opciones.completo ?? false)
    .execute('dbo.sp_vx_estados_recalcular');
}

function primeraDiferencia(a: string[], b: string[]): string | null {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return `línea ${i + 1}: ${a[i] ?? '(nada)'} ≠ ${b[i] ?? '(nada)'}`;
  return null;
}

async function main() {
  await sql.connect({
    server: requireEnv('DB_SERVER'),
    port: Number(process.env.DB_PORT ?? 1433),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    requestTimeout: 120_000,
    options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false' },
  });
  console.log(`Base: ${process.env.DB_NAME} en ${process.env.DB_SERVER}${RAPIDO ? ' (rápido)' : ''}\n`);

  const equipos = (
    await new sql.Request().query<Equipo>(`
      SELECT e.equipo_id, e.codigo,
             (SELECT MIN(m.event_time) FROM dbo.Mediciones m JOIN dbo.Variables v ON v.variable_id = m.variable_id
              WHERE m.equipo_id = e.equipo_id AND v.codigo IN ('CORRIENTE_MOTOR', 'ESTADO_MOTOR')) AS primero,
             (SELECT MAX(m.event_time) FROM dbo.Mediciones m JOIN dbo.Variables v ON v.variable_id = m.variable_id
              WHERE m.equipo_id = e.equipo_id AND v.codigo IN ('CORRIENTE_MOTOR', 'ESTADO_MOTOR')) AS ultimo
      FROM dbo.EquiposCero e WHERE e.activo = 1 ORDER BY e.codigo`)
  ).recordset;

  let comparaciones = 0;
  let conDiferencias = 0;
  let mostradas = 0;
  const tiempos = { directo: [] as number[], cache: [] as number[] };

  const probar = async (codigo: string, periodo: Periodo, detalle: boolean, ciclos: boolean, medir = true) => {
    const directo = await ejecutar('dbo.sp_vx_resumen_estados', codigo, periodo, detalle, ciclos);
    const cache = await ejecutar('dbo.sp_vx_resumen_estados_cache', codigo, periodo, detalle, ciclos);
    comparaciones++;
    if (medir && !directo.error) {
      tiempos.directo.push(directo.ms);
      tiempos.cache.push(cache.ms);
    }
    const dif = comparar(directo, cache);
    if (dif.length) {
      conDiferencias++;
      if (mostradas++ < MAX_DIFERENCIAS_MOSTRADAS) {
        console.log(`✗ ${codigo} · ${describir(periodo)} · detalle=${+detalle} ciclos=${+ciclos}`);
        for (const d of dif.slice(0, 5)) console.log(`    ${d}`);
        if (dif.length > 5) console.log(`    … y ${dif.length - 5} diferencias más`);
      }
    }
  };

  // 1) Cache completa de cada equipo con datos
  for (const eq of equipos) {
    if (!eq.primero) continue;
    const t = performance.now();
    await recalcular(eq.equipo_id, { completo: true });
    console.log(`Cache completa de ${eq.codigo}: ${((performance.now() - t) / 1000).toFixed(1)} s`);
  }

  // 2) Períodos: (1,1) es /bloques y (0,0) /resumen; las otras dos combinaciones en uno de cada cuatro
  for (const eq of equipos) {
    const periodos = await periodosDe(eq);
    console.log(`\n${eq.codigo}: ${periodos.length} períodos`);
    for (const [i, p] of periodos.entries()) {
      await probar(eq.codigo, p, true, true);
      await probar(eq.codigo, p, false, false);
      if (i % 4 === 0) {
        await probar(eq.codigo, p, true, false);
        await probar(eq.codigo, p, false, true);
      }
    }
  }
  // Equipo inexistente: mismo error
  await probar('CERO-NO-EXISTE', { dias: 7 }, true, true, false);

  // 3) Recálculo parcial: debe dejar la cache igual que el completo
  let parcialesMal = 0;
  for (const eq of equipos) {
    if (!eq.primero || !eq.ultimo) continue;
    await recalcular(eq.equipo_id, { completo: true });
    const completa = await fotoCache(eq.equipo_id);
    const p0 = eq.primero.getTime();
    const u0 = eq.ultimo.getTime();
    const momentos = [u0, u0 - 1, u0 - 2 * 60 * MIN, u0 - 3 * DIA, p0 + (u0 - p0) / 2, p0 + (u0 - p0) / 3, p0 + MIN, p0];
    const mant = await new sql.Request()
      .input('equipo_id', sql.UniqueIdentifier, eq.equipo_id)
      .query<{ inicio: Date; fin: Date }>(
        `SELECT inicio, fin FROM dbo.EstadoTramos WHERE equipo_id = @equipo_id AND segmento = 'MANTENIMIENTO'`,
      );
    for (const m of mant.recordset) momentos.push(m.inicio.getTime(), m.fin.getTime(), m.fin.getTime() + MIN);

    for (const t of momentos) {
      await recalcular(eq.equipo_id, { desdeCambio: new Date(t) });
      const diferencia = primeraDiferencia(completa, await fotoCache(eq.equipo_id));
      if (diferencia) {
        parcialesMal++;
        console.log(`✗ Recálculo parcial de ${eq.codigo} desde ${fmt(new Date(t))}: ${diferencia}`);
      }
    }
    // Tras los parciales, los períodos más usados siguen iguales
    for (const d of [7, 15, 30, null]) await probar(eq.codigo, { dias: d }, true, true, false);
    console.log(`\nRecálculo parcial de ${eq.codigo}: ${momentos.length} momentos probados`);
  }

  // 4) Resumen
  const mediana = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.floor(s.length / 2)] : 0;
  };
  const max = (xs: number[]) => (xs.length ? Math.max(...xs) : 0);
  console.log(`\n${comparaciones} comparaciones, ${conDiferencias} con diferencias.`);
  console.log(`Recálculos parciales distintos del completo: ${parcialesMal}.`);
  console.log(
    `Tiempos (ms): directo mediana ${mediana(tiempos.directo).toFixed(0)}, máx. ${max(tiempos.directo).toFixed(0)} · ` +
      `cache mediana ${mediana(tiempos.cache).toFixed(0)}, máx. ${max(tiempos.cache).toFixed(0)}`,
  );
  const ok = conDiferencias === 0 && parcialesMal === 0;
  console.log(ok ? '\nOK: resultados idénticos.' : '\nHAY DIFERENCIAS: no cambiar el SP del backend.');
  await sql.close();
  process.exit(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await sql.close().catch(() => undefined);
  process.exit(1);
});
