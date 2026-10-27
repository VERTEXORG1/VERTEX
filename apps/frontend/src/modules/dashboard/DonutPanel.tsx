import { useId, useState, useSyncExternalStore } from 'react';
import type { DonutSegment, MotorInfo, TimeUnit, ValidationStatus } from '../../contracts/dashboard';
import { BotonReintentar } from './BotonReintentar';
import type { CicloCompleto } from './bloques.service';
import styles from './dashboard.module.css';

interface DonutPanelProps {
  /** Hours per state of the period asked for: the legend while there are no cycles */
  segments: DonutSegment[];
  /** Whole cycles touching the period, oldest first: one sector each */
  ciclos: CicloCompleto[];
  motorInfo: MotorInfo;
  /** Period asked for, e.g. "del 14/09 al 14/10 2026": in the title of the "Todo" button */
  periodo?: string;
  /** Cycle chosen with the "Período" buttons (null: "Todo"); the dashboard keeps it */
  elegido: CicloCompleto | null;
  onElegir: (ciclo: CicloCompleto | null) => void;
  /** Loading / empty / error message shown under the legend */
  notice?: { text: string; error?: boolean; reintentar?: () => void };
}

const TIME_UNITS: {
  id: TimeUnit;
  label: string;
  suffix: string;
  /** Shorter suffix for the legend on phones */
  mobileSuffix: string;
  hoursPerUnit: number;
}[] = [
  { id: 'horas', label: 'Horas', suffix: 'h', mobileSuffix: 'h', hoursPerUnit: 1 },
  { id: 'dias', label: 'Días', suffix: 'd', mobileSuffix: 'd', hoursPerUnit: 24 },
  { id: 'semanas', label: 'Sem', suffix: 'sem', mobileSuffix: 's', hoursPerUnit: 168 },
  { id: 'meses', label: 'Meses', suffix: 'mes', mobileSuffix: 'm', hoursPerUnit: 720 },
];

// Same "phone" mode as the CSS (everything that is not desktop), so phones
// in landscape also get the short legend suffixes their font formula expects
const MOBILE_QUERY = 'not all and (min-width: 768px) and (min-height: 501px)';

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True in phone mode; re-renders when the viewport crosses the breakpoint */
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

const STATUS_DISPLAY: Record<ValidationStatus, { label: string; color: string }> = {
  ENCENDIDO: { label: 'Encendido', color: '#1F3864' },
  APAGADO: { label: 'Apagado', color: '#90A4AE' },
  EVENTO: { label: 'Evento', color: '#E53935' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: '#FF9800' },
};

/** Order of the bands inside a cycle's sector: the maintenance that closes it last */
const ORDEN: ValidationStatus[] = ['ENCENDIDO', 'APAGADO', 'EVENTO', 'MANTENIMIENTO'];

// Donut geometry (SVG units): ring from R_IN to R_OUT, dates inside the hole
const SIZE = 200;
const C = SIZE / 2;
const R_OUT = 99;
const R_IN = 76;
/** Middle of each date along its axis (from the center), and its distance from the axis */
const R_FECHA = 44;
const LADO_FECHA = 7;

/** Point at radius r and angle a (degrees, clockwise from 12 o'clock) */
function punto(r: number, a: number): [number, number] {
  const rad = (a * Math.PI) / 180;
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)];
}

/** Ring piece from angle a0 to a1 (clockwise) */
function arco(a0: number, a1: number) {
  const b = Math.min(a1, a0 + 359.99);
  const grande = b - a0 > 180 ? 1 : 0;
  const [x0, y0] = punto(R_OUT, a0);
  const [x1, y1] = punto(R_OUT, b);
  const [x2, y2] = punto(R_IN, b);
  const [x3, y3] = punto(R_IN, a0);
  return `M${x0} ${y0}A${R_OUT} ${R_OUT} 0 ${grande} 1 ${x1} ${y1}L${x2} ${y2}A${R_IN} ${R_IN} 0 ${grande} 0 ${x3} ${y3}Z`;
}

