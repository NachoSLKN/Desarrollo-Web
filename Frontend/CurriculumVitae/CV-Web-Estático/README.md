# Integración automática de ArtStation

Esta carpeta contiene los archivos completos del portfolio con la sección
**3D y multimedia** conectada al RSS público de ArtStation.

## Archivos incluidos

- `index.html`: sección 3D reemplazada por el carrusel.
- `style.css`: estilos responsive del carrusel.
- `script.js`: carga, navegación y adaptación móvil.
- `api/artstation-projects.js`: función de Vercel que convierte el RSS a JSON.

## Instalación

1. Haz una copia de seguridad de tus archivos actuales.
2. Sustituye `index.html`, `style.css` y `script.js` por los de esta carpeta.
3. Copia la carpeta `api` completa a la raíz del proyecto web.
4. En Vercel, configura como **Root Directory** la carpeta que contiene
   `index.html`, `script.js`, `style.css` y `api/`.
5. Despliega la web.

## Prueba local

Con Live Server, el código intenta usar temporalmente RSS2JSON como respaldo,
porque Live Server no ejecuta funciones de Vercel. En producción utilizará
`/api/artstation-projects` automáticamente.

Para probar exactamente el entorno de Vercel en local puedes usar:

```powershell
npx vercel dev
```

## Comportamiento responsive

- Escritorio: 2 proyectos por página.
- Móvil/tablet estrecha: 1 proyecto por página.
- Las flechas y el contador se adaptan automáticamente.
- Los proyectos nuevos publicados en ArtStation aparecen sin editar la web.

## Importante

La integración muestra únicamente datos presentes en ArtStation: título,
descripción, fecha, primera imagen y enlace al proyecto.
