# Configuración propuesta de Make — GitHub → CSV

**Estado:** preparación. Estos archivos NO activan ninguna automatización por sí mismos.

## Antes de empezar

1. Elegir el repositorio de desarrollo web y su rama principal.
2. Copiar `BIGDATA/Make/` al repositorio mediante Git y hacer push.
3. Conectar a Make una cuenta con acceso a ese repositorio, usando permisos mínimos necesarios para leer commits y actualizar `BIGDATA/Make/registro_commits.csv`.
4. Configurar el escenario y dejarlo sin programación activa durante las pruebas, como indica el profesor.

## Escenario conceptual

1. **GitHub — Watch Commits**: vigilar la rama elegida y recibir cada commit nuevo.
2. **Filtro**: ignorar commits de actualización del registro con mensaje fijo `chore(make): actualizar registro de commits`.
3. **Lectura de datos**: recuperar el CSV actual y el SHA de contenido a través de la API de GitHub (si se actualiza un archivo ya existente, GitHub necesita su SHA de contenido).
4. **Validación**: comprobar que `repositorio + sha` todavía no está en el CSV.
5. **Transformación**: construir la nueva fila, escapando comas, comillas y saltos de línea según las reglas de CSV. Utilizar la fecha UTC y el SHA completo.
6. **Actualización**: escribir el CSV completo mediante la API de contenido de GitHub. El cuerpo necesita contenido codificado en Base64, el `sha` del archivo existente, la rama y un mensaje de commit fijo.
7. **Comprobación**: ejecutar `Run once` con un commit de prueba y verificar contenido, una sola fila y ausencia de recursión.

## API de GitHub (referencia)

- Leer: `GET /repos/{owner}/{repo}/contents/BIGDATA/Make/registro_commits.csv?ref={branch}`.
- Escribir: `PUT /repos/{owner}/{repo}/contents/BIGDATA/Make/registro_commits.csv`.
- Campos de escritura: `message`, `content` (Base64), `sha` (del archivo actual), `branch`.

**Importante:** no se ha creado un escenario de Make todavía. Para desplegarlo se necesita escoger el repositorio y conectar Make con GitHub. Nunca pegar tokens de acceso en un documento o en un chat.

### Comandos de preparación (desde la raíz del repositorio, una vez copiada la carpeta)

```powershell
git add BIGDATA/Make/README.md BIGDATA/Make/registro_commits.csv
git commit -m "docs: preparar registro de commits para Make"
git push
```

## Fuentes técnicas

- https://apps.make.com/github
- https://docs.github.com/en/rest/repos/contents
