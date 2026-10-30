# VERTEX · Scripts

`create_demo_users.ts` asigna contraseñas a los 7 usuarios de demostración de `VERTEX_DEMO`: lee cada contraseña de una variable de entorno (`DEMO_PWD_*`), la convierte en un hash bcrypt y la guarda en `dbo.Usuarios`. Ninguna contraseña queda en archivos.

- **Desarrollo e integración:** Islender Arturo Alfonso Contreras. El tablero no tiene una tarea específica para este script.
- **Acepta:** Islender.

Uso: ver el Paso 4 de [docs/INSTALL_DATABASE.md](../docs/INSTALL_DATABASE.md).
