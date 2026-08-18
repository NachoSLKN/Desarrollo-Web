import * as THREE from "https://unpkg.com/three@0.167.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.167.1/examples/jsm/controls/OrbitControls.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.167.1/examples/jsm/loaders/GLTFLoader.js?module";

/* =========================================================
   CONFIGURACIÓN EDITABLE
========================================================= */

const MODEL_URL = "./models/PITBOYV2.glb";
const PROFILE_IMAGE_URL = "./img/profile.jpg";
const INSTANT_GAMING_QR_URL = "./img/affiliates/instant-gaming-qr.png";
const FLAG_ES_URL = "./img/languages/flag-es.svg";
const FLAG_EN_URL = "./img/languages/flag-en.svg";
const FLAG_DE_URL = "./img/languages/flag-de.svg";
const QUICKMAGIC_LOGO_URL = "./img/affiliates/quickmagic-logo.webp";
const INSTANT_GAMING_LOGO_URL = "./img/affiliates/instant-gaming-logo.png";

const GITHUB_GAMES_DATABASE =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Videojuegos/main/DATA/projects.json";

const GITHUB_GAMES_REPOSITORY =
  "https://github.com/NachoSLKN/Desarrollo-Videojuegos";

const GITHUB_GAMES_RAW =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Videojuegos/main";

const GITHUB_WEB_DATABASE =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Web/main/DATA/web-projects.json";

const GITHUB_WEB_REPOSITORY =
  "https://github.com/NachoSLKN/Desarrollo-Web";

const GITHUB_WEB_RAW =
  "https://raw.githubusercontent.com/NachoSLKN/Desarrollo-Web/main";

