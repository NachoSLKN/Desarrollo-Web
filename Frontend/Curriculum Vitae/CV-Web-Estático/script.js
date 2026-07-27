// Sustituye este bloque en tu script.js

const image = article.querySelector("img");
const fallback = article.querySelector(".github-game-cover-fallback");

const showImage = () => {
  image.hidden = false;
  fallback.hidden = true;
};

const showFallback = () => {
  image.hidden = true;
  fallback.hidden = false;
};

image.addEventListener("load", showImage);
image.addEventListener("error", showFallback);

// Si la imagen ya estaba cargada desde la caché,
// el evento load puede haberse disparado antes.
if (image.complete) {
  if (image.naturalWidth > 0) {
    showImage();
  } else {
    showFallback();
  }
}
