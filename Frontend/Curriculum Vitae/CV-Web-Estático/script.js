import * as THREE from "https://unpkg.com/three@0.167.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.167.1/examples/jsm/controls/OrbitControls.js?module";

import { GLTFLoader } from "https://unpkg.com/three@0.167.1/examples/jsm/loaders/GLTFLoader.js?module";

const canvas = document.querySelector("#scene");
const focusButton = document.querySelector("#focus-toggle");
const resetButton = document.querySelector("#reset-camera");
const screenUI = document.querySelector("#screen-ui");
const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
const counter = document.querySelector("#section-counter");
const loading = document.querySelector("#loading");
const loadingProgress = document.querySelector("#loading-progress");
const loadingText = document.querySelector("#loading-text");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020503);
scene.fog = new THREE.FogExp2(0x020503, 0.018);

const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0.8, 8.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 4.4;
controls.maxDistance = 13;
controls.target.set(0, 0, 0);

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

let model = null;
let isFocused = false;
let currentSection = 0;
let lastWheelTime = 0;
let touchStartY = null;

const freeCamera = {
  position: new THREE.Vector3(0, 0.8, 8.5),
  target: new THREE.Vector3(0, 0, 0)
};

const focusCamera = {
  // Ajusta estos valores después de ver la orientación real del modelo.
  position: new THREE.Vector3(0, 0.15, 5.0),
  target: new THREE.Vector3(0, 0.1, 0)
};

const loader = new GLTFLoader();
loader.load(
  "./models/PITBOYV1.glb",
  (gltf) => {
    model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.metalness = Math.min(child.material.metalness ?? 0.55, 0.75);
          child.material.roughness = Math.max(child.material.roughness ?? 0.35, 0.26);
        }
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

    // Prueba estos giros si el modelo aparece de lado o del revés.
    model.rotation.set(0, 0, 0);

    scene.add(model);

    loadingProgress.style.width = "100%";
    loadingText.textContent = "Sistema preparado";

    window.setTimeout(() => loading.classList.add("done"), 450);
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

function animateCamera(destinationPosition, destinationTarget, duration = 650) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function update(now) {
    const raw = Math.min((now - startTime) / duration, 1);
    const t = 1 - Math.pow(1 - raw, 3);

    camera.position.lerpVectors(startPosition, destinationPosition, t);
    controls.target.lerpVectors(startTarget, destinationTarget, t);
    controls.update();

    if (raw < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function setFocus(nextState) {
  isFocused = nextState;
  controls.enabled = !isFocused;

  if (isFocused) {
    focusButton.textContent = "LIBERAR PANTALLA";
    screenUI.classList.remove("hidden");
    animateCamera(focusCamera.position, focusCamera.target);
  } else {
    focusButton.textContent = "FIJAR PANTALLA";
    screenUI.classList.add("hidden");
    animateCamera(freeCamera.position, freeCamera.target);
  }
}

function selectSection(index) {
  currentSection = (index + tabs.length) % tabs.length;

  tabs.forEach((tab, tabIndex) => {
    tab.classList.toggle("active", tabIndex === currentSection);
  });

  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle("active", panelIndex === currentSection);
  });

  counter.textContent =
    `${String(currentSection + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;

  if (model) {
    model.userData.kick = 1;
  }
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSection(index));
});

focusButton.addEventListener("click", () => setFocus(!isFocused));

resetButton.addEventListener("click", () => {
  if (model) model.rotation.set(0, 0, 0);

  animateCamera(
    isFocused ? focusCamera.position : freeCamera.position,
    isFocused ? focusCamera.target : freeCamera.target
  );
});

window.addEventListener(
  "wheel",
  (event) => {
    if (!isFocused) return;

    event.preventDefault();

    const now = performance.now();
    if (now - lastWheelTime < 430) return;
    lastWheelTime = now;

    selectSection(currentSection + (event.deltaY > 0 ? 1 : -1));
  },
  { passive: false }
);

window.addEventListener("touchstart", (event) => {
  if (!isFocused) return;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  if (!isFocused || touchStartY === null) return;

  const deltaY = touchStartY - event.changedTouches[0].clientY;
  touchStartY = null;

  if (Math.abs(deltaY) < 40) return;
  selectSection(currentSection + (deltaY > 0 ? 1 : -1));
}, { passive: true });

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);

  const time = clock.getElapsedTime();

  if (model) {
    // Movimiento flotante sutil.
    model.position.y = Math.sin(time * 0.7) * 0.045;

    if (!isFocused) {
      model.rotation.y += 0.0012;
    }

    // Pequeño impulso al cambiar de sección.
    if (model.userData.kick > 0.001) {
      model.rotation.z = Math.sin(model.userData.kick * Math.PI) * 0.025;
      model.userData.kick *= 0.88;
    } else {
      model.rotation.z *= 0.88;
    }
  }

  greenLight.intensity = 20 + Math.sin(time * 2.4) * 1.6;

  controls.update();
  renderer.render(scene, camera);
}

selectSection(0);
render();