const LOCAL_WEB_DATABASE =
  "./data/web-projects.json";


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
let instantGamingQrImage = null;
let quickMagicLogoImage = null;
let instantGamingLogoImage = null;
const languageFlagImages = new Map();
const technologyImages = new Map();

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
    subtitle: "VIDEOGAMES · WEB DEV · 3D",
    lines: [
      "Ignacio Liñán Vicente",
      "Desarrollo · tecnología · creación 3D",
      "Madrid, Spain"
    ],
    type: "profile"
  },
  {
    tab: "WEB",
    kicker: "WEB DEVELOPMENT",
    title: "DESARROLLO WEB",
    subtitle: "FRONTEND · BACKEND · DATABASES",
    type: "technologies",
    technologies: [
      ["HTML", "html5"], ["CSS", "css"], ["JavaScript", "javascript"],
      ["TypeScript", "typescript"], ["React", "react"], ["Vite", "vite"],
      ["Next.js", "nextjs"], ["Node.js", "nodejs"], ["Tailwind", "tailwindcss"],
      ["Redux", "redux"], ["Zustand", "zustand"], ["REST API", "restapi"],
      ["Java", "java"], ["Spring", "spring"], ["JPA", "jpa"],
      ["Hibernate", "hibernate"], ["Servlets", "servlets"], ["JSP", "jsp"],
      ["SQL", "sql"], ["MySQL", "mysql"], ["MongoDB", "mongodb"],
      ["Flask", "flask"], ["Docker", "docker"], ["Git / GitHub", "github"]
    ]
  },
  {
    tab: "GAME",
    kicker: "GAME DEVELOPMENT",
    title: "VIDEOJUEGOS",
    subtitle: "GAMEPLAY · SYSTEMS · IMMERSIVE",
    type: "technologies",
    featured: ["VR", "AR"],
    technologies: [
      ["Unity", "unity"], ["Unreal", "unrealengine"], ["Godot", "godot"],
      ["Pygame", "pygame"], ["Adventure Game Studio", "ags"], ["C#", "csharp"],
      ["Python", "python"], ["GDScript", "gdscript"], ["Blueprints", "blueprints"],
      ["Input System", "inputsystem"], ["Netcode", "netcode"], ["WebGL", "webgl"],
      ["Tiled", "tiled"], ["Audacity", "audacity"], ["FMOD", "fmod"], ["VR", "vr"], ["AR", "ar"]
    ]
  },
  {
    tab: "3D",
    kicker: "3D & VISUALS",
    title: "3D / VISUALS",
    subtitle: "MODELING · ASSETS · RENDER",
    type: "technologies",
    technologies: [
      ["Blender", "blender"], ["SimLab", "simlab"],
      ["Krita", "krita"], ["Photoshop", "photoshop"], ["GIMP", "gimp"]
    ],
    noteLines: ["Edición básica · Krita / Photoshop", "Presentación · Modelado · Assets"]
  },
  {
    tab: "CV",
    kicker: "PERSONNEL FILE",
    title: "CURRÍCULUM",
    subtitle: "VIDEOGAMES · WEB DEV · 3D",
    lines: [
      "Español · English · Deutsch",
      "Videojuegos / Videogames · Web Dev · 3D",
      "CV disponible bajo el Pip-Boy"
    ],
    type: "text"
  },
  {
    tab: "AFF",
    kicker: "PARTNERS & AFFILIATES",
    title: "COLABORACIONES",
    subtitle: "QUICKMAGIC · INSTANT GAMING",
    lines: [
      "QuickMagic · Código: NachoSLKN",
      "Instant Gaming · Affiliate: Nacho-slkn",
      "QR y enlaces bajo el Pip-Boy"
    ],
    type: "affiliates"
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

function loadInstantGamingQr() {
  const image = new Image();

  image.onload = () => {
    instantGamingQrImage = image;
    drawScreen();
  };

  image.onerror = () => {
    instantGamingQrImage = null;
    drawScreen();
  };

  image.src = INSTANT_GAMING_QR_URL;
}

const TECHNOLOGY_ICON_URLS = {
  html5: "./img/technologies/web/html5.svg",
  css: "./img/technologies/web/css.svg",
  javascript: "./img/technologies/web/javascript.svg",
  typescript: "./img/technologies/web/typescript.svg",
  react: "./img/technologies/web/react.svg",
  vite: "./img/technologies/web/vite.svg",
  nextjs: "./img/technologies/web/nextjs.svg",
  nodejs: "./img/technologies/web/nodejs.svg",
  tailwindcss: "./img/technologies/web/tailwindcss.svg",
  redux: "./img/technologies/web/redux.svg",
  zustand: "./img/technologies/web/zustand.svg",
  restapi: "./img/technologies/web/rest-api.svg",
  java: "./img/technologies/web/java.svg",
  spring: "./img/technologies/web/spring.svg",
  jpa: "./img/technologies/web/jpa.svg",
  hibernate: "./img/technologies/web/hibernate.svg",
  servlets: "./img/technologies/web/servlets.svg",
  jsp: "./img/technologies/web/jsp.svg",
  sql: "./img/technologies/web/sql.svg",
  mysql: "./img/technologies/web/mysql.svg",
  mongodb: "./img/technologies/web/mongodb.svg",
  flask: "./img/technologies/web/flask.svg",
  docker: "./img/technologies/web/docker.svg",
  git: "./img/technologies/web/git.svg",
  github: "./img/technologies/web/github.svg",
  csharp: "./img/technologies/web/csharp.svg",

  unity: "./img/technologies/gamedev/unity.svg",
  unrealengine: "./img/technologies/gamedev/unrealengine.svg",
  godot: "./img/technologies/gamedev/godot.svg",
  python: "./img/technologies/gamedev/python.svg",
  pygame: "./img/technologies/gamedev/pygame.svg",
  ags: "./img/technologies/gamedev/ags.svg",
  gdscript: "./img/technologies/gamedev/gdscript.svg",
  blueprints: "./img/technologies/gamedev/blueprints.svg",
  inputsystem: "./img/technologies/gamedev/input-system.svg",
  netcode: "./img/technologies/gamedev/netcode.svg",
  webgl: "./img/technologies/gamedev/webgl.svg",
  tiled: "./img/technologies/gamedev/Tiled.png",
  audacity: "./img/technologies/gamedev/audacity.svg",
  fmod: "./img/technologies/gamedev/fmod.svg",
  vr: "./img/technologies/gamedev/vr.svg",
  ar: "./img/technologies/gamedev/ar.svg",
  blender: "./img/technologies/3d/blender.svg",
  krita: "./img/technologies/3d/krita.svg",
  photoshop: "./img/technologies/3d/Photoshop.png",
  gimp: "./img/technologies/3d/gimp.svg",
  simlab: "./img/technologies/3d/simlab-vr-logo.png"
};

function loadBrandImages() {
  [[QUICKMAGIC_LOGO_URL, "quick"], [INSTANT_GAMING_LOGO_URL, "instant"]].forEach(([src, key]) => {
    const image = new Image();
    image.onload = () => {
      if (key === "quick") quickMagicLogoImage = image;
      else instantGamingLogoImage = image;
      drawScreen();
    };
    image.onerror = () => drawScreen();
    image.src = src;
  });
}

function getTechnologyImage(icon) {
  if (technologyImages.has(icon)) return technologyImages.get(icon);

  const image = new Image();
  image.onload = drawScreen;
  image.onerror = () => {
    image.failed = true;
    drawScreen();
  };
  image.src = TECHNOLOGY_ICON_URLS[icon] || "";
  technologyImages.set(icon, image);
  return image;
}


function loadLanguageFlags() {
  [
    ["ES", FLAG_ES_URL],
    ["EN", FLAG_EN_URL],
    ["DE", FLAG_DE_URL]
  ].forEach(([key, src]) => {
    const image = new Image();
    image.onload = () => {
      languageFlagImages.set(key, image);
      drawScreen();
    };
    image.onerror = () => drawScreen();
    image.src = src;
  });
}

function drawLanguageBadge(x, y, code, label) {
  const image = languageFlagImages.get(code);

  ctx.fillStyle = "rgba(8,35,10,0.62)";
  roundedRect(ctx, x, y, 330, 105, 16);
  ctx.fill();

  ctx.strokeStyle = "rgba(125,255,105,0.34)";
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, 330, 105, 16);
  ctx.stroke();

  if (image && image.complete && image.naturalWidth) {
    const maxW = 72;
    const maxH = 45;
    const ratio = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
    const w = image.naturalWidth * ratio;
    const h = image.naturalHeight * ratio;
    ctx.drawImage(image, x + 24, y + (105 - h) / 2, w, h);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#baff9e";
  ctx.font = "bold 23px monospace";
  ctx.fillText(code, x + 118, y + 43);

  ctx.fillStyle = "rgba(220,255,210,0.74)";
  ctx.font = "18px monospace";
  ctx.fillText(label, x + 118, y + 74);
}

function drawCvPanel(section) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#76ff69";
  ctx.font = "bold 22px monospace";
  ctx.fillText(section.kicker, 80, 180);

  ctx.fillStyle = "#baff9e";
  ctx.font = "bold 42px monospace";
  ctx.fillText(section.title, 80, 226);

  ctx.fillStyle = "#80ff70";
  ctx.font = "bold 20px monospace";
  ctx.fillText(section.subtitle, 80, 260);

  drawLanguageBadge(90, 320, "ES", "Español");
  drawLanguageBadge(535, 320, "EN", "English");
  drawLanguageBadge(980, 320, "DE", "Deutsch");

  ctx.fillStyle = "rgba(220,255,210,0.84)";
  ctx.font = "24px monospace";
  ctx.fillText("Videojuegos / Videogames · Web Dev · 3D", 90, 520);
  ctx.fillText("CV completo disponible bajo el Pip-Boy", 90, 575);
}

