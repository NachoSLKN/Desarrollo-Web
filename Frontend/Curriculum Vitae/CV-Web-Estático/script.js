import * as THREE from "https://unpkg.com/three@0.167.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.167.1/examples/jsm/controls/OrbitControls.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.167.1/examples/jsm/loaders/GLTFLoader.js?module";

/* =========================================================
   CONFIGURACIÓN EDITABLE
========================================================= */

const MODEL_URL = "./models/PITBOYV1.glb";
const PROFILE_IMAGE_URL = "./img/profile.jpg";
/*
  Estos son los parámetros que debes terminar ajustando.

  screen.position  -> mueve el plano dentro del modelo
  screen.rotation  -> adapta la inclinación del plano al cristal
  screen.width/height -> tamaño del plano

  model.rotation   -> posición frontal exacta del Pip-Boy
  camera.position  -> dónde se coloca la cámara al fijar
  camera.target    -> punto hacia el que mira la cámara
*/
const DEFAULT_CALIBRATION = {
  screen: {
    position: { x: 0.260, y: 0.210, z: -1.160 },
    rotation: { x: -1.570, y: 0.000, z: 0.000 },
    width: 3.130,
    height: 2.280
  },

  model: {
    rotation: { x: 1.630, y: 0.000, z: 0.000 }
  },

  camera: {
    position: { x: 0.180, y: 0.500, z: 6.540 },
    target: { x: 0.220, y: 0.500, z: 0.000 }
  }
};

const FREE_CAMERA = {
  position: new THREE.Vector3(0, 0.8, 8.5),
  target: new THREE.Vector3(0, 0, 0)
};

let calibration = JSON.parse(JSON.stringify(DEFAULT_CALIBRATION));


/* =========================================================
   DOM
========================================================= */

const hero = document.querySelector(".hero-3d");
const canvas = document.querySelector("#scene");
const focusButton = document.querySelector("#focus-toggle");
const resetButton = document.querySelector("#reset-camera");
const loading = document.querySelector("#loading");
const loadingProgress = document.querySelector("#loading-progress");
const loadingText = document.querySelector("#loading-text");

const mobileFocusButton = document.querySelector("#mobile-focus-toggle");
const mobilePrevSectionButton = document.querySelector("#mobile-prev-section");
const mobileNextSectionButton = document.querySelector("#mobile-next-section");
const mobileSectionLabel = document.querySelector("#mobile-section-label");



/* =========================================================
   THREE.JS
========================================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020503);
scene.fog = new THREE.FogExp2(0x020503, 0.018);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
camera.position.copy(FREE_CAMERA.position);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = true;
controls.autoRotate = false;
controls.minDistance = 4.4;
controls.maxDistance = 13;
controls.target.copy(FREE_CAMERA.target);

scene.add(new THREE.HemisphereLight(0xaaffaa, 0x071008, 1.5));

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(4, 6, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const greenLight = new THREE.PointLight(0x63ff67, 22, 18, 2);
greenLight.position.set(0, 0.2, 2.4);
scene.add(greenLight);

const rimLight = new THREE.PointLight(0x1fb64b, 13, 25, 2);
rimLight.position.set(-4, 2, -3);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5 })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.2;
floor.receiveShadow = true;
scene.add(floor);

/* =========================================================
   ESTADO
========================================================= */

let model = null;
let customScreen = null;
let profileImage = null;

let isFocused = false;
let currentSection = 0;
let lastWheelTime = 0;
let cameraAnimationId = 0;
let modelAnimationId = 0;
let screenEffectAnimationId = 0;
let screenEffectStrength = 0;

