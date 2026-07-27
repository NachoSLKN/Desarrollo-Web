import * as THREE from "https://unpkg.com/three@0.167.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.167.1/examples/jsm/controls/OrbitControls.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.167.1/examples/jsm/loaders/GLTFLoader.js?module";

/* =========================================================
   CONFIGURACIÓN EDITABLE
========================================================= */

const MODEL_URL = "./models/PITBOYV2.glb";
const PROFILE_IMAGE_URL = "./img/profile.jpg";

const GITHUB_GAMES_DATABASE =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Videojuegos/main/DATA/projects.json";

const GITHUB_GAMES_REPOSITORY =
  "https://github.com/NachoSLKN/Desarrollo-Videojuegos";

const GITHUB_GAMES_RAW =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Videojuegos/main";


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
const navToggle = document.querySelector("#nav-toggle");
const siteNavigation = document.querySelector("#site-navigation");

/*
  Asegura que los controles principales del Pip-Boy sigan visibles
  aunque la cabecera fija quede por encima del topbar original.
*/
if (focusButton) {
  focusButton.textContent = "PIPBOY";
  focusButton.setAttribute("aria-pressed", "false");
  focusButton.title = "Activar o desactivar la vista del Pip-Boy";

  Object.assign(focusButton.style, {
    position: "fixed",
    top: "72px",
    right: "20px",
    zIndex: "9999",
    pointerEvents: "auto"
  });
}

/*
  Reiniciar vista deja de mostrarse porque PIPBOY funciona
  como interruptor ON/OFF.
*/
if (resetButton) {
  resetButton.style.display = "none";
}



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
let animationMixer = null;
const animationActions = new Map();
let lastWheelAnimationTime = 0;

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
    animationMixer = new THREE.AnimationMixer(model);
    animationActions.clear();

    /*
      IMPORTANTE:
      Blender exportó algunos nombres de Action cruzados.
      Por eso NO confiamos únicamente en el nombre del clip.
      Identificamos cada animación por el objeto real que mueve.
    */

    function getAnimatedTargets(clip) {
      return [
        ...new Set(
          (clip.tracks ?? []).map((track) => {
            const dotIndex = track.name.indexOf(".");
            return dotIndex >= 0
              ? track.name.slice(0, dotIndex)
              : track.name;
          })
        )
      ];
    }

    function scoreClip(clip) {
      return (clip.tracks?.length ?? 0) * 1000 + (clip.duration ?? 0);
    }

    function findBestClipByTarget(patterns) {
      const matching = gltf.animations.filter((clip) => {
        const targets = getAnimatedTargets(clip).join(" ").toLowerCase();

        return patterns.some((pattern) => pattern.test(targets));
      });

      return matching.sort((a, b) => scoreClip(b) - scoreClip(a))[0] ?? null;
    }

    function findBestClipByName(name) {
      return gltf.animations
        .filter((clip) => clip.name === name)
        .sort((a, b) => scoreClip(b) - scoreClip(a))[0] ?? null;
    }

    /*
      Nombres de objetos vistos en Blender:
      - knob1...      -> knob superior izquierdo
      - RightKnob...  -> rueda lateral derecha
      - light1...     -> botón rojo
    */
    const logicalClips = {
      Button_Press:
        findBestClipByTarget([
          /^light1/i,
          /button/i,
          /bottom.*button/i
        ]) ??
        findBestClipByName("Button_Press"),

      Knob_Rotate:
        findBestClipByTarget([
          /^knob1/i,
          /bigknob/i,
          /left.*knob/i
        ]) ??
        findBestClipByName("Knob_Rotate"),

      Wheel_Rotate:
        findBestClipByTarget([
          /^rightknob/i,
          /wheel/i,
          /side.*knob/i
        ]) ??
        findBestClipByName("Wheel_Rotate")
    };

    Object.entries(logicalClips).forEach(([logicalName, clip]) => {
      if (!clip) {
        console.warn(`No se encontró el clip físico para ${logicalName}`);
        return;
      }

      const action = animationMixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = false;
      action.enabled = true;

      animationActions.set(logicalName, action);

      console.log(
        `[Pip-Boy] ${logicalName} -> clip "${clip.name}"`,
        {
          objetos: getAnimatedTargets(clip),
          duracion: clip.duration,
          pistas: clip.tracks.map((track) => track.name)
        }
      );
    });

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
    loadingText.textContent = "";

    window.setTimeout(() => {
      loading.classList.add("done");
    }, 450);
  },

  (event) => {
    if (!event.total) return;

    const percent = Math.round((event.loaded / event.total) * 100);

    loadingProgress.style.width = `${percent}%`;
    loadingText.textContent = "";
  },

  (error) => {
    console.error("No se pudo cargar el modelo:", error);
    loadingText.textContent =
      "No se pudo cargar NachoSLKN.com.";
  }
);