function drawTechnologyGrid(section) {
  const items = section.technologies || [];
  const isGame = section.tab === "GAME";
  const startX = 90;
  const cols = items.length > 12 ? 6 : 4;
  const cellW = items.length > 12 ? 200 : 280;
  const cellH = items.length > 12 ? 102 : 132;
  const iconSize = items.length > 12 ? 46 : 58;

  let startY = 300;

  if (isGame) {
    // Bloque VR/AR separado de la cabecera para evitar solapamientos.
    const featureY = 285;

    ctx.fillStyle = "rgba(125,255,105,0.08)";
    roundedRect(ctx, 75, featureY, 1250, 82, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(145,255,125,0.46)";
    ctx.lineWidth = 2;
    roundedRect(ctx, 75, featureY, 1250, 82, 18);
    ctx.stroke();

    ctx.fillStyle = "#baff9e";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "left";
    ctx.fillText("IMMERSIVE DEVELOPMENT", 105, featureY + 32);

    ctx.fillStyle = "#76ff69";
    ctx.font = "bold 22px monospace";
    ctx.fillText("VR  ·  AR", 105, featureY + 63);

    startY = 390;
  }

  items.forEach(([name, icon], index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * cellW;
    const y = startY + row * cellH;
    const boxW = cellW - 18;
    const boxH = cellH - 10;
    const image = getTechnologyImage(icon);

    ctx.fillStyle = "rgba(8,35,10,0.62)";
    roundedRect(ctx, x, y, boxW, boxH, 14);
    ctx.fill();

    ctx.strokeStyle = "rgba(125,255,105,0.24)";
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, boxW, boxH, 14);
    ctx.stroke();

    if (image.complete && !image.failed && image.naturalWidth) {
      const ratio = Math.min(iconSize / image.naturalWidth, iconSize / image.naturalHeight);
      const drawW = image.naturalWidth * ratio;
      const drawH = image.naturalHeight * ratio;
      ctx.drawImage(
        image,
        x + 14 + (iconSize - drawW) / 2,
        y + 12 + (iconSize - drawH) / 2,
        drawW,
        drawH
      );
    } else {
      ctx.fillStyle = "#76ff69";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.fillText(name.slice(0, 2).toUpperCase(), x + 14 + iconSize / 2, y + 48);
    }

    ctx.textAlign = "left";
    ctx.fillStyle = "#baff9e";
    ctx.font = items.length > 12 ? "bold 15px monospace" : "bold 19px monospace";

    const maxChars = items.length > 12 ? 18 : 22;
    const label = name.toUpperCase();
    if (label.length > maxChars) {
      const splitAt = label.lastIndexOf(" ", maxChars);
      const cut = splitAt > 6 ? splitAt : maxChars;
      ctx.fillText(label.slice(0, cut), x + 12, y + boxH - 31);
      ctx.fillText(label.slice(cut).trim(), x + 12, y + boxH - 11);
    } else {
      ctx.fillText(label, x + 12, y + boxH - 18);
    }
  });

  if (section.noteLines) {
    ctx.fillStyle = "rgba(220,255,210,0.78)";
    ctx.font = "21px monospace";
    ctx.textAlign = "left";
    section.noteLines.forEach((line, i) => ctx.fillText(line, 90, 735 + i * 35));
  }
}

