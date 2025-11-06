import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import init from './init';
import './style.css';

const { sizes, camera, scene, canvas, controls, renderer, firstPerson, cameraTop, controls2} = init();

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

let texture = new THREE.TextureLoader().load("/img/scattered-clouds-blue-sky.jpg");

scene.background = texture;

camera.position.set(-152.31793535300056, 130.8636475957829, 187.9151554310531);


// controls.target.set(-30, 0, 25);

// controls.enablePan = false; // Отключение движения в пространстве
// controls.enableRotate = false; // Отключение кручения модельки
// controls.enableZoom = false; // Отключение зума(если приблежать то только всю страничку)

// ######## Положение камеры

// console.log(camera.position.x)
// console.log(camera.position.y)
// console.log(camera.position.z)

// function animate() {
//     requestAnimationFrame(animate);
//     const currentCameraX = camera.position.x;
//     const currentCameraY = camera.position.y;
//     const currentCameraZ = camera.position.z;
//     console.log(`Camera Position: X=${currentCameraX}, Y=${currentCameraY}, Z=${currentCameraZ}`);
//     renderer.render(scene, camera);
// }

// animate();

// ######## Пол

// const floor = new THREE.Mesh(
// 	new THREE.PlaneGeometry(500, 500),
// 	new THREE.MeshStandardMaterial({
// 		color: '#808080',
// 		metalness: 0,
// 		roughness: 0.5
// 	})
// );

// floor.receiveShadow = true;
// floor.rotation.x = -Math.PI * 0.5;
// floor.position.set(-50, 0, 25)
// scene.add(floor);

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
	'/models/University/University_V3.gltf',
	(gltf) => {
		console.log("success");
		console.log(gltf);
		gltf.scene.scale.set(1, 1, 1);
		gltf.scene.position.set(-50, 0, 0)
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
				camera.position.set(-30.982488353441106, 6.352188176200416, 25.338981436160186);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstPerson.enabled = true;
				break;
			case "Sign_2":
				camera.position.set(-96.46659575400322, 1.9114617191427072, -27.22375479119171);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstPerson.enabled = true;
				break;
			case "Sign_3":
				camera.position.set(-58.95827926384064, 5.367481575718433, 132.06051524714178);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstPerson.enabled = true;
				break;
			case "Sign_4":
				camera.position.set(-98.62646940385528, 4.099032463204855, 73.05998210764218);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstPerson.enabled = true;
				break;
			case "Sign_5":
				camera.position.set(137.6607975409309, 3.686819678386093, 50.258244005958446);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstPerson.enabled = true;
				break;
		};
	};

 		// for(let i=1; i<=5; i++){
 		// 	let sign = scene.getObjectByName("Sign_"+ `${i}`);
			// 	sign.visible = false;
		// };
};

// ######## Обновление кадров ну или тип анимация

// const tick = () => {
// 	if (controls.enabled){
// 		controls.update();
// 	}else{
// 		firstPerson.update();
// 	}
// 	renderer.render(scene, camera);
// 	window.requestAnimationFrame(tick);
// };
// tick();

const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);
	const delta = clock.getDelta();
	if (isNaN(delta)) return;
	
	if (controls.enabled){
		controls.update();
	}else{
		firstPerson.update(delta);
	}
	renderer.render(scene, camera);

	renderer.setViewport(0, 0, 200, 200);
	renderer.setScissor(0, 0, 200, 200);
	renderer.setScissorTest(true);
	renderer.render(scene, cameraTop);
	renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
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