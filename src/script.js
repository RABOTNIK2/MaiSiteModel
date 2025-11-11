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

firstperson.pointerSpeed = 2.0;

firstperson.addEventListener( 'lock', function () {
	console.log("penis");
	controls.enabled = false;
	camTop = true;
});

firstperson.addEventListener( 'unlock', function () {
	console.log("jopa");
	controls.enabled = true;
	camTop = false;
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

};

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

};

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

// controls.target.set(-30, 0, 25);

// controls.enablePan = false; // Отключение движения в пространстве
// controls.enableRotate = false; // Отключение кручения модельки
// controls.enableZoom = false; // Отключение зума(если приблежать то только всю страничку)

// ######## Положение камеры

// console.log(camera.position.x)
// console.log(camera.position.y)
// console.log(camera.position.z)

// function coord() {
//     requestAnimationFrame(animate);
//     const currentCameraX = camera.position.x;
//     const currentCameraY = camera.position.y;
//     const currentCameraZ = camera.position.z;
//     console.log(`Camera Position: X=${currentCameraX}, Y=${currentCameraY}, Z=${currentCameraZ}`);
//     renderer.render(scene, camera);
// }

// coord();

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

let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

const loader = new GLTFLoader();
loader.load(
	'/models/University/University_V3.gltf',
	(gltf) => {
		console.log("success");
		console.log(gltf);
		gltf.scene.scale.set(1, 1, 1);
		gltf.scene.position.set(-50, 0, 0);
		const zdanie1 = gltf.scene.getObjectByName("ГАК");
		cube1BB.setFromObject(zdanie1);
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
		// function change_visibility(){
		// 	for(let i=1; i<=5; i++){
 		// 	let sign = scene.getObjectByName("Sign_"+ `${i}`);
		// 		sign.visible = false;
		// 	};
		// }
		console.log(selectedObject.name);
		switch (selectedObject.name){
			case "Sign_1":
				camera.position.set(-30.982488353441106, 6.352188176200416, 25.338981436160186);
				// controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				firstperson.lock();
				break;
			case "Sign_2":
				camera.position.set(-96.46659575400322, 1.9114617191427072, -27.22375479119171);
				// controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				firstperson.lock();
				break;
			case "Sign_3":
				camera.position.set(-58.95827926384064, 5.367481575718433, 132.06051524714178);
				// controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				firstperson.lock();
				break;
			case "Sign_4":
				camera.position.set(-98.62646940385528, 4.099032463204855, 73.05998210764218);
				// controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				firstperson.lock();
				break;
			case "Sign_5":
				camera.position.set(137.6607975409309, 3.686819678386093, 50.258244005958446);
				// controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				firstperson.lock();
				break;
		}
	}
}

// ######## Обновление кадров ну или тип анимация

const cameraBox = new THREE.Box3();
const boxsize = new THREE.Vector3(2, 2, 2);
const center = new THREE.Vector3();

function animate() {
	requestAnimationFrame(animate);
	const time = performance.now();

	if ( firstperson.isLocked === true ) {

		camera.getWorldPosition(center);

		cameraBox.setFromCenterAndSize(center, boxsize);

		if (cameraBox.intersectsBox(cube1BB)){
			moveForward = false;
		}


		const delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta;

		direction.z = Number( moveForward ) - Number( moveBackward );
		direction.x = Number( moveRight ) - Number( moveLeft );
		direction.normalize();

		if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
		if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

		firstperson.moveRight( - velocity.x * delta );
		firstperson.moveForward( - velocity.z * delta );

	}else{
		controls.update();
	}

	prevTime = time;
	renderer.render(scene, camera);
	if (camTop){
		renderer.clearDepth();

		renderer.setViewport(0, 0, 200, 200);
		renderer.setScissor(0, 0, 200, 200);
		renderer.setScissorTest(true);
		renderer.render(scene, cameraTop);
		renderer.setScissorTest(false);
		renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	}
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