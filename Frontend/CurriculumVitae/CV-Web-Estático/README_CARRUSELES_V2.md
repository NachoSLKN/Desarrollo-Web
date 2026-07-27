# Portfolio — Carruseles V2

Esta versión parte de la integración de ArtStation que ya funcionaba.

## Cambios

### Videojuegos
- Dos juegos por página en escritorio.
- Un juego por página en móvil.
- Flechas anterior/siguiente.
- Contador de páginas.
- El catálogo sigue leyendo `DATA/projects.json`.
- Puede crecer sin alargar la página indefinidamente.

### ArtStation
- Se mantiene el carrusel automático.
- Se eliminan los botones `VER EN ARTSTATION` de cada tarjeta.
- Se conserva el botón general `VISITAR ARTSTATION`.
- Se mantiene imagen, fecha, título y descripción del feed.

### Responsive
- Dos tarjetas por pantalla en escritorio.
- Una tarjeta por pantalla a partir de 820 px.
- Controles adaptados a móvil.
- Al cambiar el ancho, ambos carruseles vuelven a la primera página.

## Instalación
Sustituye:
- `index.html`
- `style.css`
- `script.js`

Conserva:
- `api/`
- `data/`

Después recarga con `Ctrl + Shift + R`.
