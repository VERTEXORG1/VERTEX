# T3 · Mapa de partes interesadas

- **Qué es:** la sección del Taller Inception que identifica a los usuarios clave de VERTEX, su rol en el sistema y su necesidad principal.
- **De dónde sale:** [`docs/Taller_Inception_VERTEX.docx`](../../Taller_Inception_VERTEX.docx), **sección 2, "Persona / usuarios clave"**. El documento no tiene una sección titulada "Mapa de partes interesadas"; esta es la que cumple esa función. El DERS solo menciona el mapa en el plan (§06), sin desarrollarlo.
- **Fecha real:** el Taller Inception está fechado el **18/10/2026** (portada); la copia del repositorio es la versión guardada el 31/10/2026. Fecha real de elaboración del mapa: **[PENDIENTE]**. Fecha de plan de la tarea: 12/08–21/08/2026.

## Texto de la sección (copiado sin cambios)

### 2. Persona / usuarios clave

Los usuarios se definieron con el área de TI, que estableció tres niveles de acceso (administrador, responsable de sección y personal de piso) con roles dinámicos, y con el área de Mantenimiento. En la base de datos dejamos sembrados roles provisionales que se ajustarán a esos niveles antes del uso real.

| Usuario | Rol en VERTEX | Necesidad principal |
|---|---|---|
| Operario de planta | Consulta en la tablet el estado actual de su equipo. A futuro registrará el inicio y el fin de cada lote. | Saber si su equipo opera con normalidad sin realizar registros manuales. |
| Planeador de mantenimiento | Consulta las horas por estado, los ciclos y los mantenimientos de cada equipo. | Programar las órdenes de SAP con base en el uso real y no solo en el calendario. |
| Técnico de mantenimiento (mecánico o eléctrico) | Consulta tendencias de corriente, voltaje, temperatura y vibración, y registra las intervenciones. | Identificar eventos fuera de norma antes de que se conviertan en fallas. |
| Jefe de Mantenimiento | Acceso a toda la información del sistema; valida reglas, umbrales e intervalos. | Decidir ajustes de intervalos y repuestos con datos verificables. |
| Jefe de Producción | Consulta la disponibilidad de los equipos. A futuro, el consumo energético por lote. | Conocer qué equipos están disponibles y, más adelante, el costo energético real. |
| Administrador (TI) | Gestiona usuarios, roles, configuración y respaldos; integrará el Directorio Activo en la Etapa A. | Mantener el sistema seguro, auditado y alineado con los lineamientos corporativos. |

Necesidades principales: contar con información confiable y oportuna sobre las horas de funcionamiento y de mantenimiento de cada CERO, capturada automáticamente, y con una vista clara del estado de cada equipo.

Expectativas respecto al sistema: consultar por equipo y por periodo (7, 15 o 30 días o un rango de fechas) la distribución del tiempo por estado, el estado actual del motor, los bloques cronológicos y las tendencias de las variables, como base para avanzar hacia el mantenimiento por condición. El consumo energético por lote se incorporará en una etapa futura.