/**
 * Angle of the first axis: 9 o'clock (the X axis). With two cycles the cut
 * is the X axis (top half, then bottom half); with four, a cross with the
 * first cycle in the top-left quarter.
 */
const INICIO = 270;

/** Smallest angle of a maintenance band, so a short stop is still visible */
const MIN_MTTO = 4;

/** dd/mm/aaaa (UTC, as stored) */
const fecha = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/** 1 → "I", 4 → "IV": the number of a cycle, in its sector and its button */
function romano(n: number) {
  const cifras: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let texto = '';
  for (const [valor, letras] of cifras) {
    while (n >= valor) {
      texto += letras;
      n -= valor;
    }
  }
  return texto;
}

/**
 * Distance of a sector's number from the center: the centroid of its wedge
 * of the hole (radius R_IN, angle `paso`), so it sits in the middle of the
 * space of its cycle. 2 cycles: 32; 3: 42; 4: 46.
 */
function radioNumero(paso: number) {
  const rad = (paso * Math.PI) / 180;
  return (4 * R_IN * Math.sin(rad / 2)) / (3 * rad);
}

/**
 * When a cycle stopped: the start of the maintenance that closed it, or its
 * latest record while it runs. Its start is when the previous maintenance ended.
 */
const finCiclo = (c: CicloCompleto) =>
  (c.completo && c.tramos.findLast((t) => t.segmento === 'MANTENIMIENTO')?.inicio) || c.fin;

/**
 * A date along an axis, like an axis label: parallel to it, read from the
 * center outward (up the top axis, down the bottom one), turned half a
 * turn where it would be upside down (left half). `lado` +1 puts it on
 * the clockwise side of the axis, -1 on the other one.
 */
function FechaEje({ angulo, lado, texto }: { angulo: number; lado: 1 | -1; texto: string }) {
  const [bx, by] = punto(R_FECHA, angulo);
  const [px, py] = punto(LADO_FECHA, angulo + 90 * lado);
  const x = bx + px - C;
  const y = by + py - C;
  // Axis direction on screen (degrees from +x, clockwise), kept in (-90, 90]
  let giro = ((((angulo - 90) % 360) + 540) % 360) - 180;
  if (giro > 90) giro -= 180;
  if (giro <= -90) giro += 180;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      transform={`rotate(${giro} ${x} ${y})`}
      className={styles.donutFecha}
    >
      {texto}
    </text>
  );
}

/** Hours in the unit as shown: whole hours, other units with 1 decimal */
function enUnidad(hours: number, unit: (typeof TIME_UNITS)[number]) {
  if (unit.hoursPerUnit === 1) return Math.round(hours);
  return Math.round((hours / unit.hoursPerUnit) * 10) / 10;
}

