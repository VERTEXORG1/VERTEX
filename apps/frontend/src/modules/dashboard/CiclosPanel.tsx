import { useState } from 'react';
import type { MotorInfo, TimeUnit, ValidationStatus } from '../../contracts/dashboard';
import { BotonReintentar } from './BotonReintentar';
import type { CicloCompleto } from './bloques.service';
import styles from './dashboard.module.css';

interface CiclosPanelProps {
  /** Whole cycles touching the period, oldest first */
  ciclos: CicloCompleto[];
  /** The period the user asked for (ms, UTC): the rest is context */
  consulta: { desde: number; hasta: number } | null;
  /** e.g. "Del 14/09 al 14/10 · 2026 (última medición)" */
  consultaTexto?: string;
  motorInfo: MotorInfo;
  /** Loading / empty / error message */
  notice?: { text: string; error?: boolean; reintentar?: () => void };
}

const UNIDADES: { id: TimeUnit; label: string; titulo: string; sufijo: string; horas: number }[] = [
  { id: 'horas', label: 'H', titulo: 'Horas', sufijo: 'h', horas: 1 },
  { id: 'dias', label: 'D', titulo: 'Días', sufijo: 'd', horas: 24 },
  { id: 'semanas', label: 'S', titulo: 'Semanas', sufijo: 'sem', horas: 168 },
  { id: 'meses', label: 'M', titulo: 'Meses', sufijo: 'mes', horas: 720 },
];

/** Same colors as the events table and the trend bands */
const ESTADOS: Record<ValidationStatus, { label: string; color: string }> = {
  ENCENDIDO: { label: 'Encendido', color: '#1F3864' },
  APAGADO: { label: 'Apagado', color: '#90A4AE' },
  EVENTO: { label: 'Evento', color: '#E53935' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: '#FF9800' },
};

const ORDEN: ValidationStatus[] = ['ENCENDIDO', 'APAGADO', 'EVENTO', 'MANTENIMIENTO'];

const HORA_MS = 3_600_000;