function drawAffiliatePanel() {
  const cards = [
    { x: 75, title: "QUICKMAGIC", image: quickMagicLogoImage, detail: "20% commission · Code NachoSLKN" },
    { x: 455, title: "INSTANT GAMING", image: instantGamingLogoImage, detail: "3% commission · Nacho-slkn" }
  ];
  cards.forEach(card => {
    ctx.fillStyle="#061607"; roundedRect(ctx,card.x,250,340,300,22); ctx.fill();
    ctx.strokeStyle="rgba(145,255,125,.7)"; ctx.lineWidth=3; roundedRect(ctx,card.x,250,340,300,22); ctx.stroke();
    if(card.image) {
      const maxW=260,maxH=105,r=Math.min(maxW/card.image.width,maxH/card.image.height);
      ctx.drawImage(card.image,card.x+(340-card.image.width*r)/2,285,card.image.width*r,card.image.height*r);
    }
    ctx.fillStyle="#baff9e";ctx.font="bold 25px monospace";ctx.textAlign="center";ctx.fillText(card.title,card.x+170,430);
    ctx.fillStyle="rgba(220,255,210,.75)";ctx.font="16px monospace";ctx.fillText(card.detail,card.x+170,475);
  });
  const qx=875,qy=245,qs=280;
  ctx.fillStyle="#fff";ctx.fillRect(qx-8,qy-8,qs+16,qs+16);
  if(instantGamingQrImage) ctx.drawImage(instantGamingQrImage,qx,qy,qs,qs);
  ctx.fillStyle="#baff9e";ctx.font="bold 21px monospace";ctx.textAlign="center";ctx.fillText("INSTANT GAMING QR",qx+qs/2,qy+qs+48);
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
  const tabStartX = 70;
  const tabWidth = (width - tabStartX * 2) / sections.length;

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

  if (section.type === "technologies") {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#76ff69";
    ctx.font = "bold 20px monospace";
    ctx.fillText(section.kicker, 80, 178);

    ctx.fillStyle = "#baff9e";
    ctx.font = "bold 38px monospace";
    ctx.fillText(section.title, 80, 220);

    ctx.fillStyle = "#80ff70";
    ctx.font = "bold 18px monospace";
    ctx.fillText(section.subtitle, 80, 252);

    drawTechnologyGrid(section);
  } else if (section.type === "affiliates") {
    ctx.textAlign="left"; ctx.fillStyle="#76ff69"; ctx.font="bold 24px monospace"; ctx.fillText(section.kicker,75,190);
    ctx.fillStyle="#baff9e";ctx.font="bold 44px monospace";ctx.fillText(section.title,75,235);
    drawAffiliatePanel();
  } else if (section.tab === "CV") {
    drawCvPanel(section);
  } else {
    if (section.type === "profile") drawPortrait();
    const contentX = section.type === "profile" ? 450 : 120;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#76ff69"; ctx.font = "bold 26px monospace"; ctx.fillText(section.kicker, contentX, 235);
    ctx.fillStyle = "#baff9e"; ctx.font = "bold 62px monospace"; ctx.fillText(section.title, contentX, 322);
    ctx.fillStyle = "#80ff70"; ctx.font = "bold 27px monospace"; ctx.fillText(section.subtitle, contentX, 378);
    ctx.fillStyle = "rgba(220,255,210,0.84)"; ctx.font = "28px monospace";
    (section.lines || []).forEach((line, index) => ctx.fillText(line, contentX, 475 + index * 57));
  }

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
    loadInstantGamingQr();
loadBrandImages();
loadLanguageFlags();

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

function ensureInlineGameStyles() {
  if (document.querySelector("#inline-game-styles")) return;

  const style = document.createElement("style");
  style.id = "inline-game-styles";
  style.textContent = `
    .github-game-cover.inline-game-active {
      position: relative;
      aspect-ratio: 16 / 9;
      min-height: 360px;
      background: #000;
      overflow: hidden;
    }

    .inline-game-frame {
      width: 100%;
      height: 100%;
      min-height: 360px;
      border: 0;
      display: block;
      background: #000;
    }

    .inline-game-toolbar {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 5;
      display: flex;
      gap: 8px;
    }

    /*
      Pantalla completa visual:
      ocupa toda la ventana sin utilizar requestFullscreen(),
      evitando que Pygbag reinicie el juego.
    */
    .github-game-cover.inline-game-active.inline-game-expanded {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      aspect-ratio: auto;
      z-index: 100000;
      background: #000;
    }

    .github-game-cover.inline-game-active.inline-game-expanded .inline-game-frame {
      width: 100%;
      height: 100%;
      min-height: 100vh;
    }

    .github-game-cover.inline-game-active.inline-game-expanded .inline-game-toolbar {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 100001;
    }

    .inline-game-toolbar button {
      border: 1px solid #63ff67;
      background: rgba(0, 12, 3, 0.92);
      color: #baff9e;
      font: inherit;
      padding: 8px 12px;
      cursor: pointer;
    }

    .inline-game-toolbar button:hover,
    .inline-game-toolbar button:focus-visible {
      background: #63ff67;
      color: #001804;
    }

    .terminal-link.inline-play-button {
      font: inherit;
      cursor: pointer;
    }

    @media (max-width: 820px) {
      .github-game-cover.inline-game-active,
      .inline-game-frame {
        min-height: 240px;
      }
    }
  `;

  document.head.appendChild(style);
}

function createGameCard(game, index) {
  ensureInlineGameStyles();

  const urls = createGameUrls(game);
  const tags = Array.isArray(game.tags) ? game.tags : [];

  const article = document.createElement("article");
  article.className = "github-game-card";

  function createActionButton({
    url,
    label,
    className = "",
    download = false
  }) {
    if (!url) return "";

    const extraClass = className ? ` ${className}` : "";
    const downloadAttribute = download ? " download" : "";

    return `
      <a
        class="terminal-link${extraClass}"
        href="${escapeProjectText(url)}"
        target="_blank"
        rel="noopener noreferrer"${downloadAttribute}
      >
        ${escapeProjectText(label)}
      </a>
    `;
  }

  /*
    JUGAR ONLINE ya no abre otra pestaña.
    Al pulsarlo, la portada de la tarjeta se sustituye por un iframe.
    Se usa embedUrl cuando exista y, como respaldo, playUrl.
  */
  const inlineGameUrl = game.embedUrl || game.playUrl || "";

  const playButton = inlineGameUrl
    ? `
      <button
        type="button"
        class="terminal-link play-link inline-play-button"
        data-inline-play
      >
        ${escapeProjectText(game.playLabel || "JUGAR ONLINE")}
      </button>
    `
    : "";

  const downloadButton = createActionButton({
    url: game.downloadUrl,
    label: game.downloadLabel || "DESCARGAR WINDOWS",
    className: "download-link"
  });

  const itchButton = createActionButton({
    url: game.itchUrl,
    label: game.itchLabel || "VER EN ITCH.IO",
    className: "itch-link"
  });

  const projectButton = createActionButton({
    url: game.github || game.folder ? urls.github : "",
    label: "VER PROYECTO"
  });

  const githubPcButton = createActionButton({
    url: game.githubPc,
    label: "CÓDIGO PC",
    className: "secondary-link"
  });

  const githubWebButton = createActionButton({
    url: game.githubWeb,
    label: "CÓDIGO WEB",
    className: "secondary-link"
  });

  const readmeButton = createActionButton({
    url: game.readme || game.folder ? urls.readme : "",
    label: "VER README",
    className: "secondary-link"
  });

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

  const gameplayButton = createActionButton({
    url: gameplayUrl,
    label: gameplayLabel,
    className: "gameplay-link"
  });

  article.innerHTML = `
    <div class="github-game-cover">
      <img
        ${urls.image ? `src="${escapeProjectText(urls.image)}"` : ""}
        alt="Portada de ${escapeProjectText(game.title)}"
        loading="lazy"
      >

      <div class="github-game-cover-fallback" aria-hidden="true" hidden>
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
        ${githubPcButton}
        ${githubWebButton}
        ${readmeButton}
      </div>
    </div>
  `;

  const cover = article.querySelector(".github-game-cover");
  const image = article.querySelector("img");
  const fallback = article.querySelector(".github-game-cover-fallback");
  const playControl = article.querySelector("[data-inline-play]");

  const showImage = () => {
    if (cover.classList.contains("inline-game-active")) return;
    image.hidden = false;
    fallback.hidden = true;
  };

  const showFallback = () => {
    if (cover.classList.contains("inline-game-active")) return;
    image.hidden = true;
    fallback.hidden = false;
  };

  image.addEventListener("load", showImage);
  image.addEventListener("error", showFallback);

  if (image.complete) {
    image.naturalWidth > 0 ? showImage() : showFallback();
  }

  if (playControl && inlineGameUrl) {
    let gameOpen = false;
    let expandedPlaceholder = null;
    let originalParent = null;
    let originalNextSibling = null;

    const restoreCoverToCard = () => {
      cover.classList.remove("inline-game-expanded");

      if (expandedPlaceholder?.parentNode) {
        expandedPlaceholder.parentNode.insertBefore(
          cover,
          expandedPlaceholder
        );

        expandedPlaceholder.remove();
      } else if (originalParent) {
        originalParent.insertBefore(cover, originalNextSibling);
      }

      expandedPlaceholder = null;
      originalParent = null;
      originalNextSibling = null;
      document.body.style.overflow = "";
    };

    const closeInlineGame = () => {
      restoreCoverToCard();

      cover.querySelector(".inline-game-frame")?.remove();
      cover.querySelector(".inline-game-toolbar")?.remove();
      cover.classList.remove("inline-game-active");

      gameOpen = false;
      playControl.textContent = game.playLabel || "JUGAR ONLINE";

      image.naturalWidth > 0 ? showImage() : showFallback();
    };

    playControl.addEventListener("click", () => {
      if (gameOpen) {
        closeInlineGame();
        return;
      }

      gameOpen = true;
      image.hidden = true;
      fallback.hidden = true;
      cover.classList.add("inline-game-active");
      playControl.textContent = "CERRAR JUEGO";

      const frame = document.createElement("iframe");
      frame.className = "inline-game-frame";
      frame.src = inlineGameUrl;
      frame.title = `Jugar a ${game.title || "videojuego"}`;
      frame.loading = "eager";
      frame.allow = "autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "0";

      const toolbar = document.createElement("div");
      toolbar.className = "inline-game-toolbar";

      const fullscreenButton = document.createElement("button");
      fullscreenButton.type = "button";
      fullscreenButton.textContent = "PANTALLA COMPLETA";

      fullscreenButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const expanded = cover.classList.contains("inline-game-expanded");

        if (!expanded) {
          originalParent = cover.parentNode;
          originalNextSibling = cover.nextSibling;

          expandedPlaceholder = document.createComment(
            "posición original del juego"
          );

          originalParent.insertBefore(expandedPlaceholder, cover);
          document.body.appendChild(cover);

          cover.classList.add("inline-game-expanded");
          document.body.style.overflow = "hidden";

          fullscreenButton.textContent = "SALIR DE PANTALLA COMPLETA";
        } else {
          restoreCoverToCard();
          fullscreenButton.textContent = "PANTALLA COMPLETA";
        }
      });

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.textContent = "CERRAR";
      closeButton.addEventListener("click", closeInlineGame);

      toolbar.append(fullscreenButton, closeButton);
      cover.replaceChildren(frame, toolbar);


    });
  }

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
   CATÁLOGO DE PROYECTOS WEB DESDE GITHUB
