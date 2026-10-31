# T7 · Reuniones con Mantenimiento: registro de la información entregada

**Fuente:** respuestas del ingeniero mecánico de Cerámica Italia, entregadas el **12/10/2026**.
**Fecha de elaboración de este registro:** 31/10/2026.
**Importante:** este es un registro de las respuestas recibidas, no un acta de reunión. La fecha de entrega (12/10/2026) es posterior a la fecha de plan de la tarea (02/09–11/09), que es de planificación.
**Asistentes, nombres y cargos:** [PENDIENTE] (no constan en la fuente).

## 1. Respuestas de Ingeniería Mecánica
- **Variables necesarias:** vibración, temperatura, RPM, corriente y potencia, torque; estado de rodamientos, eje, aspas, acoplamiento y lubricación.
- **Cambios relevantes:** aumento de vibración o temperatura, variación de RPM, aumento de carga, ruidos anormales, fugas, cambios en eje o aspas.
- **Registro por período:** fecha, horas de operación, RPM, vibración, temperatura, corriente y potencia, condición del equipo, eventos.
- **Datos de proceso:** tipo de esmalte, viscosidad, densidad, temperatura, nivel del tanque, condiciones de operación.
- **Histórico útil:** tendencias de vibración, temperatura, corriente y RPM; horas; fallas; mantenimientos.
- **Anomalías:** aumento de vibración o temperatura, ruido, fugas, variación de RPM, sobrecarga, desalineación, daño de eje o aspas.
- **Para decidir una intervención:** tendencias, límites de alarma, criticidad del equipo, historial de fallas, horas, condiciones del proceso.
- **Después del mantenimiento:** falla encontrada, causa, componentes reemplazados, trabajos realizados, valores antes y después de vibración, temperatura y corriente.
- **Visualizar:** tendencias, alarmas, fallas, mantenimientos.
- **Comparar entre períodos:** vibración, temperatura, RPM, corriente y potencia, horas, condiciones del esmalte, fallas, resultados de mantenimiento.

## 2. Brechas frente al esquema de la base de datos (análisis del proyecto)

| Requisito | Estado | Qué falta |
|---|---|---|
| Vibración, temperatura, RPM, corriente, potencia | Existen en `Variables` | — |
| Torque | No existe | Variable derivada: T [N·m] = 9550 · P [kW] / n [RPM] |
| Rodamientos, eje, aspas, acoplamiento, lubricación, ruido, fugas | No son sensores | Inspecciones de condición (lista de verificación del técnico) |
| Límites de alarma | Umbrales sueltos | Tabla de límites por variable y equipo |
| Criticidad del equipo | No existe | Atributo en `EquiposCero` |
| Anomalías y alarmas | Solo `calidad` por medición | Tabla de eventos de condición |
| Proceso (esmalte) | No existe | Registro de condiciones de proceso |
| Falla, causa, componentes, antes y después | `IntervencionesMantenimiento` genérica | Catálogos de falla, causa y componente |
| Comparación entre períodos | `ContadoresCicloMotor` | Indicadores por ciclo de mantenimiento |

Estas brechas son evolución futura (Etapas A y B); el entregable del semestre cubre horas de funcionamiento, estados y tendencias con la base demo.
