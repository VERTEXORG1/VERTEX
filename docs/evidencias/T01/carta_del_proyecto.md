# Carta del proyecto VERTEX

> Borrador para aprobación. Todos los datos están tomados del Taller Inception (§1, §4, §5 y §6) y del DERS (§03 y §06) que están en `docs/`. No incluye compromisos nuevos. **Sin firmar.**

## 1. Identificación

| Campo | Valor |
|---|---|
| Nombre del proyecto | VERTEX |
| Título | Monitoreo de condición y mantenimiento inteligente de los equipos CEROS |
| Cliente | Cerámica Italia S.A., planta de Cúcuta, Colombia |
| Equipo piloto | CERO-010: aplicador Sacmi SYNERGIE MAX (2019), motor WEG W22 de 3 CV y 4 polos, Línea 6 |
| Gerente del proyecto y responsable técnico | Islender Arturo Alfonso Contreras |
| Integrantes | Islender Arturo Alfonso Contreras; Anyul Lisbeth Martínez Jiménez; Ronal Gabriel Ure Carrillo; Jhoan Sebastián Blanco Rincón |
| Fecha de esta carta | [PENDIENTE: fecha de firma] |

## 2. Problema

El mantenimiento preventivo de los CEROS se programa cada tres meses por calendario en SAP, sin considerar las horas reales de uso; un producto puede usar 3 CEROS y otro hasta 8, por lo que el desgaste es desigual (Taller Inception §1).

## 3. Objetivo general

Capturar automáticamente las horas de funcionamiento y de mantenimiento de un motor (por ejemplo, el de un equipo CERO), iniciando con el CERO-010 como prototipo, para generar información confiable que complemente los registros de SAP y apoye la transición hacia un mantenimiento basado en la condición real de los equipos (Taller Inception §1).

## 4. Alcance del entregable (hasta el 30/11/2026)

Entregaremos VERTEX validado con datos de demostración: base de datos SQL Server con la lógica en procedimientos almacenados y una base demo de 654.470 registros del CERO-010, API REST y dashboard web conectados, con acceso por roles. Realizaremos las pruebas con la base de demostración: aceptación del dashboard y visualización por fechas de las horas de funcionamiento (Taller Inception §1).

**Fuera del alcance del semestre** (Taller Inception §4.1, "Won't have"): captura física en el CERO-010; despliegue en la Línea 6; consumo energético por lote; integración con SAP/MPR; Directorio Activo y respaldos; agente de diagnóstico.

**Evolución futura:** la captura física en el CERO-010 se realizará en la Etapa A; el consumo energético por lote, la extensión a otros equipos y la integración con SAP se implementarán en la Etapa B (Taller Inception §1). Las etapas se programarán con Mantenimiento y TI una vez se apruebe el entregable (Taller Inception §6.3).

## 5. Fases y fechas

| Fase | Fechas | Sprints | Criterio de cierre | Aprueba |
|---|---|---|---|---|
| Fase 1 · Levantamiento y estructura del negocio | 06/08 – 20/09/2026 | S1 Contexto y objetivos (06/08 – 28/08); S2 Requisitos y reglas (29/08 – 20/09) | Requisitos y mapa de procesos aprobados. | Gerente del proyecto (Islender) |
| Fase 2 · Base de datos demo y dashboard | 21/09 – 25/10/2026 | S3 Base de datos (21/09 – 08/10); S4 Dashboard en modo demo (09/10 – 25/10) | Base demo cargada y dashboard funcionando en modo demo. | Gerente del proyecto (Islender) |
| Fase 3 · Integración, seguridad y cierre | 26/10 – 30/11/2026 | S5 API, conexión y acceso (26/10 – 12/11); S6 Pruebas, documentación y aceptación (13/11 – 30/11) | MVP aceptado el 30/11/2026. | Gerente del proyecto (Islender) |

Fuente: Taller Inception §6.1 y DERS §06. Las fechas son de planificación.

## 6. Equipo y responsables

Matriz de responsabilidades (DERS §06.3):

| Actividad | Ejecuta | Responde y acepta |
|---|---|---|
| Arquitectura, SQL y ADR | Islender | Islender; TI ratifica el estándar |
| Interfaz y diagramas C3/C4 | Jhoan | Islender |
| Requisitos, estado del arte, ficha técnica, DERS y Taller | Anyul | Islender |
| Repositorio, tablero, integración y evidencias | Ronal | Islender |
| Seguridad y pruebas con capturas | Islender (seguridad y aceptación); Ronal (conexión); Anyul (visualización por fechas) | Islender; TI para planta |
| Demo, cierre y aceptación académica | Islender con el equipo | Equipo y docente según rúbrica |

Tareas como responsable principal (Taller Inception §6.2): Islender 9 (30 %), Anyul 9 (30 %), Jhoan 6 (20 %), Ronal 6 (20 %). El detalle de las 30 tareas está en [`docs/EQUIPO.md`](../../EQUIPO.md).

## 7. Supuestos (Taller Inception §5.1)

- TI y Mantenimiento estarán disponibles para revisar el dashboard antes del 30 de noviembre de 2026.
- Las respuestas de TI y Mantenimiento son la base de los requisitos.
- La base demo reproduce el comportamiento de las tomas de lectura que se pueden capturar a un motor.
- Una corriente mayor que 0,1 A indica que el motor está encendido.
- Se tendrán en cuenta el sistema operativo y el equipo de cada integrante al asignar las tareas, para que ninguno se bloquee por falta de máquina.
- El semestre termina el 30 de noviembre de 2026, sin prórroga.

## 8. Aprobación solicitada

Se solicita la aprobación de esta carta: el objetivo general, el alcance del entregable hasta el 30/11/2026, lo que queda fuera del semestre y el plan de 3 fases y 6 sprints descritos arriba.

| Nombre | Cargo | Fecha | Firma |
|---|---|---|---|
| [PENDIENTE: nombre] | Representante de TI, Cerámica Italia S.A. | | |
| Islender Arturo Alfonso Contreras | Gerente del proyecto | | |
| [PENDIENTE: nombre] | Docente | | |