/* =========================================================
   ANIMACIONES Y FOCO
========================================================= */

function playModelAnimation(name, direction = 1) {
  const action = animationActions.get(name);

  if (!action) {
    console.warn(`Animación no disponible: ${name}`);
    return false;
  }

  action.stop();
  action.enabled = true;
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = false;

  if (direction < 0) {
    action.timeScale = -1;
    action.time = action.getClip().duration;
  } else {
    action.timeScale = 1;
    action.time = 0;
  }

  action.play();
  return true;
}

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
  if (animationMixer) playModelAnimation("Button_Press");

  controls.enableRotate = !isFocused;
  controls.enableZoom = !isFocused;

  if (isFocused) {
    if (focusButton) {
      focusButton.textContent = "PIPBOY";
      focusButton.setAttribute("aria-pressed", "true");
      focusButton.title = "Pip-Boy activado · pulsar para liberar";
    }

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
    if (focusButton) {
      focusButton.textContent = "PIPBOY";
      focusButton.setAttribute("aria-pressed", "false");
      focusButton.title = "Pip-Boy desactivado · pulsar para fijar";
    }

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

focusButton?.addEventListener("click", () => {
  setFocus(!isFocused);
});

canvas.addEventListener("click", () => {
  /*
    Primer clic sobre el Pip-Boy:
      fija la cámara y abre la interfaz.

    Clics posteriores, con la pantalla ya fijada:
      reproducen físicamente el botón rojo.
  */
  if (!isFocused) {
    setFocus(true);
    return;
  }

  playModelAnimation("Button_Press");
});

mobileFocusButton?.addEventListener("click", () => {
  setFocus(!isFocused);
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  if (event.key.toLowerCase() === "f") {
    setFocus(!isFocused);
  }

  if (isFocused && event.key === "ArrowLeft") {
    selectSection(currentSection - 1);
  }

  if (isFocused && event.key === "ArrowRight") {
    selectSection(currentSection + 1);
  }
});

mobilePrevSectionButton?.addEventListener("click", () => {
  if (!isFocused) setFocus(true);
  selectSection(currentSection - 1);
});

mobileNextSectionButton?.addEventListener("click", () => {
  if (!isFocused) setFocus(true);
  selectSection(currentSection + 1);
});



/* =========================================================
   SECCIONES DE LA PANTALLA
========================================================= */

function selectSection(index) {
  const nextSection = (index + sections.length) % sections.length;

  if (nextSection !== currentSection) {
    const forward =
      index > currentSection ||
      (currentSection === sections.length - 1 && nextSection === 0);

    playModelAnimation("Knob_Rotate", forward ? 1 : -1);
  }

  currentSection = nextSection;
  drawScreen();

  if (mobileSectionLabel) {
    mobileSectionLabel.textContent = sections[currentSection].tab;
  }
}

window.addEventListener(
  "wheel",

  (event) => {
    const now = performance.now();

    if (!isFocused) {
      if (now - lastWheelAnimationTime >= 320) {
        lastWheelAnimationTime = now;
        playModelAnimation(
          "Wheel_Rotate",
          event.deltaY >= 0 ? 1 : -1
        );
      }

      return;
    }

    event.preventDefault();

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
   CABECERA RESPONSIVE
========================================================= */

navToggle?.addEventListener("click", () => {
  const open = siteNavigation?.classList.toggle("open") ?? false;
  navToggle?.setAttribute("aria-expanded", String(open));
});

siteNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNavigation.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

/* =========================================================
   CATÁLOGO DE VIDEOJUEGOS DESDE GITHUB
========================================================= */

function escapeProjectText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function encodeGitHubPath(path) {
  return String(path ?? "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function createGameUrls(game) {
  const hasFolder = Boolean(game.folder);
  const encodedFolder = hasFolder
    ? encodeGitHubPath(game.folder)
    : "";

  const imageFile = game.image || "Portada.png";

  return {
    github:
      game.github ||
      (hasFolder
        ? `${GITHUB_GAMES_REPOSITORY}/tree/main/${encodedFolder}`
        : ""),

    image:
      game.imageUrl ||
      (hasFolder
        ? `${GITHUB_GAMES_RAW}/${encodedFolder}/${encodeURIComponent(imageFile)}`
        : ""),

    readme:
      game.readme ||
      (hasFolder
        ? `${GITHUB_GAMES_REPOSITORY}/blob/main/${encodedFolder}/README.md`
        : "")
  };
}

let githubGames = [];
let githubGamesPageIndex = 0;

function githubGamesItemsPerPage() {
  return window.matchMedia("(max-width: 820px)").matches ? 1 : 2;
}

function renderGithubGamesPage() {
  const grid = document.querySelector("#github-games-grid");
  const pageLabel = document.querySelector("#github-games-page");
  const previousButton = document.querySelector("#github-games-prev");
  const nextButton = document.querySelector("#github-games-next");

  if (!grid || !pageLabel || !previousButton || !nextButton) return;

  const itemsPerPage = githubGamesItemsPerPage();
  const pageCount = Math.max(
    1,
    Math.ceil(githubGames.length / itemsPerPage)
  );

  githubGamesPageIndex = Math.min(
    githubGamesPageIndex,
    pageCount - 1
  );

  const start = githubGamesPageIndex * itemsPerPage;
  const visibleGames = githubGames.slice(
    start,
    start + itemsPerPage
  );

  grid.replaceChildren();

  visibleGames.forEach((game, visibleIndex) => {
    grid.appendChild(
      createGameCard(game, start + visibleIndex)
    );
  });

  pageLabel.textContent = githubGames.length
    ? `${githubGamesPageIndex + 1} / ${pageCount}`
    : "0 / 0";

  previousButton.disabled = githubGamesPageIndex <= 0;
  nextButton.disabled = githubGamesPageIndex >= pageCount - 1;
}

function createGameCard(game, index) {
  const urls = createGameUrls(game);
  const tags = Array.isArray(game.tags) ? game.tags : [];

  const article = document.createElement("article");
  article.className = "github-game-card";

  const projectButton = game.github || game.folder
    ? `
      <a
        class="terminal-link"
        href="${escapeProjectText(urls.github)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        VER PROYECTO
      </a>
    `
    : "";

  const readmeButton = game.readme || game.folder
    ? `
      <a
        class="terminal-link secondary-link"
        href="${escapeProjectText(urls.readme)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        VER README
      </a>
    `
    : "";

  const gameplayUrl =
    game.gameplay ||
    game.development ||
    game.video ||
    "";

  const gameplayLabel =
    game.gameplayLabel ||
    (game.status?.toLowerCase().includes("demo")
      ? "VER GAMEPLAY"
      : "VER DESARROLLO");

  const gameplayButton = gameplayUrl
    ? `
      <a
        class="terminal-link gameplay-link"
        href="${escapeProjectText(gameplayUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeProjectText(gameplayLabel)}
      </a>
    `
    : "";

  article.innerHTML = `
    <div class="github-game-cover">
      <img
        ${urls.image ? `src="${escapeProjectText(urls.image)}"` : ""}
        alt="Portada de ${escapeProjectText(game.title)}"
        loading="lazy"
      >

      <div class="github-game-cover-fallback" aria-hidden="true">
        ${escapeProjectText(game.engine || "GAME")}
      </div>
    </div>

    <div class="github-game-content">
      <p class="project-code">
        PROJECT_${String(index + 1).padStart(3, "0")}
        · ${escapeProjectText(game.status || "EN DESARROLLO")}
      </p>

      <h3>${escapeProjectText(game.title || "Proyecto sin título")}</h3>

      <p class="github-game-engine">
        ${escapeProjectText(game.engine || "Motor no indicado")}
      </p>

      <p class="github-game-description">
        ${escapeProjectText(game.description || "Sin descripción disponible.")}
      </p>

      <div class="tech-list">
        ${tags
          .map((tag) => `<span>${escapeProjectText(tag)}</span>`)
          .join("")}
      </div>

      <div class="project-actions">
        ${projectButton}
        ${readmeButton}
        ${gameplayButton}
      </div>
    </div>
  `;

  const image = article.querySelector("img");
  const fallback = article.querySelector(".github-game-cover-fallback");

  image.addEventListener("load", () => {
    fallback.hidden = true;
  });

  image.addEventListener("error", () => {
    image.hidden = true;
    fallback.hidden = false;
  });

  return article;
}

async function loadGithubGames() {
  const grid = document.querySelector("#github-games-grid");
  const status = document.querySelector("#github-games-status");
  const previousButton = document.querySelector("#github-games-prev");
  const nextButton = document.querySelector("#github-games-next");

  if (
    !grid ||
    !status ||
    !previousButton ||
    !nextButton
  ) return;

  previousButton.addEventListener("click", () => {
    if (githubGamesPageIndex <= 0) return;
    githubGamesPageIndex -= 1;
    renderGithubGamesPage();
  });

  nextButton.addEventListener("click", () => {
    const pageCount = Math.max(
      1,
      Math.ceil(
        githubGames.length / githubGamesItemsPerPage()
      )
    );

    if (githubGamesPageIndex >= pageCount - 1) return;
    githubGamesPageIndex += 1;
    renderGithubGamesPage();
  });

  status.textContent = "CONECTANDO CON GITHUB…";

  try {
    const requestUrl =
      `${GITHUB_GAMES_DATABASE}?v=${Date.now()}`;

    const response = await fetch(requestUrl, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `GitHub respondió con el estado ${response.status}`
      );
    }

    const database = await response.json();
    githubGames = Array.isArray(database.games)
      ? database.games
      : [];

    githubGamesPageIndex = 0;

    if (!githubGames.length) {
      status.textContent =
        "NO HAY PROYECTOS DEFINIDOS EN DATA/PROJECTS.JSON";
      grid.replaceChildren();
      renderGithubGamesPage();
      return;
    }

    renderGithubGamesPage();

    status.textContent =
      `${githubGames.length} PROYECTO${githubGames.length === 1 ? "" : "S"} CARGADO${githubGames.length === 1 ? "" : "S"} DESDE GITHUB`;

    status.classList.add("loaded");
  } catch (error) {
    console.error(
      "No se pudo cargar DATA/projects.json:",
      error
    );

    githubGames = [];
    renderGithubGamesPage();

    status.textContent =
      "ERROR AL CARGAR EL CATÁLOGO DE GITHUB";

    grid.innerHTML = `
      <article class="github-catalogue-error">
        <h3>NO SE PUDO CONECTAR</h3>
        <p>
          Comprueba que exista
          <strong>DATA/projects.json</strong>
          en la rama <strong>main</strong>.
        </p>

        <a
          class="terminal-link"
          href="${GITHUB_GAMES_REPOSITORY}/blob/main/DATA/projects.json"
          target="_blank"
          rel="noopener noreferrer"
        >
          COMPROBAR ARCHIVO
        </a>
      </article>
    `;
  }
}

/* =========================================================
   ARTSTATION // RSS AUTOMÁTICO + CARRUSEL RESPONSIVE
========================================================= */

const ARTSTATION_API_URL = "/api/artstation-projects";
const ARTSTATION_RSS_URL = "https://nachoslkn.artstation.com/rss";

let artstationProjects = [];
let artstationPageIndex = 0;

function artstationItemsPerPage() {
  return window.matchMedia("(max-width: 820px)").matches ? 1 : 2;
}

function cleanArtstationTitle(title) {
  return String(title || "Proyecto 3D")
    .replace(/\s+by\s+Nacho\s+SLKN\s*$/i, "")
    .trim();
}

function plainTextFromHtml(html) {
  const documentFragment = new DOMParser().parseFromString(
    String(html || ""),
    "text/html"
  );

  return documentFragment.body.textContent
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRss2JsonItem(item) {
  const html = item.content || item.description || "";
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const images = [...parsed.querySelectorAll("img")]
    .map((image) => image.src)
    .filter(Boolean);

  return {
    title: cleanArtstationTitle(item.title),
    description: plainTextFromHtml(item.description),
    link: item.link || item.guid || "",
    pubDate: item.pubDate || "",
    images
  };
}

async function fetchArtstationProjects() {
  try {
    const response = await fetch(`${ARTSTATION_API_URL}?v=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API de ArtStation: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.projects) ? data.projects : [];
  } catch (apiError) {
    console.warn(
      "Live Server no ejecuta funciones de Vercel. " +
      "Se utiliza la copia local de ArtStation.",
      apiError
    );

    const localResponse = await fetch(
      `./data/artstation-projects.json?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!localResponse.ok) {
      throw new Error(
        `No se pudo cargar data/artstation-projects.json: ${localResponse.status}`
      );
    }

    const localData = await localResponse.json();
    return Array.isArray(localData.projects) ? localData.projects : [];
  }
}

function createArtstationCard(project) {
  const article = document.createElement("article");
  article.className = "artstation-card";

  const imageUrl = Array.isArray(project.images)
    ? project.images[0] || ""
    : "";

  const date = project.pubDate
    ? new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }).format(new Date(project.pubDate))
    : "FECHA NO INDICADA";

  article.innerHTML = `
    <div class="artstation-card-media">
      ${imageUrl
        ? `<img src="${escapeProjectText(imageUrl)}"
                alt="${escapeProjectText(project.title)}"
                loading="lazy">`
        : ""}
      <div class="artstation-media-fallback" ${imageUrl ? "hidden" : ""}>
        ARTSTATION
      </div>
    </div>

    <div class="artstation-card-content">
      <p class="artstation-date">${escapeProjectText(date)}</p>
      <h3>${escapeProjectText(project.title || "Proyecto 3D")}</h3>
      <p class="artstation-description">
        ${escapeProjectText(project.description || "Sin descripción publicada.")}
      </p>

    </div>
  `;

  const image = article.querySelector("img");
  const fallback = article.querySelector(".artstation-media-fallback");

  if (image) {
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

    if (image.complete) {
      image.naturalWidth > 0 ? showImage() : showFallback();
    }
  }

  return article;
}

function renderArtstationPage() {
  const grid = document.querySelector("#artstation-grid");
  const pageLabel = document.querySelector("#artstation-page");
  const previousButton = document.querySelector("#artstation-prev");
  const nextButton = document.querySelector("#artstation-next");

  if (!grid || !pageLabel || !previousButton || !nextButton) return;

  const itemsPerPage = artstationItemsPerPage();
  const pageCount = Math.max(1, Math.ceil(artstationProjects.length / itemsPerPage));
  artstationPageIndex = Math.min(artstationPageIndex, pageCount - 1);

  const start = artstationPageIndex * itemsPerPage;
  const visibleProjects = artstationProjects.slice(start, start + itemsPerPage);

  grid.replaceChildren();
  visibleProjects.forEach((project) => {
    grid.appendChild(createArtstationCard(project));
  });

  pageLabel.textContent = artstationProjects.length
    ? `${artstationPageIndex + 1} / ${pageCount}`
    : "0 / 0";

  previousButton.disabled = artstationPageIndex <= 0;
  nextButton.disabled = artstationPageIndex >= pageCount - 1;
}

async function loadArtstationProjects() {
  const status = document.querySelector("#artstation-status");
  const grid = document.querySelector("#artstation-grid");
  const previousButton = document.querySelector("#artstation-prev");
  const nextButton = document.querySelector("#artstation-next");

  if (!status || !grid || !previousButton || !nextButton) return;

  previousButton.addEventListener("click", () => {
    if (artstationPageIndex <= 0) return;
    artstationPageIndex -= 1;
    renderArtstationPage();
  });

  nextButton.addEventListener("click", () => {
    const pageCount = Math.ceil(
      artstationProjects.length / artstationItemsPerPage()
    );

    if (artstationPageIndex >= pageCount - 1) return;
    artstationPageIndex += 1;
    renderArtstationPage();
  });

  status.textContent = "CONECTANDO CON ARTSTATION…";

  try {
    artstationProjects = await fetchArtstationProjects();
    artstationPageIndex = 0;

    if (!artstationProjects.length) {
      status.textContent = "NO HAY PROYECTOS PUBLICADOS EN ARTSTATION";
      grid.innerHTML = `
        <article class="artstation-empty">
          No se encontraron proyectos en el feed público.
        </article>
      `;
      return;
    }

    status.textContent =
      `${artstationProjects.length} PROYECTOS CARGADOS DESDE ARTSTATION`;
    status.classList.add("loaded");
    renderArtstationPage();
  } catch (error) {
    console.error("No se pudo cargar ArtStation:", error);
    status.textContent = "ERROR AL CARGAR ARTSTATION";
    grid.innerHTML = `
      <article class="artstation-error">
        <h3>NO SE PUDO CONECTAR</h3>
        <p>Comprueba la conexión o abre directamente el perfil.</p>
        <a class="terminal-link"
           href="https://www.artstation.com/nachoslkn"
           target="_blank" rel="noopener noreferrer">
          VISITAR ARTSTATION
        </a>
      </article>
    `;
  }
}

let githubGamesResizeTimer = null;

window.addEventListener("resize", () => {
  window.clearTimeout(githubGamesResizeTimer);

  githubGamesResizeTimer = window.setTimeout(() => {
    if (githubGames.length) {
      githubGamesPageIndex = 0;
      renderGithubGamesPage();
    }
  }, 160);
});

let artstationResizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(artstationResizeTimer);
  artstationResizeTimer = window.setTimeout(() => {
    if (artstationProjects.length) {
      artstationPageIndex = 0;
      renderArtstationPage();
    }
  }, 180);
});


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
  loadGithubGames();
  loadArtstationProjects();
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
  const width = hero?.clientWidth || window.innerWidth;
  const height = hero?.clientHeight || window.innerHeight;

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

  const delta = clock.getDelta();
  const time = clock.elapsedTime;
  if (animationMixer) animationMixer.update(delta);

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