const sections = [
  {
    tab: "STAT",
    kicker: "USER PROFILE",
    title: "NACHOSLKN",
    subtitle: "GAME DEV · WEB DEV · 3D ARTIST",
    lines: [
      "Ignacio Liñán Vicente",
      "Programación, videojuegos y creación 3D",
      "Portfolio: nachoslkn.com"
    ]
  },
  {
    tab: "WEB",
    kicker: "WEB DEVELOPMENT",
    title: "DESARROLLO WEB",
    subtitle: "FRONTEND · BACKEND · DATABASES",
    lines: [
      "HTML · CSS · JavaScript · Three.js",
      "Java · Spring · JPA · Hibernate",
      "SQL · Git · APIs"
    ]
  },
  {
    tab: "GAME",
    kicker: "GAME DEVELOPMENT",
    title: "VIDEOJUEGOS",
    subtitle: "PROTOTYPES · SYSTEMS · GAMEPLAY",
    lines: [
      "Unity · Unreal Engine · Pygame",
      "C# · Python · Adventure Game Studio",
      "Realidad virtual y prototipado"
    ]
  },
  {
    tab: "3D",
    kicker: "3D & VISUALS",
    title: "ARTE 3D",
    subtitle: "MODELING · ASSETS · RENDER",
    lines: [
      "Blender · 3ds Max",
      "Modelado y creación de assets",
      "Render · edición · presentación"
    ]
  },
  {
    tab: "CV",
    kicker: "PERSONNEL FILE",
    title: "CURRÍCULUM",
    subtitle: "ESPAÑOL · ENGLISH",
    lines: [
      "Formación en videojuegos, web y 3D",
      "Consulta las versiones bajo el Pip-Boy",
      "Madrid, España"
    ]
  },
  {
    tab: "RADIO",
    kicker: "COMMUNICATIONS",
    title: "CONTACTO",
    subtitle: "OPEN CHANNEL",
    lines: [
      "nachoslkn.com",
      "github.com/NachoSLKN",
      "Nacho15111997@gmail.com"
    ]
  }
];

/* =========================================================
   TEXTURA DINÁMICA
========================================================= */

const screenCanvas = document.createElement("canvas");
screenCanvas.width = 1400;
screenCanvas.height = 900;

const ctx = screenCanvas.getContext("2d");

const screenTexture = new THREE.CanvasTexture(screenCanvas);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.minFilter = THREE.LinearFilter;
screenTexture.magFilter = THREE.LinearFilter;
screenTexture.generateMipmaps = false;

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function loadProfileImage() {
  const image = new Image();

  image.onload = () => {
    profileImage = image;
    drawScreen();
  };

  image.onerror = () => {
    profileImage = null;
    drawScreen();
  };

  image.src = PROFILE_IMAGE_URL;
}

function drawPortrait() {
  const x = 75;
  const y = 245;
  const width = 320;
  const height = 420;

  ctx.save();
  roundedRect(ctx, x, y, width, height, 24);
  ctx.clip();

  ctx.fillStyle = "#061607";
  ctx.fillRect(x, y, width, height);

  if (profileImage) {
    const imageRatio = profileImage.width / profileImage.height;
    const targetRatio = width / height;

    let sourceWidth = profileImage.width;
    let sourceHeight = profileImage.height;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > targetRatio) {
      sourceWidth = profileImage.height * targetRatio;
      sourceX = (profileImage.width - sourceWidth) / 2;
    } else {
      sourceHeight = profileImage.width / targetRatio;
      sourceY = (profileImage.height - sourceHeight) / 2;
    }

    ctx.globalAlpha = 1;

    ctx.drawImage(
      profileImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );

    /*
      Tratamiento visual de la foto para integrarla en el Pip-Boy:
      capa verde, contraste y líneas de escaneo.
    */
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(105, 255, 115, 0.72)";
    ctx.fillRect(x, y, width, height);

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(65, 255, 85, 0.24)";
    ctx.fillRect(x, y, width, height);

    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "rgba(140, 255, 125, 0.10)";
    for (let lineY = y; lineY < y + height; lineY += 7) {
      ctx.fillRect(x, lineY, width, 2);
    }
  } else {
    ctx.fillStyle = "#9cff86";
    ctx.font = "bold 150px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("NS", x + width / 2, y + height / 2);
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(145, 255, 125, 0.75)";
  ctx.lineWidth = 4;
  roundedRect(ctx, x, y, width, height, 24);
  ctx.stroke();
}

