# T6 · Reuniones con TI: registro de la información entregada

**Fuente:** cuestionario respondido por el área de TI de Cerámica Italia y entregado el **12/10/2026**. Las decisiones de la sección 3 las confirmó el responsable del proyecto el mismo día.
**Fecha de elaboración de este registro:** 31/10/2026.
**Importante:** este es un registro de las respuestas recibidas, no un acta de reunión. La fecha de entrega (12/10/2026) es posterior a la fecha de plan de la tarea (31/08–09/09), que es de planificación.
**Asistentes, nombres y cargos:** [PENDIENTE] (no constan en la fuente).
**Por seguridad, no se documenta aquí el segmento de red ni ningún dato de infraestructura interna.**

## 1. Respuestas de TI

| Tema | Respuesta de TI | Implicación para VERTEX |
|---|---|---|
| Red y acceso | Las tablets acceden a aplicaciones internas. La red está segmentada y se puede crear otro segmento. Dentro de la red: autenticación; fuera: VPN | Configuración externa, no en código |
| Alojamiento | En planta, con copia de respaldo fuera de planta | Servidor local (Windows o Rocky Linux) |
| Stack | SQL Server con la mayoría de la funcionalidad en procedimientos almacenados; Windows o Rocky; API REST en Node; JavaScript, React o Vue | Coincide con la decisión de dejar el cálculo en procedimientos almacenados |
| Diseño | Colores corporativos, diseño responsivo, tipografía Neutra | Ajuste del frontend diferido a la integración con la compañía (Etapa A) |
| Integración | API REST; SAP/MPR solo mediante una API REST diseñada en SAP | Contratos futuros, sin implementación en el entregable |
| Base de datos | La app guarda en la base de datos corporativa; lo que pase a otros sistemas, por API REST | El esquema se diseñó con los lineamientos de TI |
| Identificador de equipos | Depende de los activos configurados en el módulo de Mantenimiento de SAP | No se fija el código SAP como norma |
| Seguridad | Directorio Activo; auditoría de ingreso y de modificación de maestros | El inicio de sesión con tabla de usuarios es de la demostración; Directorio Activo queda para la Etapa A |
| Roles | Administrador, Responsable de sección, Personal de piso; roles dinámicos; un usuario puede tener uno o más roles | Implementados en la base de datos con estructura dinámica |
| Sin conectividad | Almacenamiento local y sincronización al reconectar | Aplica al dispositivo de captura, no a la tablet |
| Respaldo | Documentar desarrollos y objetos de la base; copia completa mensual, incremental diaria, del registro de transacciones cada hora | [PENDIENTE]: no contemplado aún; es de la Etapa A |
| Pruebas en infraestructura | Piden detallar el objetivo del proyecto para definir la conectividad de menor impacto; todo dentro de la red local | [PENDIENTE]: documento de alcance para TI, antes de las pruebas de conectividad |

## 2. Decisiones del responsable (12/10/2026)
1. La base de datos corporativa se estructuró con los lineamientos de TI.
2. El identificador de equipos es independiente del ERP; se usará un identificador propio y un campo genérico de código externo.
3. Flujo de captura: el dispositivo guarda las lecturas y las envía a la red cada 5 minutos; la tablet solo muestra lo ya enviado (retraso de hasta unos 5 minutos).
4. Roles dinámicos ya implementados en la base de datos.
5. Respaldo: pendiente.
6. Documento de alcance para TI: pendiente.