/** dd/mm hh:mm (UTC, as stored) */
const fechaHora = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 16)}`;

/** Hours as integers; other units with 1 decimal */
function valor(horas: number, u: (typeof UNIDADES)[number]) {
  if (u.horas === 1) return Math.round(horas).toLocaleString('es-CO');
  return (horas / u.horas).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const duracionH = (c: CicloCompleto) => (Date.parse(c.fin) - Date.parse(c.inicio)) / HORA_MS;

/**
 * ⚠ PROTOTIPO 2 — not rendered. Kept aside as an alternative to the cycles
 * donut (DonutPanel); to show it, render it in DashboardPage in place of
 * DonutPanel with the same `ciclos` of GET /bloques.
 *
 * Cycles between maintenances: one row per cycle, as long as the cycle
 * (same time scale for all, so a short cycle is visibly short), with its
 * state blocks in time order and the maintenance that closes it at the end.
 * What lies outside the period asked for is dimmed and the period is
 * marked over the bars. Under each bar, the hours of its four states.
 */
export function CiclosPanel({ ciclos, consulta, consultaTexto, motorInfo, notice }: CiclosPanelProps) {
  const [unidadId, setUnidadId] = useState<TimeUnit>('dias');
  const u = UNIDADES.find((x) => x.id === unidadId) ?? UNIDADES[1];

  const maxDuracion = Math.max(...ciclos.map(duracionH), 1e-9);
  const cerrados = ciclos.filter((c) => c.completo);
  // Mean time between maintenances: only cycles a maintenance closed
  const media = cerrados.length ? cerrados.reduce((s, c) => s + duracionH(c), 0) / cerrados.length : null;
  const horasMtto = ciclos.reduce((s, c) => s + c.horas.MANTENIMIENTO, 0);
  const estado = ESTADOS[motorInfo.estado];
  const producto = motorInfo.estado === 'APAGADO' ? 'Sin asignación' : motorInfo.producto;

  // translate="no": browser translators swap the text nodes for their own
  // copies and React's updates stop showing (see DonutPanel)
  return (
    <div className={`${styles.card} notranslate`} translate="no">
      <div className={styles.ciclosHeader}>
        <h3 className={styles.cardTitle}>Ciclos entre mantenimientos</h3>
        <div className={styles.ciclosUnidades} role="radiogroup" aria-label="Unidad de tiempo">
          {UNIDADES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={x.id === unidadId}
              title={x.titulo}
              className={styles.ciclosUnidad}
              onClick={() => setUnidadId(x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.ciclosMotor}>
        <span>
          Estado: <strong style={{ color: estado.color }}>{estado.label}</strong>
        </span>
        <span>
          Producto: <strong>{producto}</strong>
        </span>
        <span>
          <strong>{motorInfo.linea}</strong>
        </span>
      </p>

      {ciclos.length > 0 && (
        <dl className={styles.ciclosKpis}>
          <div>
            <dt>Ciclos</dt>
            <dd>{ciclos.length}</dd>
          </div>
          <div>
            <dt title="Mantenimientos">Mttos.</dt>
            <dd>{cerrados.length}</dd>
          </div>
          <div title="Duración media entre mantenimientos (ciclos cerrados)">
            <dt>Media</dt>
            <dd>{media === null ? '—' : `${valor(media, u)} ${u.sufijo}`}</dd>
          </div>
          <div>
            <dt>En mtto.</dt>
            <dd>
              {valor(horasMtto, u)} {u.sufijo}
            </dd>
          </div>
        </dl>
      )}

      <ol className={styles.ciclosLista}>
        {ciclos.map((c, i) => {
          const inicio = Date.parse(c.inicio);
          const fin = Date.parse(c.fin);
          const largo = Math.max(fin - inicio, 1);
          const pct = (t: number) => ((Math.min(Math.max(t, inicio), fin) - inicio) / largo) * 100;
          const qa = consulta ? pct(consulta.desde) : 0;
          const qb = consulta ? pct(consulta.hasta) : 100;
          const duracion = duracionH(c);
          const resumen = ORDEN.map((s) => `${ESTADOS[s].label} ${valor(c.horas[s], u)} ${u.sufijo}`).join(', ');
          return (
            <li
              key={c.inicio}
              className={styles.ciclo}
              aria-label={`Ciclo ${i + 1}, del ${fechaHora(c.inicio)} al ${fechaHora(c.fin)}, ${valor(duracion, u)} ${u.sufijo}${c.completo ? '' : ', en curso'}: ${resumen}`}
            >
              <div className={styles.cicloCabecera}>
                <span className={styles.cicloNombre}>Ciclo {i + 1}</span>
                <span className={styles.cicloFechas}>
                  {fechaHora(c.inicio)} → {fechaHora(c.fin)}
                </span>
                {!c.completo && <span className={styles.cicloEnCurso}>en curso</span>}
                <span className={styles.cicloDuracion}>
                  {valor(duracion, u)} {u.sufijo}
                </span>
              </div>
              {/* Bar as long as the cycle on the common scale */}
              <div className={styles.cicloPista} aria-hidden="true">
                <div className={styles.cicloBarra} style={{ width: `${(duracion / maxDuracion) * 100}%` }}>
                  {c.tramos.map((t) => {
                    const a = pct(Date.parse(t.inicio));
                    const b = pct(Date.parse(t.fin));
                    const horas = (Date.parse(t.fin) - Date.parse(t.inicio)) / HORA_MS;
                    return (
                      <span
                        key={t.inicio}
                        className={`${styles.cicloTramo} ${t.segmento === 'MANTENIMIENTO' ? styles.cicloTramoMtto : ''}`}
                        style={{ left: `${a}%`, width: `${b - a}%`, background: ESTADOS[t.segmento].color }}
                        title={`${ESTADOS[t.segmento].label} · ${fechaHora(t.inicio)} → ${fechaHora(t.fin)} · ${valor(horas, u)} ${u.sufijo}`}
                      />
                    );
                  })}
                  {/* Context outside the period asked for: dimmed */}
                  {qa > 0 && <span className={styles.cicloFuera} style={{ left: 0, width: `${qa}%` }} />}
                  {qb < 100 && <span className={styles.cicloFuera} style={{ left: `${qb}%`, width: `${100 - qb}%` }} />}
                  {qb > qa && <span className={styles.cicloConsulta} style={{ left: `${qa}%`, width: `${qb - qa}%` }} />}
                </div>
              </div>
              <ul className={styles.cicloEstados}>
                {ORDEN.map((s) => (
                  <li key={s} title={ESTADOS[s].label}>
                    <span className={styles.ciclosPunto} style={{ backgroundColor: ESTADOS[s].color }} />
                    {valor(c.horas[s], u)} {u.sufijo}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className={styles.ciclosLeyenda}>
        {ORDEN.map((s) => (
          <span key={s}>
            <span className={styles.ciclosPunto} style={{ backgroundColor: ESTADOS[s].color }} />
            {ESTADOS[s].label}
          </span>
        ))}
        <span title={consultaTexto}>
          <span className={styles.ciclosLeyendaConsulta} />
          Consulta{consultaTexto ? `: ${consultaTexto}` : ''}
        </span>
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
