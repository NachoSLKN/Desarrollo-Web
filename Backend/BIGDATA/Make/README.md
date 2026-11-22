# Registro de commits — GitHub + Make

> **Estado:** CSV y tabla Markdown funcionando. Pendiente validar la ejecución continua de Make con varios commits.

Esta carpeta guarda un historial estructurado de los commits registrados mediante Make. El escenario de Make detectará los cambios y añadirá una fila al archivo [`registro_commits.csv`](registro_commits.csv).

## Campos del CSV

| Campo | Significado |
| --- | --- |
| `fecha_utc` | Fecha y hora del commit (UTC) |
| `repositorio` | Repositorio de origen |
| `rama` | Rama supervisada |
| `sha` | Identificador completo del commit |
| `autor` | Autor del commit |
| `mensaje` | Mensaje del commit |
| `url` | Enlace directo al commit |

**Clave para evitar duplicados:** combinación `repositorio` + `sha`.

**Precaución contra bucles:** cuando Make actualice el CSV, creará un nuevo commit. Excluir los commits con mensaje `chore(make): actualizar registro de commits` (y, si es posible, los cambios limitados a esta carpeta).

No registrar tokens, contraseñas ni datos sensibles en el CSV.

---

El historial Markdown se genera automáticamente mediante GitHub Actions a partir del CSV. No se incluyen registros ficticios.

<!-- HISTORIAL_MAKE_INICIO -->
## Historial de commits

Generado automáticamente a partir de [`registro_commits.csv`](registro_commits.csv).

| Fecha UTC | Autor | Mensaje | Commit |
| --- | --- | --- | --- |
| 2026-11-22T09:44:55Z | NachoSLKN | Inicializar automatizacion Big Data con Make | [`3640a09`](https://github.com/NachoSLKN/Desarrollo-Web/commit/3640a0905adeacbce690ed477f806498e91307a1) |
<!-- HISTORIAL_MAKE_FIN -->
