# VERTEX · Base de datos (SQL Server)

Esquema, procedimientos y datos de demostración de VERTEX, para las bases `VERTEX_DEMO` (datos simulados) y `VERTEX_REAL` (solo esquema), separadas a propósito ([ADR 0004](../docs/adr/0004-bases-demo-y-real-separadas.md)). Aquí vive la lógica oficial de cálculo de estados y horas ([ADR 0001](../docs/adr/0001-logica-en-procedimientos-almacenados.md)).

## Quién
- **Desarrollo:** desarrollado por Islender Arturo Alfonso Contreras según el tablero (tarea #5, Fase IV: piloto en un CERO); integrado y subido al repositorio por Islender.
- **Responsable según la matriz:** Islender (actividad 1: Arquitectura, SQL y ADR).
- **Acepta:** Islender; TI ratifica el estándar.

## Contenido
| Carpeta | Qué hay |
|---|---|
| `migrations/` | `V001`–`V006`: esquema de 33 tablas (identidad, equipos y motores, adquisición y mediciones, cálculo, mantenimiento, auditoría y configuración), índices y vistas. `V007`: columnas de `Usuarios` para el cambio obligatorio y el bloqueo temporal |
| `procedures/` | 12 procedimientos `R__sp_vx_*`. Los que usa el dashboard: `sp_vx_resumen_estados` (estados, ciclos y bloques) y `sp_vx_tendencia_variable` (tendencia de una variable). Los de identidad (`V007`): `sp_vx_login_obtener_usuario`, `sp_vx_login_registrar_resultado`, `sp_vx_password_cambiar`, `sp_vx_password_restablecer_admin` y `sp_vx_usuario_crear` |
| `seeds/` | `01_reference_data` (catálogos y las 8 variables), `02_demo_pilot_data` (equipo piloto CERO-010 y usuarios demo, con hashes de marcador) y `03_demo_measurements_extended` |
| `scripts/` | `01_install_databases` (bases y logins), `02`–`04` (preparación de datos demo y login del seed), `05_parametros_calculo_estados`, `06_configurar_memoria` y `99_verificar_integridad_variables` (solo lectura) |

Varios `.sql` están en UTF-16 LE con BOM: al editarlos hay que conservar esa codificación.

## Instalación
Desde la raíz del repositorio, con las contraseñas de los logins solo en variables de entorno:

```powershell
$env:VERTEX_DEMO_APP_USER_PWD = "<define-tu-contraseña>"
$env:VERTEX_REAL_APP_USER_PWD = "<define-tu-contraseña>"
.\instalar.ps1                  # ambas bases; -Target demo | real, -SkipCreateDb, -Server
```

Guía completa: [docs/INSTALL_DATABASE.md](../docs/INSTALL_DATABASE.md).

## Identidad: contraseñas y bloqueo (V007)
- [ADR 0007](../docs/adr/0007-recuperacion-de-contrasena-y-alta-de-usuarios.md).
- `V007__identity_recuperacion.sql` agrega a `dbo.Usuarios` cuatro columnas: `debe_cambiar_password`, `intentos_fallidos`, `bloqueado_hasta` y `password_cambiada_en`. Los usuarios existentes quedan sin cambio obligatorio.
- Reglas en los procedimientos:
  - 5 fallos seguidos bloquean al usuario 15 minutos;
  - 5 fallos desde una IP en 15 minutos (contados en `Auditoria.ip_origen`) bloquean esa IP;
  - solo `ADMINISTRADOR` e `ING_MANTENIMIENTO` crean usuarios o restablecen contraseñas, y solo un `ADMINISTRADOR` toca a otro `ADMINISTRADOR`;
  - todo queda en `dbo.Auditoria`, sin contraseñas ni hashes.
- bcrypt se calcula en el backend; la base recibe solo el hash. `app_demo_user` escribe a través de los procedimientos, sin permisos directos sobre las tablas.
- En una base ya instalada: aplicar `V007` y los cinco `R__` con una cuenta administradora (`sqlcmd -S localhost -E -d VERTEX_DEMO -i <archivo>`). `instalar.ps1` los incluye en una instalación nueva.

## Dataset de demostración
Los cerca de 650.000 registros por minuto de CERO-010 (desde el 13/07/2026) **no están versionados**: los genera el script [`apps/backend/scripts/seed-mediciones.ts`](../apps/backend/scripts/seed-mediciones.ts) con semilla fija, así que se pueden reproducir.

1. Con una cuenta administradora: `scripts/03_preparar_seed_mediciones_cero010.sql` y, una vez, `scripts/04_crear_login_seed.sql`.
2. `cd apps/backend` y `npm run seed:mediciones` (`npx tsx scripts/seed-mediciones.ts --simular` solo calcula, sin conectarse).
3. Después de cualquier carga, ejecutar `scripts/99_verificar_integridad_variables.sql`: el resumen final debe decir `OK`.

## Datos sensibles
- No hay contraseñas, hashes reales ni datos de producción en esta carpeta.
- Los hashes de usuarios del seed 02 son marcadores; los reales se generan con [`scripts/create_demo_users.ts`](../scripts/create_demo_users.ts) a partir de variables de entorno.
- La instantánea de la base (`docs/db-snapshot.xlsx`, `npm run db:export`) puede tener datos reales y está excluida en `.gitignore`.
- No se suben respaldos (`.bak`) ni archivos de datos: la base se reconstruye con los scripts.
