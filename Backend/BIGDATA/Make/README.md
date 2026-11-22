# Registro de commits — GitHub + Make

> **Estado:** plantilla de trabajo; automatización aún pendiente de conectar y probar.

Esta carpeta servirá para guardar un historial estructurado de los commits publicados en este repositorio. El escenario de Make detectará los cambios y añadirá una fila al archivo [`registro_commits.csv`](registro_commits.csv).

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

La versión inicial no contiene commits ficticios. Los registros se incorporarán cuando se pruebe el escenario.
