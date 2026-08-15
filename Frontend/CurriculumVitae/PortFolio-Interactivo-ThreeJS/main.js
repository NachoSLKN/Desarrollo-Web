import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const width = window.innerWidth;
const height = window.innerHeight;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const canvas = document.getElementById('experience-canvas');

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};


let character = {
  instance: null,
  moveDistance: 3,
  jumpHeight: 1,
  isMoving: false,
  moveDuration: 0.2,
}


const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const frustumSize = 120;
const aspect = sizes.width / sizes.height;

const camera = new THREE.OrthographicCamera(
  -aspect * frustumSize / 2,
  aspect * frustumSize / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  5000
);



const modalContent = {

  "señal": {
    title: "Proyecto Uno",
    content: "Este es el proyecto uno.",
    link: "https://www.youtube.com/watch?v=yhtdkuw9mbM&t=12075s"
  },
  "señal001": {
    title: "Proyecto Dos",
    content: "Este es el proyecto dos.",
    link: "https://www.youtube.com/watch?v=yhtdkuw9mbM&t=12075s"
  },
  "señal002": {
    title: "Proyecto Tres",
    content: "Este es el proyecto tres.",
    link: "https://www.youtube.com/watch?v=yhtdkuw9mbM&t=12075s"
  },
  "señal003": {
    title: "Proyecto Cuatro",
    content: "Este es el proyecto cuatro.",
    link: "https://www.youtube.com/watch?v=yhtdkuw9mbM&t=12075s"
  },
};


const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalVisitProjectButton = document.querySelector(".modal-visit-button");

const modalProjectDescription = document.querySelector(
  ".modal-project-description"
);
const modalExitButton = document.querySelector(
  ".modal-exit-button"
);

function showModal(id) {
  const content = modalContent[id];

  if (content) {
    modalTitle.textContent = content.title;
    modalProjectDescription.textContent = content.content;


    if (content.link) {
      modalVisitProjectButton.href = content.link;
      modalVisitProjectButton.classList.remove("hidden");
    } else {
      modalVisitProjectButton.classList.add("hidden");
    }
    modal.classList.toggle("hidden");
  }
}


function hideModal() {
  modal.classList.toggle("hidden");
}


camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0);

scene.add(camera);

const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(100, 150, 100);
scene.add(sun);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.update();

const intersectObjectsNames = [
  "señal",
  "señal001",
  "señal002",
  "señal003"
];

const intersectObjects = [];
let intersectObject = null;

const loader = new GLTFLoader();

loader.load(
  "./portfolio.glb",
  function (glb) {

    glb.scene.traverse((child) => {

      console.log("Objeto:", child.name);

      // 🔵 PLAYER
      if (child.name === "PLAYER") {
        character.instance = child;
        character.instance.rotation.y = 0;
        console.log("PLAYER encontrado");
      }

      // 🟢 CARTELES INTERACTIVOS
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
        console.log("Cartel interactivo:", child.name);
      }

    });

    scene.add(glb.scene);
  }
);

function onResize() {

  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  const aspect = sizes.width / sizes.height;

  camera.left = -aspect * frustumSize / 2;
  camera.right = aspect * frustumSize / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;

  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerMove(event) {

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


function moveCharacter(targetPosition, targetRotation) {

character.isMoving = true;

const t1 = gsap.timeline({

  onComplete: () => {
    character.isMoving = false;
  },
});




t1.to(character.instance.position, {
  x: targetPosition.x,
 // y: targetPosition.y,
  z: targetPosition.z,
  duration: character.moveDuration,
});

t1.to(character.instance.rotation, {
  
  y: targetRotation,
  duration: character.moveDuration,
},0

);


t1.to(
  character.instance.position,
   {
  
  y: character.instance.position.y + character.jumpHeight,
  duration: character.moveDuration / 2,
  yoyo: true,
  repeat: 1,
},0

);

}


  function onKeyDown(event) {

if (character.isMoving) return;

    const targetPosition = new THREE.Vector3().copy(character.instance.position);
    let targetRotation = 0;


    console.log(event.key);
    switch (event.key.toLowerCase()) {
  case "w":
  case "arrowup":
    targetPosition.z += character.moveDistance;   // adelante (según tu escena)
    targetRotation = 0;
    break;

  case "s":
  case "arrowdown":
    targetPosition.z -= character.moveDistance;   // atrás
    targetRotation = Math.PI;
    break;

  case "a":
  case "arrowleft":
    targetPosition.x -= character.moveDistance;   // izquierda ✅ (ANTES tocabas z)
    targetRotation = Math.PI / 2;
    break;

  case "d":
  case "arrowright":
    targetPosition.x += character.moveDistance;   // derecha ✅ (ANTES tocabas z)
    targetRotation = -Math.PI / 2;
    break;

  default:
    return;
}
    moveCharacter(targetPosition, targetRotation);

  }



  modalExitButton.addEventListener("click", hideModal);
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('keydown', onKeyDown);

  window.addEventListener('click', onClick);

  function onClick() {
    console.log(intersectObject);

    if (intersectObject) {

      showModal(intersectObject);
    }

  }

  function animate() {

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(intersectObjects);

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
      intersectObject = null;
    }

    for (let i = 0; i < intersects.length; i++) {
      intersectObject = intersects[0].object.parent.name;
    }

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);