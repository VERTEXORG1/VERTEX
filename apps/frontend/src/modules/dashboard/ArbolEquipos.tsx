import { useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { JERARQUIA_DEMO, textoRuta } from './jerarquiaDemo';
import type { NodoArbol } from './jerarquiaDemo';
import styles from './dashboard.module.css';

/** Result of checking the selected CERO against the backend (GET /api/equipos/:codigo) */
export type CeroCheck =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

interface ArbolEquiposProps {
  /** Ids from the root down: the chosen route */
  ruta: string[];
  /** `elegido`: the node just added to the route (only when going down) */
  onRutaChange: (ruta: string[], elegido?: NodoArbol) => void;
  /** Check of the CERO equipment in the route, shown next to it */
  verificacion: CeroCheck;
}

/** Indentation of a row (and of the guide line of its children): its depth */
const sangria = (nivel: number) => ({ '--nivel': nivel }) as CSSProperties;

/** Root (área) of a node: the first part of its id, e.g. "prensas" */
const raizDe = (id: string) => id.split('/')[0];

function Verificacion({ estado }: { estado: CeroCheck }) {
  if (estado.status === 'loading') {
    return <span className={styles.arbolSpinner} role="status" aria-label="Verificando equipo" />;
  }
  if (estado.status === 'ok') {
    return (
      <span className={`${styles.arbolCheck} ${styles.arbolCheckOk}`} role="status" aria-label="Equipo verificado" title="Equipo verificado">
        ✓
      </span>
    );
  }
  if (estado.status === 'error') {
    return (
      <span className={`${styles.arbolCheck} ${styles.arbolCheckError}`} aria-hidden="true" title={estado.message}>
        !
      </span>
    );
  }
  return null;
}

/**
 * Equipment tree (Área → Sección → Grupo → Equipo → Componente), like the
 * VS Code explorer: a chevron (▶ / ▼) opens or closes a node and its
 * children stay visible under it, with one guide line per level.
 * - Which nodes are open (`expandidos`) is separate from the chosen route:
 *   choosing a node never hides other nodes.
 * - Only one área can be open: opening one closes the others with all
 *   their levels. Inside it, levels open and close freely.
 * - The name chooses the node (the route of the dashboard) and opens it;
 *   the name of the chosen node, already open, closes it.
 */
export function ArbolEquipos({ ruta, onRutaChange, verificacion }: ArbolEquiposProps) {
  // On mount (F5, phone panel opened again): the chosen route is open
  const [expandidos, setExpandidos] = useState<ReadonlySet<string>>(() => new Set(ruta));
  const elegido = ruta.at(-1);

  const abrir = (id: string) =>
    setExpandidos((actual) => {
      const raiz = raizDe(id);
      // Root accordion: everything under another área is closed
      const siguiente = new Set([...actual].filter((e) => raizDe(e) === raiz));
      siguiente.add(id);
      return siguiente;
    });

  const cerrar = (id: string) =>
    setExpandidos((actual) => {
      // Closing an área also forgets its levels; inner nodes keep them (VS Code)
      const raiz = !id.includes('/');
      return new Set([...actual].filter((e) => e !== id && !(raiz && raizDe(e) === id)));
    });

  /** Rows of one level (`nivel` = its depth; `camino` = ids of its parents) */
  const filas = (opciones: NodoArbol[], nivel: number, camino: string[]): ReactNode =>
    opciones.map((o) => {
      const hijos = o.hijos ?? [];
      const abierto = hijos.length > 0 && expandidos.has(o.id);
      const esElegido = o.id === elegido;
      const enRuta = ruta.includes(o.id);
      // The check belongs to the CERO of the route (the equipment or its Motor chosen)
      const verifica = o.cero && enRuta;
      const error = verifica && verificacion.status === 'error' ? verificacion.message : null;

      const elegir = () => {
        if (hijos.length) {
          if (!abierto) abrir(o.id);
          else if (esElegido) cerrar(o.id);
        }
        onRutaChange([...camino, o.id], o);
      };

      return (
        <li key={o.id} className={styles.arbolItem}>
          <div
            className={`${styles.arbolFila} ${enRuta ? styles.arbolRuta : ''} ${esElegido ? styles.arbolElegido : ''}`}
            style={sangria(nivel)}
          >
            {hijos.length ? (
              <button
                type="button"
                className={styles.arbolBoton}
                aria-label={`${abierto ? 'Contraer' : 'Expandir'} ${o.nombre}`}
                aria-expanded={abierto}
                title={`${abierto ? 'Contraer' : 'Expandir'} ${o.nombre}`}
                onClick={() => (abierto ? cerrar(o.id) : abrir(o.id))}
              >
                <svg className={styles.arbolFlecha} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 3.5l4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              // A leaf keeps the chevron's space, so names stay aligned
              <span className={styles.arbolBoton} aria-hidden="true" />
            )}
            <button
              type="button"
              className={styles.arbolNombre}
              title={o.nombre}
              aria-current={esElegido ? 'location' : undefined}
              onClick={elegir}
            >
              {o.nombre}
            </button>
            {verifica && <Verificacion estado={verificacion} />}
          </div>
          {error && (
            <p className={styles.arbolError} style={sangria(nivel + 1)} role="alert">
              {error}
            </p>
          )}
          {abierto && (
            // Its guide line goes from the first child to the last one
            <ul className={styles.arbolGrupo} style={sangria(nivel)}>
              {filas(hijos, nivel + 1, [...camino, o.id])}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul className={styles.arbol} aria-label="Equipos de la planta">
      {filas(JERARQUIA_DEMO, 0, [])}
    </ul>
  );
}

/**
 * Phone portrait: the route in one line under the header; tapping it opens
 * the tree. It closes by itself when an equipment or a component is chosen.
 */
export function ArbolMovil(props: ArbolEquiposProps) {
  const [abierto, setAbierto] = useState(false);
  const panelId = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const texto = textoRuta(props.ruta);

  return (
    <div className={styles.arbolMovil}>
      <button
        ref={boton}
        type="button"
        className={styles.arbolMovilBoton}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((a) => !a)}
      >
        <span className={styles.arbolMovilRuta} title={texto || undefined}>
          {/* Long routes are cut at the start, so the equipment stays visible */}
          <bdi>{texto || 'Elige un equipo'}</bdi>
        </span>
        <svg className={styles.arbolMovilFlecha} width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {abierto && (
        <div id={panelId} className={styles.arbolMovilPanel}>
          <ArbolEquipos
            {...props}
            onRutaChange={(ruta, elegido) => {
              props.onRutaChange(ruta, elegido);
              if (elegido?.nivel === 'equipo' || elegido?.nivel === 'componente') {
                setAbierto(false);
                boton.current?.focus();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
