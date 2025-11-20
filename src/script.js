import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import init from './init';
import './style.css';

const { sizes, camera, scene, canvas, controls, renderer, cameraTop, controls2} = init();

let camTop = false;

// ###### Первое лицо, ходилка, бродилка, стрелялка

let prevTime = performance.now();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const firstperson = new PointerLockControls( camera, document.body );

firstperson.pointerSpeed = 3.0;

firstperson.addEventListener( 'lock', function () {
	controls.enabled = false;
	camTop = true;
});

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
	}
}

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

// ####### Оси

// const axesHelper = new THREE.AxesHelper(50);
// scene.add(axesHelper);

// ############ SkyBox

let texture = new THREE.TextureLoader().load("/img/scattered-clouds-blue-sky.jpg");

scene.background = texture;

// ########## Опять камера

camera.position.set(-152.31793535300056, 130.8636475957829, 187.9151554310531);

// ######## Пол

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(500, 500),
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

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 5, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

// ######## Загрузка модели

const loader = new GLTFLoader();
loader.load(
	'/models/University/University_V7.gltf',
	(gltf) => {
		console.log("success");
		console.log(gltf);
		const samolet = gltf.scene.getObjectByName("Su-27_Flanker");
		console.log(samolet);
		gltf.scene.scale.set(1, 1, 1);
		gltf.scene.position.set(-50, 0, 0);
		scene.add(gltf.scene);
		
	},
	(progress) => {
		console.log("progress");
		console.log(progress);
	},
	(error) => {
		console.log("error");
		console.log(error);
	}

);

function change_visibility(slon){
	for(let i=1; i<=5; i++){
		let sign = scene.getObjectByName("Sign_"+ `${i}`);
		sign.visible = slon;
	}
}

firstperson.addEventListener( 'unlock', function () {
	change_visibility(true);
	controls.enabled = true;
	camTop = false;
	camera.position.set(-152.31793535300056, 130.8636475957829, 187.9151554310531);
});

// ####### Действия при нажатия маячка

const raycaster = new THREE.Raycaster();

document.addEventListener("mousedown", onMouseDown);

function onMouseDown(event){
	const coords = new THREE.Vector2(
		(event.clientX / renderer.domElement.clientWidth)*2 -1,
		-((event.clientY / renderer.domElement.clientHeight)*2 -1)
	);

	raycaster.setFromCamera(coords, camera);

	const intersection = raycaster.intersectObject(scene, true);

	if (intersection.length > 0 ){
		const selectedObject = intersection[0].object;

		switch (selectedObject.name){
			case "Sign_1":
				camera.position.set(-30.982488353441106, 6, 25.338981436160186);
				firstperson.lock();
				break;
			case "Sign_2":
				camera.position.set(-96.46659575400322, 6, -27.22375479119171);
				firstperson.lock();
				break;
			case "Sign_3":
				camera.position.set(-58.95827926384064, 6, 132.06051524714178);
				firstperson.lock();
				break;
			case "Sign_4":
				camera.position.set(-98.62646940385528, 6, 73.05998210764218);
				firstperson.lock();
				break;
			case "Sign_5":
				camera.position.set(137.6607975409309, 6, 50.258244005958446);
				firstperson.lock();
				break;
		}
	}
}

// ######## Обновление кадров ну или тип анимация

const coords = new THREE.Vector2();
const buildingsraycaster = new THREE.Raycaster();

const collisionRaycaster = new THREE.Raycaster();
const collisionDirections = [
    new THREE.Vector3(1, 0, 0),    
    new THREE.Vector3(-1, 0, 0),   
    new THREE.Vector3(0, 0, 1),    
    new THREE.Vector3(0, 0, -1)    
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

document.addEventListener("mouseover", (event) => {
	coords.x = (event.clientX / renderer.domElement.clientWidth)*2 -1;
	coords.y = -((event.clientY / renderer.domElement.clientHeight)*2 -1);
});



function animate() {
	requestAnimationFrame(animate);

	const time = performance.now();

	if ( firstperson.isLocked === true ) {
		change_visibility(false);

		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta;

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize();

		if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

		const nextPosition = camera.position.clone();

		const moveX = -velocity.x * delta;
		const sideDir = new THREE.Vector3();
		camera.getWorldDirection(sideDir);
		sideDir.cross(camera.up).normalize();

		nextPosition.x += sideDir.x * moveX;
		nextPosition.z += sideDir.z * moveX;

		if (!isCollision(nextPosition)) {
			firstperson.moveRight(moveX);
		}

		const moveZ = -velocity.z * delta;
		const forwardDir = new THREE.Vector3();
		camera.getWorldDirection(forwardDir);
		forwardDir.normalize();

		nextPosition.copy(camera.position);
		nextPosition.x += forwardDir.x * moveZ;
		nextPosition.z += forwardDir.z * moveZ;

		if (!isCollision(nextPosition)) {
			firstperson.moveForward(moveZ);
		}


	}else{
		controls.update();
	}

	prevTime = time;

	renderer.render(scene, camera);
	// if (camTop){
	// 	renderer.clearDepth();

	// 	renderer.setViewport(0, 0, 200, 200);
	// 	renderer.setScissor(0, 0, 200, 200);
	// 	renderer.setScissorTest(true);
	// 	renderer.render(scene, cameraTop);
	// 	renderer.setScissorTest(false);
	// 	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	// }
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