# ADR 0002 — Monolito modular organizado por dominios

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
El prototipo tiene tres contenedores (DERS §05.4, C4 nivel 2): frontend web, API REST y SQL Server. El alcance actual es un piloto con un equipo (CERO-010) y datos simulados, y está prevista la ampliación a captura física, mantenimiento, auditoría e integraciones corporativas.

## Decisión
Cada aplicación es un solo proceso desplegable, dividido internamente por dominios:
- **API** (`apps/backend`): una aplicación Express 5 + TypeScript con un dominio por carpeta en `src/domains/` (`equipos`, `identity` y, como estructura prevista, `data-acquisition`, `hours-calculation`, `electrical-maintenance`, `mechanical-maintenance` y `audit`) y piezas comunes en `src/shared/` (conexión a la base, middlewares).
- **Frontend** (`apps/frontend`): una aplicación React 19 + Vite con un módulo por carpeta en `src/modules/` (`auth`, `dashboard` y, como estructura prevista, `reporting` y `admin`).

No se separan microservicios.

## Consecuencias
- Un solo despliegue por aplicación y una sola conexión a la base, adecuado para el piloto.
- Los dominios previstos ya tienen su carpeta, pero hoy sus archivos están vacíos: son estructura pendiente, no funcionalidad.
- Si un dominio crece (por ejemplo, la adquisición desde dispositivos), podría separarse más adelante gracias a la división por carpetas; esa separación no está decidida.

## Fuentes
- Estructura de `apps/backend/src/domains/` y `apps/frontend/src/modules/`.
- DERS §05.4 (C4 nivel 2) y §05.5 (C4 nivel 3).
- `CLAUDE.md`, sección "Estructura".
