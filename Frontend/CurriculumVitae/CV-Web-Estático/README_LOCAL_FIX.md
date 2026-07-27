# Corrección ArtStation: local + producción

## Qué estaba ocurriendo

Live Server (`localhost:5501`) solo sirve archivos estáticos. No puede ejecutar
`/api/artstation-projects.js`, porque esa ruta es una función serverless de Vercel.

Además, el servicio externo RSS2JSON devolvía un error 500.

## Solución aplicada

- En producción se intenta primero `/api/artstation-projects`.
- En local, si la API devuelve 404, se carga:
  `data/artstation-projects.json`.
- Se ha eliminado la dependencia de RSS2JSON.
- El carrusel sigue funcionando con dos tarjetas en escritorio y una en móvil.

## Instalación

Copia y sustituye en tu web:

- `index.html`
- `style.css`
- `script.js`
- carpeta `api`
- carpeta `data`

Después recarga con `Ctrl + Shift + R`.

## Importante para Vercel

En Vercel debes configurar como **Root Directory** la carpeta exacta donde están
`index.html`, `script.js`, `style.css` y `api/`.

Así la función se publicará como:

`/api/artstation-projects`

Si Vercel usa como raíz todo el repositorio, volverá a interpretar la ruta larga
con espacios como nombre de la función y el despliegue puede fallar.

## Actualización local

El archivo `data/artstation-projects.json` es una copia del RSS que compartiste.
La web publicada se actualizará mediante la API. Para actualizar también la vista
local cuando publiques algo nuevo, habrá que regenerar esa copia.
