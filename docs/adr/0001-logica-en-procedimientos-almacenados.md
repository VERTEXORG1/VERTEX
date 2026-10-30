# ADR 0001 — Lógica de cálculo en procedimientos almacenados `sp_vx_*`

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
VERTEX clasifica el tiempo de cada equipo en ENCENDIDO, APAGADO, EVENTO y MANTENIMIENTO, y acumula las horas por ciclo entre mantenimientos. Según el DERS (§05.7), el uso de SQL Server y de procedimientos almacenados para la lógica de cálculo responde a lineamientos de TI de Cerámica Italia S.A.

## Decisión
La lógica oficial de cálculo reside en procedimientos almacenados de SQL Server (`database/procedures/R__sp_vx_*.sql`):
- `dbo.sp_vx_resumen_estados`: clasificación de estados, ciclos, mantenimientos detectados y bloques.
- `dbo.sp_vx_tendencia_variable`: estadísticas por intervalo de una variable con el motor encendido.

La API (`apps/backend`) solo valida la solicitud y ejecuta el procedimiento (`ejecutarResumenEstados` y `findMediciones` en `equipos.service.ts`). No hay lógica de estados en Node ni en el frontend. El procedimiento solo lee `dbo.Mediciones`, nunca modifica sus filas, y usa `event_time` como única referencia de tiempo.

Los parámetros del cálculo (tolerancia de hueco, porcentaje de evento, corriente cero) están en `dbo.ConfiguracionCalculo` y los umbrales por variable en `dbo.ConfiguracionVariables`, en lugar de estar fijos en el código.

## Consecuencias
- Un único lugar de verdad para el cálculo: la dona, el estado del motor y la tabla del dashboard salen de una sola ejecución del procedimiento y siempre coinciden.
- Los parámetros se ajustan sin desplegar código, con `database/scripts/05_parametros_calculo_estados.sql`.
- El rendimiento depende de SQL Server: el procedimiento necesita el índice `IX_Mediciones_Equipo_Tiempo` (migración V006) y sugerencias de consulta (`MAXDOP 1`, `ORDER GROUP`), y es sensible a la memoria del servidor (ver `CLAUDE.md`, "Memoria de SQL Server").
- La lógica es más difícil de probar con pruebas unitarias del backend; hoy no hay pruebas automatizadas (ver README, "Estado de seguridad y pruebas").
- Los archivos `.sql` están en UTF-16 LE con BOM, lo que obliga a conservar esa codificación al editarlos.

## Fuentes
- DERS §05.7 y §05.6 (C4 nivel 4: secuencia de `sp_vx_resumen_estados`).
- `database/procedures/R__sp_vx_resumen_estados.sql`, `R__sp_vx_tendencia_variable.sql`.
- `apps/backend/src/domains/equipos/equipos.service.ts`.
- `CLAUDE.md`, secciones "Backend" y "Cálculo de estados".