========================================================= */

function createWebProjectUrls(project) {
  const hasFolder = Boolean(project.folder);
  const encodedFolder = hasFolder
    ? encodeGitHubPath(project.folder)
    : "";

  const imageFile = project.image || "Portada.png";

  return {
    github:
      project.github ||
      (hasFolder
        ? `${GITHUB_WEB_REPOSITORY}/tree/main/${encodedFolder}`
        : GITHUB_WEB_REPOSITORY),

    image:
      project.imageUrl ||
      (hasFolder
        ? `${GITHUB_WEB_RAW}/${encodedFolder}/${encodeURIComponent(imageFile)}`
        : ""),

    readme:
      project.readme ||
      (hasFolder
        ? `${GITHUB_WEB_REPOSITORY}/blob/main/${encodedFolder}/README.md`
        : "")
  };
}

let githubWebProjects = [];
let githubWebPageIndex = 0;

function githubWebItemsPerPage() {
  return window.matchMedia("(max-width: 820px)").matches ? 1 : 2;
}

function renderGithubWebPage() {
  const grid = document.querySelector("#github-web-grid");
  const pageLabel = document.querySelector("#github-web-page");
  const previousButton = document.querySelector("#github-web-prev");
  const nextButton = document.querySelector("#github-web-next");

  if (!grid || !pageLabel || !previousButton || !nextButton) return;

  const itemsPerPage = githubWebItemsPerPage();
  const pageCount = Math.max(
    1,
    Math.ceil(githubWebProjects.length / itemsPerPage)
  );

  githubWebPageIndex = Math.min(githubWebPageIndex, pageCount - 1);

  const start = githubWebPageIndex * itemsPerPage;
  const visibleProjects = githubWebProjects.slice(
    start,
    start + itemsPerPage
  );

  grid.replaceChildren();

  visibleProjects.forEach((project, visibleIndex) => {
    grid.appendChild(
      createWebProjectCard(project, start + visibleIndex)
    );
  });

  pageLabel.textContent = githubWebProjects.length
    ? `${githubWebPageIndex + 1} / ${pageCount}`
    : "0 / 0";

  previousButton.disabled = githubWebPageIndex <= 0;
  nextButton.disabled = githubWebPageIndex >= pageCount - 1;
}

