import type { BateriaData } from './bateria.service';
import { BotonReintentar } from './BotonReintentar';
import type { BackendState } from './useBackend';
import styles from './dashboard.module.css';

/** dd/mm/aaaa hh:mm (UTC, as stored) */
const fechaHora = (iso: string) =>
  `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} ${iso.slice(11, 16)} UTC`;

/**
 * Battery of the capture prototype mounted on the CERO: a bar with its level
 * and the time of the reading. Until the prototype sends readings (and in
 * demo mode) the bar is empty and says "Pendiente".
 */
export function BateriaPrototipo({ state }: { state: BackendState<BateriaData> }) {
  const datos = state.status === 'data' ? state.data : null;
  const nivel = datos?.nivel ?? null;
  const pendiente = state.status === 'data' && nivel === null;
  const aviso = datos?.aviso_pct ?? null;
  const bajo = nivel !== null && aviso !== null && nivel <= aviso;
  const ancho = nivel === null ? 0 : Math.min(100, Math.max(0, nivel));

  let texto: string;
  let detalle: string;
  if (state.status === 'error') {
    texto = 'Error';
    detalle = state.message;
  } else if (state.status !== 'data') {
    texto = 'Cargando…';
    detalle = 'Consultando la batería del prototipo';
  } else if (nivel === null) {
    texto = 'Pendiente';
    detalle = 'Sin lecturas: el nivel se mostrará cuando el prototipo envíe sus datos';
  } else {
    texto = `${Math.round(nivel)} %`;
    detalle = `Lectura del ${datos?.event_time ? fechaHora(datos.event_time) : '—'}${bajo ? ' · Cargar o cambiar la batería' : ''}`;
  }

  const relleno = bajo ? styles.bateriaRellenoBajo : styles.bateriaRelleno;

  return (
    <div className={styles.bateria} title={detalle}>
      <span className={styles.bateriaTitulo}>Batería del prototipo</span>
      <div
        className={`${styles.bateriaBarra} ${pendiente ? styles.bateriaPendiente : ''}`}
        role="meter"
        aria-label="Batería del prototipo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={nivel ?? undefined}
        aria-valuetext={nivel === null ? texto : `${texto}. ${detalle}`}
      >
        <div className={relleno} style={{ width: `${ancho}%` }} />
      </div>
      <span
        className={`${styles.bateriaValor} ${pendiente ? styles.bateriaValorPendiente : ''} ${
          bajo || state.status === 'error' ? styles.bateriaValorBajo : ''
        }`}
      >
        {texto}
      </span>
      {state.status === 'error' && state.reintentar && <BotonReintentar onClick={state.reintentar} />}
    </div>
  );
}