function drawScreen() {
  const width = screenCanvas.width;
  const height = screenCanvas.height;
  const section = sections[currentSection];

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width * 0.52,
    height * 0.43,
    40,
    width * 0.52,
    height * 0.43,
    width * 0.74
  );

  gradient.addColorStop(0, "#0b2b0d");
  gradient.addColorStop(0.55, "#061607");
  gradient.addColorStop(1, "#020703");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(150, 255, 125, 0.8)";
  ctx.lineWidth = 5;
  roundedRect(ctx, 20, 20, width - 40, height - 40, 38);
  ctx.stroke();

  const tabY = 84;
  const tabStartX = 78;
  const tabWidth = 195;

  ctx.font = "bold 34px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  sections.forEach((item, index) => {
    const x = tabStartX + index * tabWidth;

    ctx.fillStyle =
      index === currentSection
        ? "#baff9e"
        : "rgba(190,255,175,0.48)";

    ctx.fillText(item.tab, x + tabWidth / 2, tabY);

    if (index === currentSection) {
      ctx.fillRect(x + 30, 119, tabWidth - 60, 7);
    }
  });

  ctx.strokeStyle = "rgba(130,255,110,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 144);
  ctx.lineTo(width - 70, 144);
  ctx.stroke();

  drawPortrait();

  const contentX = 450;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#76ff69";
  ctx.font = "bold 26px monospace";
  ctx.fillText(section.kicker, contentX, 235);

  ctx.fillStyle = "#baff9e";
  ctx.font = "bold 62px monospace";
  ctx.fillText(section.title, contentX, 322);

  ctx.fillStyle = "#80ff70";
  ctx.font = "bold 27px monospace";
  ctx.fillText(section.subtitle, contentX, 378);

  ctx.fillStyle = "rgba(220,255,210,0.84)";
  ctx.font = "28px monospace";

  section.lines.forEach((line, index) => {
    ctx.fillText(line, contentX, 475 + index * 57);
  });

  ctx.strokeStyle = "rgba(130,255,110,0.35)";
  ctx.beginPath();
  ctx.moveTo(70, height - 116);
  ctx.lineTo(width - 70, height - 116);
  ctx.stroke();

  ctx.fillStyle = "#78ff6d";
  ctx.font = "bold 24px monospace";
  ctx.fillText(
    `${String(currentSection + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`,
    80,
    height - 66
  );

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(210,255,200,0.65)";
  ctx.fillText("SCROLL / SWIPE TO NAVIGATE", width - 80, height - 66);

  ctx.globalAlpha = 0.09;
  ctx.fillStyle = "#8cff78";

  for (let y = 0; y < height; y += 8) {
    ctx.fillRect(0, y, width, 2);
  }

  ctx.globalAlpha = 1;
  screenTexture.needsUpdate = true;
}

/* =========================================================
   PANTALLA Y CALIBRACIÓN
========================================================= */

function applyCalibration({ updateGeometry = true } = {}) {
  if (!model || !customScreen) return;

  const screen = calibration.screen;

  customScreen.position.set(
    screen.position.x,
    screen.position.y,
    screen.position.z
  );

  customScreen.rotation.set(
    screen.rotation.x,
    screen.rotation.y,
    screen.rotation.z
  );

  if (updateGeometry) {
    customScreen.geometry.dispose();
    customScreen.geometry = new THREE.PlaneGeometry(
      screen.width,
      screen.height
    );
  }

  if (isFocused) {
    model.rotation.set(
      calibration.model.rotation.x,
      calibration.model.rotation.y,
      calibration.model.rotation.z
    );

    camera.position.set(
      calibration.camera.position.x,
      calibration.camera.position.y,
      calibration.camera.position.z
    );

    controls.target.set(
      calibration.camera.target.x,
      calibration.camera.target.y,
      calibration.camera.target.z
    );

    controls.update();
  }
}