function createWebProjectCard(project, index) {
  const urls = createWebProjectUrls(project);
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const projectType = project.type || "WEB";

  const article = document.createElement("article");
  article.className = "github-game-card web-project-card";

  const readmeButton = urls.readme
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

  const webEmbedUrl = project.embedUrl || project.playUrl || "";

  const webPlayButton = webEmbedUrl
    ? `
      <button
        type="button"
        class="terminal-link play-link inline-play-button"
        data-web-inline-play
      >
        ${escapeProjectText(project.playLabel || "PROBAR EN NAVEGADOR")}
      </button>
    `
    : "";

  const demoButton = project.demo
    ? `
      <a
        class="terminal-link gameplay-link"
        href="${escapeProjectText(project.demo)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        VER DEMO
      </a>
    `
    : "";

  article.innerHTML = `
    <div class="github-game-cover">
      <img
        ${urls.image ? `src="${escapeProjectText(urls.image)}"` : ""}
        alt="Portada de ${escapeProjectText(project.title)}"
        loading="lazy"
      >

      <div class="github-game-cover-fallback" aria-hidden="true" hidden>
        PORTADA PENDIENTE
      </div>
    </div>

    <div class="github-game-content">
      <p class="project-code">
        WEB_${String(index + 1).padStart(3, "0")}
        · ${escapeProjectText(project.status || "PROYECTO")}
      </p>

      <h3>${escapeProjectText(project.title || "Proyecto sin título")}</h3>

      <p class="github-game-engine">
        ${escapeProjectText(projectType)}
      </p>

      <p class="github-game-description">
        ${escapeProjectText(project.description || "Sin descripción disponible.")}
      </p>

      <div class="tech-list">
        ${tags
      .map((tag) => `<span>${escapeProjectText(tag)}</span>`)
      .join("")}
      </div>

      <div class="project-actions">
        <a
          class="terminal-link"
          href="${escapeProjectText(urls.github)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          VER PROYECTO
        </a>
        ${readmeButton}
        ${webPlayButton}
        ${demoButton}
      </div>
    </div>
  `;

  const cover = article.querySelector(".github-game-cover");
  const image = article.querySelector("img");
  const fallback = article.querySelector(".github-game-cover-fallback");
  const playControl = article.querySelector("[data-web-inline-play]");

  const showImage = () => {
    if (cover.classList.contains("inline-game-active")) return;
    image.hidden = false;
    fallback.hidden = true;
  };

  const showFallback = () => {
    if (cover.classList.contains("inline-game-active")) return;
    image.hidden = true;
    fallback.hidden = false;
  };

  image.addEventListener("load", showImage);
  image.addEventListener("error", showFallback);

  if (image.complete) {
    image.naturalWidth > 0 ? showImage() : showFallback();
  }

  if (playControl && webEmbedUrl) {
    ensureInlineGameStyles();
    let projectOpen = false;
    let expandedPlaceholder = null;
    let originalParent = null;
    let originalNextSibling = null;

    const restoreCoverToCard = () => {
      cover.classList.remove("inline-game-expanded");
      if (expandedPlaceholder?.parentNode) {
        expandedPlaceholder.parentNode.insertBefore(cover, expandedPlaceholder);
        expandedPlaceholder.remove();
      } else if (originalParent) {
        originalParent.insertBefore(cover, originalNextSibling);
      }
      expandedPlaceholder = null;
      originalParent = null;
      originalNextSibling = null;
      document.body.style.overflow = "";
    };

    const closeWebProject = () => {
      restoreCoverToCard();
      cover.querySelector(".inline-game-frame")?.remove();
      cover.querySelector(".inline-game-toolbar")?.remove();
      cover.classList.remove("inline-game-active");
      projectOpen = false;
      playControl.textContent = project.playLabel || "PROBAR EN NAVEGADOR";
      image.naturalWidth > 0 ? showImage() : showFallback();
    };

    playControl.addEventListener("click", () => {
      if (projectOpen) {
        closeWebProject();
        return;
      }

      projectOpen = true;
      image.hidden = true;
      fallback.hidden = true;
      cover.classList.add("inline-game-active");
      playControl.textContent = "CERRAR PROYECTO";

      const frame = document.createElement("iframe");
      frame.className = "inline-game-frame";
      frame.src = webEmbedUrl;
      frame.title = `Probar ${project.title || "proyecto web"}`;
      frame.loading = "eager";
      frame.allow = "autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      const toolbar = document.createElement("div");
      toolbar.className = "inline-game-toolbar";

      const fullscreenButton = document.createElement("button");
      fullscreenButton.type = "button";
      fullscreenButton.textContent = "PANTALLA COMPLETA";
      fullscreenButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const expanded = cover.classList.contains("inline-game-expanded");
        if (!expanded) {
          originalParent = cover.parentNode;
          originalNextSibling = cover.nextSibling;
          expandedPlaceholder = document.createComment("posición original del proyecto web");
          originalParent.insertBefore(expandedPlaceholder, cover);
          document.body.appendChild(cover);
          cover.classList.add("inline-game-expanded");
          document.body.style.overflow = "hidden";
          fullscreenButton.textContent = "SALIR DE PANTALLA COMPLETA";
        } else {
          restoreCoverToCard();
          fullscreenButton.textContent = "PANTALLA COMPLETA";
        }
      });

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.textContent = "CERRAR";
      closeButton.addEventListener("click", closeWebProject);

      toolbar.append(fullscreenButton, closeButton);
      cover.replaceChildren(frame, toolbar);
    });
  }

  return article;
}

async function fetchWebProjectsDatabase() {
  const sources = [
    `${LOCAL_WEB_DATABASE}?v=${Date.now()}`,
    `${GITHUB_WEB_DATABASE}?v=${Date.now()}`
  ];

  let lastError = null;

  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Respuesta ${response.status} desde ${source}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`No se pudo cargar el catálogo web desde ${source}`, error);
    }
  }

  throw lastError || new Error("No se pudo cargar el catálogo web");
}

