# ADR 0003 — Identificador propio de equipo, independiente de SAP

- **Estado:** Propuesto; pendiente de ratificación de TI.
- **Autor:** Islender Arturo Alfonso Contreras (actividad 1), con asistencia de IA.

## Contexto
Cerámica Italia S.A. programa el mantenimiento en SAP (DERS §02.4). VERTEX debe complementar esos registros en el futuro (DERS §03.1), sin depender de una plataforma administrativa concreta.

## Decisión
Cada equipo tiene un identificador propio de VERTEX (`dbo.EquiposCero.codigo`, con formato `CERO-0XX`, por ejemplo `CERO-010`), y cada motor el suyo (`MOT-CERO0XX-00N`). El dashboard y la API consultan por ese código (`GET /api/equipos/:codigo`). Los códigos de SAP, si se necesitan, se relacionarían aparte.

## Consecuencias
- El sistema no queda acoplado a SAP ni a otra plataforma administrativa (DERS §05.7).
- El historial de un equipo se conserva aunque cambie su motor (`dbo.EquipoMotorHistorial`; en la demo, el cambio de MOT-CERO010-001 por MOT-CERO010-002 el 11/09/2026).
- Hace falta una tabla o servicio de correspondencia con SAP cuando se integre; hoy no existe (ver `docs/equipos-mapping.md`, "No hay códigos tipo 0001820").

## Fuentes
- DERS §05.7.
- `database/migrations/V002__create_identity_and_assets.sql` (`EquiposCero`, `Motores`, `EquipoMotorHistorial`).
- `docs/equipos-mapping.md`.