function createCustomScreen() {
  const geometry = new THREE.PlaneGeometry(
    calibration.screen.width,
    calibration.screen.height
  );

  const material = new THREE.MeshBasicMaterial({
    map: screenTexture,
    toneMapped: false,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: true,
    blending: THREE.NormalBlending,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
  });

  customScreen = new THREE.Mesh(geometry, material);
  customScreen.renderOrder = 20;
  customScreen.visible = false;
  customScreen.scale.set(1, 0.02, 1);

  model.add(customScreen);
  applyCalibration();
  drawScreen();
}



/* =========================================================
   CARGA DEL MODELO
========================================================= */

const loader = new GLTFLoader();

loader.load(
  MODEL_URL,

  (gltf) => {
    model = gltf.scene;

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.metalness = Math.min(
          child.material.metalness ?? 0.55,
          0.75
        );

        child.material.roughness = Math.max(
          child.material.roughness ?? 0.35,
          0.26
        );
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const maxAxis = Math.max(size.x, size.y, size.z);
    const desiredSize = 5.2;
    const scale = desiredSize / maxAxis;

    model.scale.setScalar(scale);

    model.rotation.set(
      calibration.model.rotation.x,
      calibration.model.rotation.y,
      calibration.model.rotation.z
    );

    scene.add(model);

    createCustomScreen();
    loadProfileImage();

    loadingProgress.style.width = "100%";
    loadingText.textContent = "Portfolio preparado";

    window.setTimeout(() => {
      loading.classList.add("done");
    }, 450);
  },

  (event) => {
    if (!event.total) return;

    const percent = Math.round((event.loaded / event.total) * 100);

    loadingProgress.style.width = `${percent}%`;
    loadingText.textContent = `Cargando modelo 3D... ${percent}%`;
  },

  (error) => {
    console.error("No se pudo cargar el modelo:", error);
    loadingText.textContent =
      "Error cargando el GLB. Abre el proyecto mediante Live Server.";
  }
);

/* =========================================================
   ANIMACIONES Y FOCO
========================================================= */

function focusPositionVector() {
  return new THREE.Vector3(
    calibration.camera.position.x,
    calibration.camera.position.y,
    calibration.camera.position.z
  );
}

function focusTargetVector() {
  return new THREE.Vector3(
    calibration.camera.target.x,
    calibration.camera.target.y,
    calibration.camera.target.z
  );
}

function focusRotationEuler() {
  return new THREE.Euler(
    calibration.model.rotation.x,
    calibration.model.rotation.y,
    calibration.model.rotation.z
  );
}