async function loadGithubWebProjects() {
  const grid = document.querySelector("#github-web-grid");
  const status = document.querySelector("#github-web-status");
  const previousButton = document.querySelector("#github-web-prev");
  const nextButton = document.querySelector("#github-web-next");

  if (!grid || !status || !previousButton || !nextButton) return;

  previousButton.addEventListener("click", () => {
    if (githubWebPageIndex <= 0) return;
    githubWebPageIndex -= 1;
    renderGithubWebPage();
  });

  nextButton.addEventListener("click", () => {
    const pageCount = Math.max(
      1,
      Math.ceil(githubWebProjects.length / githubWebItemsPerPage())
    );

    if (githubWebPageIndex >= pageCount - 1) return;
    githubWebPageIndex += 1;
    renderGithubWebPage();
  });

  status.textContent = "CONECTANDO CON EL CATÁLOGO WEB…";

  try {
    const database = await fetchWebProjectsDatabase();

    githubWebProjects = Array.isArray(database.projects)
      ? database.projects
      : [];

    githubWebPageIndex = 0;

    if (!githubWebProjects.length) {
      status.textContent =
        "NO HAY PROYECTOS DEFINIDOS EN DATA/WEB-PROJECTS.JSON";
      renderGithubWebPage();
      return;
    }

    renderGithubWebPage();

    status.textContent =
      `${githubWebProjects.length} PROYECTO${githubWebProjects.length === 1 ? "" : "S"} WEB CARGADO${githubWebProjects.length === 1 ? "" : "S"}`;

    status.classList.add("loaded");
  } catch (error) {
    console.error("No se pudo cargar DATA/web-projects.json:", error);

    githubWebProjects = [];
    renderGithubWebPage();

    status.textContent = "ERROR AL CARGAR EL CATÁLOGO WEB";

    grid.innerHTML = `
      <article class="github-catalogue-error">
        <h3>NO SE PUDO CONECTAR</h3>
        <p>
          Comprueba que exista
          <strong>DATA/web-projects.json</strong>
          en la rama <strong>main</strong>.
        </p>

        <a
          class="terminal-link"
          href="${GITHUB_WEB_REPOSITORY}/blob/main/DATA/web-projects.json"
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

let githubWebResizeTimer = null;
window.addEventListener("resize", () => {
  window.clearTimeout(githubWebResizeTimer);

  githubWebResizeTimer = window.setTimeout(() => {
    if (githubWebProjects.length) {
      githubWebPageIndex = 0;
      renderGithubWebPage();
    }
  }, 170);
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
  loadGithubWebProjects();
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


/* =========================================================
   CARRUSEL DE PROYECTOS DESTACADOS
   - 2 tarjetas por página en escritorio.
   - 1 tarjeta por página en móvil.
========================================================= */

function ensureFeaturedProjectsStyles() {
  if (document.querySelector("#featured-projects-styles")) return;

  const style = document.createElement("style");
  style.id = "featured-projects-styles";
  style.textContent = `
    /*
      El carrusel destacado replica la lógica visual del carrusel
      de PROYECTOS Y CÓDIGO: panel centrado, controles arriba
      y dos tarjetas por página.
    */
    .featured-projects-toolbar,
    .featured-projects-grid {
      position: relative;
      z-index: 1;
      width: min(1180px, 100%);
      margin-inline: auto;
    }

    .featured-projects-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
      margin-bottom: 22px;
    }

    .featured-projects-toolbar button {
      width: 48px;
      height: 44px;
      border: 1px solid #63ff67;
      background: transparent;
      color: #baff9e;
      font: inherit;
      cursor: pointer;
    }

    .featured-projects-toolbar button:hover:not(:disabled),
    .featured-projects-toolbar button:focus-visible:not(:disabled) {
      background: #63ff67;
      color: #001804;
    }

    .featured-projects-toolbar button:disabled {
      opacity: 0.35;
      cursor: default;
    }

    #featured-projects-page {
      min-width: 58px;
      text-align: center;
      color: #baff9e;
    }

    .featured-projects-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      align-items: stretch;
    }

    /*
      IMPORTANTE: .project-card tiene display:grid en style.css.
      Eso anulaba visualmente el atributo hidden del carrusel.
    */
    .featured-projects-grid .featured-project[hidden] {
      display: none !important;
    }

    /*
      Dentro del carrusel cada destacado se comporta como las
      tarjetas de PROYECTOS Y CÓDIGO: vídeo arriba, contenido abajo.
    */
    .featured-projects-grid .featured-project {
      width: 100%;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      gap: 0;
      overflow: hidden;
      border: 1px solid rgba(124, 255, 114, 0.32);
      background: rgba(1, 10, 4, 0.82);
      box-shadow: inset 0 0 35px rgba(124, 255, 114, 0.025);
    }

    .featured-projects-grid .featured-project .project-screen {
      min-height: 0;
      padding: 10px;
      margin: 0;
      border: 0;
      border-bottom: 1px solid rgba(124, 255, 114, 0.24);
      aspect-ratio: 16 / 9;
    }

    .featured-projects-grid .featured-project .video-frame,
    .featured-projects-grid .featured-project .project-video {
      width: 100%;
      height: 100%;
      min-height: 0;
      aspect-ratio: 16 / 9;
    }

    .featured-projects-grid .featured-project .project-info {
      align-self: stretch;
      padding: clamp(22px, 3vw, 32px);
    }

    .featured-projects-grid .featured-project .project-info h3 {
      margin: 0 0 8px;
      font-size: clamp(1.55rem, 3vw, 2.7rem);
    }

    .featured-projects-grid .featured-project .project-features {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      font-size: 0.9rem;
    }

    @media (max-width: 820px) {
      .featured-projects-grid {
        grid-template-columns: 1fr;
      }

      .featured-projects-toolbar {
        justify-content: space-between;
      }

      .featured-projects-grid .featured-project .project-features {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

function setupFeaturedProjectsCarousel() {
  const grid = document.querySelector("#featured-projects-grid");
  const previousButton = document.querySelector("#featured-projects-prev");
  const nextButton = document.querySelector("#featured-projects-next");
  const pageLabel = document.querySelector("#featured-projects-page");

  if (!grid || !previousButton || !nextButton || !pageLabel) return;

  ensureFeaturedProjectsStyles();

  const cards = Array.from(grid.querySelectorAll(".featured-project"));
  let pageIndex = 0;

  const itemsPerPage = () =>
    window.matchMedia("(max-width: 820px)").matches ? 1 : 2;

  const render = () => {
    const perPage = itemsPerPage();
    const pageCount = Math.max(1, Math.ceil(cards.length / perPage));

    pageIndex = Math.min(pageIndex, pageCount - 1);

    const start = pageIndex * perPage;
    const end = start + perPage;

    cards.forEach((card, index) => {
      card.hidden = index < start || index >= end;
    });

    pageLabel.textContent = `${pageIndex + 1} / ${pageCount}`;
    previousButton.disabled = pageIndex === 0;
    nextButton.disabled = pageIndex >= pageCount - 1;
  };

  previousButton.addEventListener("click", () => {
    if (pageIndex <= 0) return;
    pageIndex -= 1;
    render();
  });

  nextButton.addEventListener("click", () => {
    const pageCount = Math.max(1, Math.ceil(cards.length / itemsPerPage()));
    if (pageIndex >= pageCount - 1) return;
    pageIndex += 1;
    render();
  });

  window.addEventListener("resize", render);
  render();
}

setupFeaturedProjectsCarousel();


/* =========================================================
   DEMOS JUGABLES
   PyDew Valley se ejecuta dentro de la propia tarjeta.
========================================================= */

function ensurePlayableDemoStyles() {
  if (document.querySelector("#playable-demo-styles")) return;

  const style = document.createElement("style");
  style.id = "playable-demo-styles";
  style.textContent = `
    .playable-demos-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
      margin-top: 24px;
    }

    .playable-demo-card {
      max-width: none;
    }

    .playable-demo-cover.inline-game-active {
      position: relative;
      aspect-ratio: 16 / 9;
      min-height: 360px;
      background: #000;
      overflow: hidden;
    }

    .playable-demo-cover .inline-game-frame {
      width: 100%;
      height: 100%;
      min-height: 360px;
      border: 0;
      display: block;
      background: #000;
    }

    .playable-demo-cover .inline-game-toolbar {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 5;
      display: flex;
      gap: 8px;
    }

    .playable-demo-cover.inline-game-expanded {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      aspect-ratio: auto;
      z-index: 100000;
      background: #000;
    }

    .playable-demo-cover.inline-game-expanded .inline-game-frame {
      width: 100%;
      height: 100%;
      min-height: 100vh;
    }

    .playable-demo-cover.inline-game-expanded .inline-game-toolbar {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 100001;
    }

    .playable-demo-cover .inline-game-toolbar button {
      border: 1px solid #63ff67;
      background: rgba(0, 12, 3, 0.92);
      color: #baff9e;
      font: inherit;
      padding: 8px 12px;
      cursor: pointer;
    }

    .playable-demo-cover .inline-game-toolbar button:hover,
    .playable-demo-cover .inline-game-toolbar button:focus-visible {
      background: #63ff67;
      color: #001804;
    }

    @media (max-width: 820px) {
      .playable-demos-grid {
        grid-template-columns: 1fr;
      }

      .playable-demo-cover.inline-game-active,
      .playable-demo-cover .inline-game-frame {
        min-height: 240px;
      }
    }
  `;

  document.head.appendChild(style);
}

function setupPlayableDemos() {
  ensurePlayableDemoStyles();

  document.querySelectorAll("[data-playable-demo]").forEach((card) => {
    const cover = card.querySelector(".playable-demo-cover");
    const image = cover?.querySelector("img");
    const fallback = cover?.querySelector(".github-game-cover-fallback");
    const playButton = card.querySelector("[data-demo-play]");
    const embedUrl = card.dataset.embedUrl;

    if (!cover || !playButton || !embedUrl) return;

    let gameOpen = false;
    let expandedPlaceholder = null;
    let originalParent = null;
    let originalNextSibling = null;

    const restoreCoverToCard = () => {
      cover.classList.remove("inline-game-expanded");

      if (expandedPlaceholder?.parentNode) {
        expandedPlaceholder.parentNode.insertBefore(cover, expandedPlaceholder);
        expandedPlaceholder.remove();
      } else if (originalParent) {
        originalParent.insertBefore(cover, originalNextSibling);
      }

      expandedPlaceholder = null;
      originalParent = null;
      originalNextSibling = null;
      document.body.style.overflow = "";
    };

    const showImage = () => {
      if (cover.classList.contains("inline-game-active")) return;
      if (image) image.hidden = false;
      if (fallback) fallback.hidden = true;
    };

    const showFallback = () => {
      if (cover.classList.contains("inline-game-active")) return;
      if (image) image.hidden = true;
      if (fallback) fallback.hidden = false;
    };

    image?.addEventListener("load", showImage);
    image?.addEventListener("error", showFallback);

    const closeGame = () => {
      restoreCoverToCard();

      cover.querySelector(".inline-game-frame")?.remove();
      cover.querySelector(".inline-game-toolbar")?.remove();
      cover.classList.remove("inline-game-active");

      gameOpen = false;
      playButton.textContent = "JUGAR ONLINE";

      if (image?.naturalWidth > 0) showImage();
      else showFallback();
    };

    playButton.addEventListener("click", () => {
      if (gameOpen) {
        closeGame();
        return;
      }

      gameOpen = true;
      if (image) image.hidden = true;
      if (fallback) fallback.hidden = true;
      cover.classList.add("inline-game-active");
      playButton.textContent = "CERRAR JUEGO";

      const frame = document.createElement("iframe");
      frame.className = "inline-game-frame";
      frame.src = embedUrl;
      frame.title = "Jugar a PyDew Valley";
      frame.loading = "eager";
      frame.allow = "autoplay; fullscreen; gamepad; clipboard-read; clipboard-write";
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      const toolbar = document.createElement("div");
      toolbar.className = "inline-game-toolbar";

      const fullscreenButton = document.createElement("button");
      fullscreenButton.type = "button";
      fullscreenButton.textContent = "PANTALLA COMPLETA";

      fullscreenButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const expanded = cover.classList.contains("inline-game-expanded");

        if (!expanded) {
          originalParent = cover.parentNode;
          originalNextSibling = cover.nextSibling;
          expandedPlaceholder = document.createComment("posición original de la demo");

          originalParent.insertBefore(expandedPlaceholder, cover);
          document.body.appendChild(cover);

          cover.classList.add("inline-game-expanded");
          document.body.style.overflow = "hidden";
          fullscreenButton.textContent = "SALIR DE PANTALLA COMPLETA";
        } else {
          restoreCoverToCard();
          fullscreenButton.textContent = "PANTALLA COMPLETA";
        }
      });

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.textContent = "CERRAR";
      closeButton.addEventListener("click", closeGame);

      toolbar.append(fullscreenButton, closeButton);
      cover.replaceChildren(frame, toolbar);
    });
  });
}

setupPlayableDemos();

