# Cómo contribuir a VERTEX

Cada integrante sube su propio trabajo con su propia cuenta de GitHub, para que el historial muestre quién hizo cada parte.

## Flujo de trabajo

1. **Toma una tarea del tablero** ([Planificación VERTEX](https://github.com/orgs/VERTEXORG1/projects/2)) y asígnatela. Cada tarea es un issue del repositorio (#1, #2…).
2. **Crea una rama desde `main`** con el número del issue:
   ```bash
   git switch main
   git pull
   git switch -c 7-validacion-en-linea
   ```
3. **Haz commits con tu propia cuenta.** Antes del primer commit, comprueba tu identidad en ese equipo:
   ```bash
   git config user.name
   git config user.email
   ```
   Usa el correo de tu cuenta de GitHub o tu correo privado de GitHub (`ID+usuario@users.noreply.github.com`), para que el commit quede enlazado a tu perfil.
4. **Sube la rama y abre un pull request** hacia `main`. En la descripción, enlaza la tarea con `Closes #7` (o `Refs #7` si no la cierra).
5. **Islender revisa y acepta** el pull request (A en la matriz de responsabilidades; ver [EQUIPO.md](EQUIPO.md)). Nadie hace push directo a `main`.

## Reglas

- **Ninguna contraseña, token ni valor de `.env` en archivos ni en commits.** Cada carpeta tiene su `.env.example` con los nombres de las variables, sin valores.
- **No reescribas el historial de `main`** (nada de `push --force`).
- **Netlify:** cada push a `main` despliega el sitio y consume créditos del plan. Si el cambio no afecta al frontend (por ejemplo, solo documentación, `database/` o `apps/backend/`), escribe `[skip netlify]` en el mensaje del commit.
- **Archivos `.sql` en UTF-16:** varios scripts de `database/` están en UTF-16 LE con BOM. Al editarlos, conserva esa codificación.
- **Antes de abrir el pull request**, ejecuta los chequeos que tenga tu parte:
  - `apps/frontend`: `npm run lint`, `npm test` y `npm run build`.
  - `apps/backend`: `npm run typecheck` y `npm test`.

## Tareas que siguen abiertas

Las tareas abiertas son la 21 a la 25 (sprint S5, hasta el 12/11/2026) y la 26 a la 30 (sprint S6, del 13/11 al 30/11/2026). Cada integrante sube con su cuenta las de las que es responsable principal; cada tarea es un issue del [tablero](https://github.com/orgs/VERTEXORG1/projects/2). Ver el reparto en [EQUIPO.md](EQUIPO.md).