function animateCamera(destinationPosition, destinationTarget, duration = 760) {
  const animationId = ++cameraAnimationId;
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function update(now) {
    if (animationId !== cameraAnimationId) return;

    const raw = Math.min((now - startTime) / duration, 1);
    const t = 1 - Math.pow(1 - raw, 3);

    camera.position.lerpVectors(startPosition, destinationPosition, t);
    controls.target.lerpVectors(startTarget, destinationTarget, t);
    controls.update();

    if (raw < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function animateModelRotation(destination, duration = 720) {
  if (!model) return;

  const animationId = ++modelAnimationId;

  const start = new THREE.Euler(
    model.rotation.x,
    model.rotation.y,
    model.rotation.z
  );

  const startTime = performance.now();

  function update(now) {
    if (animationId !== modelAnimationId) return;

    const raw = Math.min((now - startTime) / duration, 1);
    const t = 1 - Math.pow(1 - raw, 3);

    model.rotation.x = THREE.MathUtils.lerp(start.x, destination.x, t);
    model.rotation.y = THREE.MathUtils.lerp(start.y, destination.y, t);
    model.rotation.z = THREE.MathUtils.lerp(start.z, destination.z, t);

    if (raw < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}


function animateScreenHologram(show, duration = 520) {
  if (!customScreen) return;

  const animationId = ++screenEffectAnimationId;
  const material = customScreen.material;

  const startOpacity = material.opacity;
  const startScaleY = customScreen.scale.y;
  const targetOpacity = show ? 1 : 0;
  const targetScaleY = show ? 1 : 0.02;
  const startTime = performance.now();

  if (show) {
    customScreen.visible = true;
  }

  function update(now) {
    if (animationId !== screenEffectAnimationId) return;

    const raw = Math.min((now - startTime) / duration, 1);
    const eased = show
      ? 1 - Math.pow(1 - raw, 3)
      : raw * raw;

    material.opacity = THREE.MathUtils.lerp(
      startOpacity,
      targetOpacity,
      eased
    );

    customScreen.scale.y = THREE.MathUtils.lerp(
      startScaleY,
      targetScaleY,
      eased
    );

    /*
      Pequeño parpadeo inicial/final para dar sensación
      de proyección holográfica y no de aparición plana.
    */
    const flicker =
      Math.sin(raw * Math.PI * 18) *
      (1 - raw) *
      0.16;

    material.opacity = THREE.MathUtils.clamp(
      material.opacity + flicker,
      0,
      1
    );

    screenEffectStrength = show ? 1 - raw : raw;

    if (raw < 1) {
      requestAnimationFrame(update);
      return;
    }

    material.opacity = targetOpacity;
    customScreen.scale.y = targetScaleY;
    screenEffectStrength = 0;

    if (!show) {
      customScreen.visible = false;
    }
  }

  requestAnimationFrame(update);
}

function showHolographicScreen() {
  if (!customScreen) return;

  applyCalibration();
  animateScreenHologram(true, 560);
}

function hideHolographicScreen() {
  if (!customScreen || !customScreen.visible) return;

  animateScreenHologram(false, 360);
}

function setFocus(nextState) {
  isFocused = nextState;

  controls.enableRotate = !isFocused;
  controls.enableZoom = !isFocused;

  if (isFocused) {
    focusButton.textContent = "LIBERAR PANTALLA";

    if (mobileFocusButton) {
      mobileFocusButton.textContent = "CERRAR PANTALLA";
    }

    hideHolographicScreen();

    animateModelRotation(focusRotationEuler());
    animateCamera(focusPositionVector(), focusTargetVector());

    /*
      La pantalla aparece cuando el Pip-Boy ya está llegando
      a la posición calibrada.
    */
    window.setTimeout(() => {
      if (isFocused) {
        showHolographicScreen();
      }
    }, 470);
  } else {
    focusButton.textContent = "FIJAR PANTALLA";

    if (mobileFocusButton) {
      mobileFocusButton.textContent = "ABRIR PANTALLA";
    }

    hideHolographicScreen();

    /*
      Esperamos ligeramente a que el holograma se apague
      antes de devolver la cámara al modo libre.
    */
    window.setTimeout(() => {
      if (!isFocused) {
        animateCamera(FREE_CAMERA.position, FREE_CAMERA.target);
      }
    }, 190);
  }
}

focusButton.addEventListener("click", () => {
  setFocus(!isFocused);
});

mobileFocusButton?.addEventListener("click", () => {
  setFocus(!isFocused);
});

mobilePrevSectionButton?.addEventListener("click", () => {
  if (!isFocused) setFocus(true);
  selectSection(currentSection - 1);
});

mobileNextSectionButton?.addEventListener("click", () => {
  if (!isFocused) setFocus(true);
  selectSection(currentSection + 1);
});

resetButton.addEventListener("click", () => {
  animateModelRotation(focusRotationEuler());

  animateCamera(
    isFocused ? focusPositionVector() : FREE_CAMERA.position,
    isFocused ? focusTargetVector() : FREE_CAMERA.target
  );
});

/* =========================================================
   SECCIONES DE LA PANTALLA
========================================================= */

function selectSection(index) {
  currentSection =
    (index + sections.length) % sections.length;

  drawScreen();

  if (mobileSectionLabel) {
    mobileSectionLabel.textContent = sections[currentSection].tab;
  }
}

window.addEventListener(
  "wheel",

  (event) => {
    if (!isFocused) return;

    event.preventDefault();

    const now = performance.now();

    if (now - lastWheelTime < 430) return;

    lastWheelTime = now;

    selectSection(
      currentSection + (event.deltaY > 0 ? 1 : -1)
    );
  },

  { passive: false }
);


let mobileTouchStartX = null;
let mobileTouchStartY = null;

canvas.addEventListener("touchstart", (event) => {
  if (!event.touches.length) return;
  mobileTouchStartX = event.touches[0].clientX;
  mobileTouchStartY = event.touches[0].clientY;
}, { passive: true });

canvas.addEventListener("touchend", (event) => {
  if (!isFocused || mobileTouchStartX === null || mobileTouchStartY === null) {
    mobileTouchStartX = null;
    mobileTouchStartY = null;
    return;
  }

  const deltaX = event.changedTouches[0].clientX - mobileTouchStartX;
  const deltaY = event.changedTouches[0].clientY - mobileTouchStartY;

  mobileTouchStartX = null;
  mobileTouchStartY = null;

  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;

  selectSection(currentSection + (deltaX < 0 ? 1 : -1));
}, { passive: true });

/* =========================================================
   PDF.JS: VISTA PREVIA SIN DESCARGA AUTOMÁTICA
========================================================= */

async function renderPdfPreview(pdfUrl, canvasId, statusId) {
  const canvasElement = document.getElementById(canvasId);
  const statusElement = document.getElementById(statusId);

  if (!canvasElement || !statusElement) return;

  try {
    const pdfjs = await import(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs"
    );

    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

    const document = await pdfjs.getDocument(pdfUrl).promise;
    const page = await document.getPage(1);

    const baseViewport = page.getViewport({ scale: 1 });
    const desiredWidth = 1100;
    const scale = desiredWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const outputScale = Math.min(window.devicePixelRatio || 1, 1.5);

    canvasElement.width = Math.floor(viewport.width * outputScale);
    canvasElement.height = Math.floor(viewport.height * outputScale);

    const context = canvasElement.getContext("2d");
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

    await page.render({
      canvasContext: context,
      viewport
    }).promise;

    statusElement.classList.add("hidden");
  } catch (error) {
    console.error(`No se pudo mostrar ${pdfUrl}:`, error);
    statusElement.textContent =
      "No se pudo cargar la vista previa. Usa el botón ABRIR.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderPdfPreview(
    "cv/Curriculum_ES.pdf",
    "cv-preview-es",
    "cv-status-es"
  );

  renderPdfPreview(
    "cv/Curriculum_EN.pdf",
    "cv-preview-en",
    "cv-status-en"
  );
});

/* =========================================================
   RESPONSIVE Y RENDER
========================================================= */

function resizeRenderer() {
  const width = hero.clientWidth;
  const height = hero.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
  );

  renderer.setSize(width, height, false);
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);

  const time = clock.getElapsedTime();

  if (model) {
    model.position.y = Math.sin(time * 0.7) * 0.025;
  }

  greenLight.intensity =
    20 + Math.sin(time * 2.4) * 1.6;
  if (customScreen && customScreen.visible) {
    /*
      La pantalla permanece completamente opaca.
      El efecto holográfico se limita a la entrada y salida.
    */
    customScreen.material.opacity = Math.max(
      customScreen.material.opacity,
      screenEffectStrength > 0 ? customScreen.material.opacity : 1
    );
  }

  controls.update();

  renderer.render(scene, camera);
}

selectSection(0);
render();