function formatValue(valor: number, unit: (typeof TIME_UNITS)[number]) {
  const decimales = unit.hoursPerUnit === 1 ? 0 : 1;
  return valor.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/**
 * Donut card: motor info (left), pure-SVG donut of the cycles between
 * maintenances (center), time-unit picker (right) and the legend of the
 * period asked for underneath. The donut has one equal sector per cycle
 * touching the period, with its states in proportion to their time; the
 * dates go beside the axes between the sectors (the hole has no total).
 * The "Período" buttons over it (I, II, III… as the sectors' numbers) show
 * one cycle alone (the whole donut, and the legend with that cycle's hours)
 * or all of them ("Todo"); the dashboard also shows that cycle in the
 * events table and the trend.
 */
export function DonutPanel({ segments, ciclos, motorInfo, periodo, elegido, onElegir, notice }: DonutPanelProps) {
  const [unitId, setUnitId] = useState<TimeUnit>('horas');
  const unit = TIME_UNITS.find((u) => u.id === unitId) ?? TIME_UNITS[0];
  const legendSuffix = useIsMobile() ? unit.mobileSuffix : unit.suffix;
  const radioName = useId();

  const vistos = elegido ? [elegido] : ciclos;
  // Legend, in the unit as shown: the chosen cycle; with "Todo", the sum of
  // the cycles' shown values (so adding up I + II + III by hand gives the
  // same total); without cycles (loading, no data), the period's hours
  const leyenda = segments.map((seg) => ({
    ...seg,
    valor: elegido
      ? enUnidad(elegido.horas[seg.status], unit)
      : ciclos.length
        ? Math.round(ciclos.reduce((sum, c) => sum + enUnidad(c.horas[seg.status], unit), 0) * 10) / 10
        : enUnidad(seg.hours, unit),
  }));

  // One equal sector per cycle, clockwise from 9 o'clock (INICIO), oldest first;
  // inside it, its states in proportion to their time (no numbers). The
  // maintenance that closes the cycle sits against the next axis and is
  // never thinner than MIN_MTTO degrees; the other states share the rest
  // in their own proportion.
  const paso = 360 / Math.max(vistos.length, 1);
  const sectores = vistos.map((c, k) => {
    const a0 = INICIO + k * paso;
    const total = ORDEN.reduce((sum, e) => sum + c.horas[e], 0) || 1;
    const mtto = c.horas.MANTENIMIENTO;
    const anguloMtto = mtto > 0 ? Math.min(Math.max((mtto / total) * paso, MIN_MTTO), paso / 2) : 0;
    const resto = total - mtto || 1;
    let desde = a0;
    const bandas = ORDEN.filter((e) => c.horas[e] > 0).map((e) => {
      const angulo = e === 'MANTENIMIENTO' ? anguloMtto : (c.horas[e] / resto) * (paso - anguloMtto);
      const banda = { estado: e, d: arco(desde, desde + angulo) };
      desde += angulo;
      return banda;
    });
    const pcts = ORDEN.map((e) => `${STATUS_DISPLAY[e].label} ${Math.round((c.horas[e] / total) * 100)} %`).join(', ');
    return {
      key: c.inicio,
      bandas,
      numero: romano(ciclos.indexOf(c) + 1),
      medio: a0 + paso / 2,
      titulo: `Ciclo ${romano(ciclos.indexOf(c) + 1)}: ${fecha(c.inicio)} → ${fecha(finCiclo(c))}${c.completo ? '' : ' (en curso)'} · ${pcts}`,
    };
  });
  const resumen = sectores.map((x) => x.titulo).join('. ');

  const status = STATUS_DISPLAY[motorInfo.estado];
  const producto = motorInfo.estado === 'APAGADO' ? 'Sin asignación' : motorInfo.producto;

  // translate="no": browser translators (e.g. Chrome's) swap the text nodes
  // for their own copies, so React's updates to the values and units stop
  // showing ("mes" was even translated as if it were English "mess").
  return (
    <div className={`${styles.card} notranslate`} translate="no">
      {/* Top row: one button per cycle (its number; the dates in its title) and "Todo" at the right */}
      {ciclos.length > 0 && (
        <div className={styles.donutPeriodos} role="group" aria-label="Período de la dona">
          <span className={styles.donutPeriodosTitulo}>Período:</span>
          {ciclos.map((c, k) => (
            <button
              key={c.inicio}
              type="button"
              className={styles.donutPeriodoBoton}
              aria-pressed={c === elegido}
              title={`Ciclo ${romano(k + 1)}: ${fecha(c.inicio)} – ${fecha(finCiclo(c))}${c.completo ? '' : ' (en curso)'}`}
              onClick={() => onElegir(c)}
            >
              {romano(k + 1)}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.donutPeriodoBoton} ${styles.donutPeriodoTodo}`}
            aria-pressed={!elegido}
            title={`Todos los ciclos: ${fecha(ciclos[0].inicio)} – ${fecha(ciclos[ciclos.length - 1].fin)}${
              periodo ? ` · Período consultado ${periodo}` : ''
            }`}
            onClick={() => onElegir(null)}
          >
            Todo
          </button>
        </div>
      )}
      <div className={styles.donutBody}>
        {/* Left: motor info */}
        <dl className={styles.motorInfo}>
          <div className={styles.motorInfoRow}>
            <dt>Producto:</dt>
            <dd>{producto}</dd>
          </div>
          <div className={styles.motorInfoRow}>
            <dt>Estado:</dt>
            <dd style={{ color: status.color }}>{status.label}</dd>
          </div>
          <div className={styles.motorInfoRow}>
            <dt>Línea:</dt>
            <dd>{motorInfo.linea}</dd>
          </div>
        </dl>

        {/* Center: donut */}
        <div className={styles.donutWrap}>
          <div className={styles.donutChart}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={resumen || 'Sin ciclos'}>
              {/* track: loading, error or no cycles */}
              {!sectores.length && <path d={arco(0, 360)} fill="#E8EEF5" />}
              {sectores.map((sector) => (
                <g key={sector.key}>
                  <title>{sector.titulo}</title>
                  {sector.bandas.map((banda) => (
                    <path key={banda.estado} d={banda.d} fill={STATUS_DISPLAY[banda.estado].color} />
                  ))}
                </g>
              ))}
              {/* The number of each sector, centered in its wedge of the hole (none for a single cycle) */}
              {sectores.length > 1 &&
                sectores.map((sector) => {
                  const [x, y] = punto(radioNumero(paso), sector.medio);
                  return (
                    <text key={sector.key} x={x} y={y} textAnchor="middle" dominantBaseline="central" className={styles.donutNumero}>
                      {sector.numero}
                    </text>
                  );
                })}
              {/* Axes between the cycles: an imaginary line in the hole and a
                  cut through the ring. A single cycle (or the one chosen) has
                  its dates beside its axis: when the maintenance that closed
                  it started (counterclockwise side) and when it started
                  (clockwise side). With several cycles ("Todo") only their
                  numbers show; the dates are in the buttons' titles. */}
              {vistos.map((c, k) => {
                const angulo = INICIO + k * paso;
                // Before the axis: when the previous cycle stopped. After
                // it: when this cycle started (the maintenance ended)
                const anterior = vistos[(k + vistos.length - 1) % vistos.length];
                const [xi, yi] = punto(14, angulo);
                const [xa, ya] = punto(R_IN, angulo);
                const [xb, yb] = punto(R_OUT + 1, angulo);
                return (
                  <g key={c.inicio}>
                    <line x1={xi} y1={yi} x2={xa} y2={ya} className={styles.donutEje} />
                    {/* A single cycle is the whole ring: no cut */}
                    {vistos.length > 1 && <line x1={xa} y1={ya} x2={xb} y2={yb} className={styles.donutCorte} />}
                    {vistos.length === 1 && (
                      <>
                        <FechaEje angulo={angulo} lado={-1} texto={fecha(finCiclo(anterior))} />
                        <FechaEje angulo={angulo} lado={1} texto={fecha(c.inicio)} />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: time unit */}
        <fieldset className={styles.unitPicker}>
          <legend className={styles.unitPickerTitle}>Unidad</legend>
          {TIME_UNITS.map((u) => (
            <label key={u.id} className={styles.unitOption}>
              <input
                type="radio"
                name={radioName}
                value={u.id}
                checked={unitId === u.id}
                onChange={() => setUnitId(u.id)}
              />
              {u.label}
            </label>
          ))}
        </fieldset>
      </div>

      {/* Legend */}
      <div className={styles.donutLegend}>
        {leyenda.map((s) => (
          <div key={s.status} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: s.color }} />
            <span className={styles.legendLabel}>{s.label}</span>
            <span className={styles.legendValue}>
              {formatValue(s.valor, unit)} {legendSuffix}
            </span>
          </div>
        ))}
      </div>
      {notice && (
        <p
          className={`${styles.chartNotice} ${notice.error ? styles.chartNoticeError : ''}`}
          role={notice.error ? 'alert' : 'status'}
        >
          {notice.text}
          {notice.reintentar && <BotonReintentar onClick={notice.reintentar} />}
        </p>
      )}
    </div>
  );
}
