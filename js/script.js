import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { PointerLockControls } from './PointerLockControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { HDRLoader } from './HDRLoader.js';


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const scene = new THREE.Scene();
const canvas = document.querySelector('.canvas');
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2 - 0.1;
controls.minDistance = 15;
controls.maxDistance = 1000;
controls.enabled = true;
controls.enableDamping = true;
controls.enablePan = true;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

renderer.setSize(sizes.width, sizes.height);

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
new HDRLoader().load('./static/img/qwantani_moon_noon_puresky_1k.hdr', (hdr) => {

    const envMap = pmrem.fromEquirectangular(hdr).texture;

    scene.environment = envMap;
    scene.background = envMap; 

    hdr.dispose();             
    pmrem.dispose();
});

const blocker = document.getElementById("blocker");

let modelLoad = false;

let prevTime = performance.now();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = function ( event ) {
	switch ( event.code ) {
		case 'ArrowUp':
		case 'KeyW':
			moveForward = true;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = true;
			break;
		case 'ArrowDown':
		case 'KeyS':
			moveBackward = true;
			break;
		case 'ArrowRight':
		case 'KeyD':
			moveRight = true;
			break;
		case 'Space':
      		moveUp = true;
      		break;
		case 'ShiftLeft':
		case 'ShiftRight':
			moveDown = true;
			break;
	}
}

const onKeyUp = function ( event ) {
	switch ( event.code ) {
		case 'ArrowUp':
		case 'KeyW':
			moveForward = false;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = false;
			break;
		case 'ArrowDown':
		case 'KeyS':
			moveBackward = false;
			break;

		case 'ArrowRight':
		case 'KeyD':
			moveRight = false;
			break;
		case 'Space':
      		moveUp = false;
      		break;
		case 'ShiftLeft':
		case 'ShiftRight':
			moveDown = false;
			break;
	}
}

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

// ######## Пол

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10000, 10000),
	new THREE.MeshStandardMaterial({
		color: '#808080',
		metalness: 0,
		roughness: 0.5
	})
);

floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.set(-50, -1, 25)
scene.add(floor);

// ######## Свет

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(5, 20, 10);
keyLight.castShadow = true;

scene.add(keyLight); 
const post = new THREE.Vector3();

// ######## Загрузка модели

async function LoadModel() {
	const loader = new GLTFLoader();
	try {
        const data = await loader.loadAsync('./static/models/University/University_V7.gltf');
		data.scene.traverse((obj) => {		
			if (obj.isMesh){
				const m = obj.material;
				m.roughness = 0.7;
				m.metalness = 0.0;
				m.envMapIntensity = 0.2;
				obj.castShadow = true;
				obj.receiveShadow = true;
			}
		});
		const mai = data.scene.getObjectByName("МАИ");
		post.copy(mai.position);
		data.scene.scale.set(3, 3, 3);
        scene.add(data.scene);

        modelLoad = true;
    } catch (error) {
        console.error('error', error);
    }	
}

LoadModel();

camera.position.set(18.173002327215304, 6, 413.22442837708843);


const firstperson = new PointerLockControls( camera, document.body );

firstperson.pointerSpeed = 2.0;

document.addEventListener("click", function () {
	firstperson.lock();
});

firstperson.addEventListener( 'lock', function () {
	controls.enabled = false;
});

firstperson.addEventListener( 'unlock', function () {
	controls.enabled = true;
	controls.state = null;
	firstperson.unlock();
});

// ####### Действия при нажатия маячка

camera.lookAt(65, 50 ,415);
controls.target.set(65, 50, 415);

// ######## Обновление кадров ну или тип анимация

const collisionRaycaster = new THREE.Raycaster();
const collisionDirections = [
    new THREE.Vector3(1, 0, 0),    
    new THREE.Vector3(-1, 0, 0),   
    new THREE.Vector3(0, 0, 1),    
    new THREE.Vector3(0, 0, -1),
	new THREE.Vector3(0, 1, 0),
	new THREE.Vector3(0, -1, 0),
];
const playerRadius = 0.8;

function isCollision(nextPos) {
    for (const dir of collisionDirections) {
        collisionRaycaster.set(nextPos, dir);

        const hits = collisionRaycaster.intersectObjects(scene.children, true);
        if (hits.length > 0 && hits[0].distance < playerRadius) {
            return true;
        }
    }
    return false;
}

const BOUNDS = {
	minX: -1000,
	maxX: 1000,
	minY: 6,
	maxY: 250,
	minZ: -1000,
	maxZ: 1000
};


function animate() {
	requestAnimationFrame(animate);

	if (modelLoad) {
		blocker.style.display = 'none';
		modelLoad = false;
	}

	const time = performance.now();

	if ( firstperson.isLocked === true ) {

		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize();

		if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

		if (moveUp) velocity.y = 50.0; 
  		else if (moveDown) velocity.y = -50.0;
		else velocity.y = 0;

		const nextPosition = camera.position.clone();

		const moveX = -velocity.x * delta;
		const sideDir = new THREE.Vector3();
		camera.getWorldDirection(sideDir);
		sideDir.cross(camera.up).normalize();

		nextPosition.x += sideDir.x * moveX;
		nextPosition.z += sideDir.z * moveX;

		if (!isCollision(nextPosition) && nextPosition.x < BOUNDS.maxX + 1 && nextPosition.x > BOUNDS.minX - 1) {
			firstperson.moveRight(moveX);
		}

		const moveZ = -velocity.z * delta;
		const forwardDir = new THREE.Vector3();
		camera.getWorldDirection(forwardDir);
		forwardDir.normalize();

		nextPosition.copy(camera.position);
		nextPosition.x += forwardDir.x * moveZ;
		nextPosition.z += forwardDir.z * moveZ;

		if (!isCollision(nextPosition) && nextPosition.z < BOUNDS.maxZ + 1 && nextPosition.z > BOUNDS.minZ - 1) {
			firstperson.moveForward(moveZ);
		}

		const moveY = velocity.y * delta;
		nextPosition.copy(camera.position);
		nextPosition.y += moveY;

		if (!isCollision(nextPosition) && nextPosition.y < BOUNDS.maxY + 1 && nextPosition.y > BOUNDS.minY - 1) {
			camera.position.y += moveY;
		}

	}else{
		controls.update();
	}

	prevTime = time;

	renderer.render(scene, camera);

}

animate();

window.addEventListener('resize', () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});