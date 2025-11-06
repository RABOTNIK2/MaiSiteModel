import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import init from './init';
import './style.css';

const { sizes, camera, scene, canvas, controls, renderer, firstPerson, cameraTop, controls2} = init();

// ###### Первое лицо, ходилка, бродилка, стрелялка

const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
};

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

class InputController {
	  constructor(target) {
		this.target_ = target || document;
		this.initialize_();    
	  }
	
	  initialize_() {
		this.current_ = {
		  leftButton: false,
		  rightButton: false,
		  mouseXDelta: 0,
		  mouseYDelta: 0,
		  mouseX: 0,
		  mouseY: 0,
		};
		this.previous_ = null;
		this.keys_ = {};
		this.previousKeys_ = {};
		this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
		this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
		this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
		this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
		this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
	  }
	
	  onMouseMove_(e) {
		this.current_.mouseX = e.pageX - window.innerWidth / 2;
		this.current_.mouseY = e.pageY - window.innerHeight / 2;
	
		if (this.previous_ === null) {
		  this.previous_ = {...this.current_};
		}
	
		this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
		this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
	  }
	
	  onMouseDown_(e) {
		this.onMouseMove_(e);
	
		switch (e.button) {
		  case 0: {
			this.current_.leftButton = true;
			break;
		  }
		  case 2: {
			this.current_.rightButton = true;
			break;
		  }
		}
	  }
	
	  onMouseUp_(e) {
		this.onMouseMove_(e);
	
		switch (e.button) {
		  case 0: {
			this.current_.leftButton = false;
			break;
		  }
		  case 2: {
			this.current_.rightButton = false;
			break;
		  }
		}
	  }
	
	  onKeyDown_(e) {
		this.keys_[e.keyCode] = true;
	  }
	
	  onKeyUp_(e) {
		this.keys_[e.keyCode] = false;
	  }
	
	  key(keyCode) {
		return !!this.keys_[keyCode];
	  }
	
	  isReady() {
		return this.previous_ !== null;
	  }
	
	  update(_) {
		if (this.previous_ !== null) {
		  this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
		  this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
	
		  this.previous_ = {...this.current_};
		}
	  }
	};
	
	
	class FirstPersonCamera {
	  constructor(camera, objects) {
		this.camera_ = camera;
		this.input_ = new InputController();
		this.enabled = true;
		this.rotation_ = new THREE.Quaternion();
		this.translation_ = new THREE.Vector3(0, 2, 0);
		this.phi_ = 0;
		this.phiSpeed_ = 8;
		this.theta_ = 0;
		this.thetaSpeed_ = 5;
		this.objects_ = objects;
	}
	
	update(timeElapsedS) {
		if (this.enabled === false) return;
		this.updateRotation_(timeElapsedS);
		this.updateCamera_(timeElapsedS);
		this.updateTranslation_(timeElapsedS);
		this.input_.update(timeElapsedS);
	}
	
	updateCamera_(_) {
		this.camera_.quaternion.copy(this.rotation_);
		this.camera_.position.copy(this.translation_);
	}
	
	updateTranslation_(timeElapsedS) {
		const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
		const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)
	
		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
	
		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(qx);
		forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
	
		const left = new THREE.Vector3(-1, 0, 0);
		left.applyQuaternion(qx);
		left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
	
		this.translation_.add(forward);
		this.translation_.add(left);
	}
	
	  updateRotation_(timeElapsedS) {
		const xh = this.input_.current_.mouseXDelta / window.innerWidth;
		const yh = this.input_.current_.mouseYDelta / window.innerHeight;
	
		this.phi_ += -xh * this.phiSpeed_;
		this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);
	
		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
		const qz = new THREE.Quaternion();
		qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
	
		const q = new THREE.Quaternion();
		q.multiply(qx);
		q.multiply(qz);
	
		this.rotation_.copy(q);
	  }
	}

const firstCamera = new FirstPersonCamera(camera, canvas);
firstCamera.enabled = false;

// ####### Текстуры

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

// ####### Дейтсвия при нажатия маячка

const raycaster = new THREE.Raycaster();

document.addEventListener("click", onMouseDown);

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
		switch (selectedObject.name){
			case "Sign_1":
				camera.position.set(-30.982488353441106, 6.352188176200416, 25.338981436160186);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstCamera.enabled = true;
				break;
			case "Sign_2":
				camera.position.set(-96.46659575400322, 1.9114617191427072, -27.22375479119171);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstCamera.enabled = true;
				break;
			case "Sign_3":
				camera.position.set(-58.95827926384064, 5.367481575718433, 132.06051524714178);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstCamera.enabled = true;
				break;
			case "Sign_4":
				camera.position.set(-98.62646940385528, 4.099032463204855, 73.05998210764218);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstCamera.enabled = true;
				break;
			case "Sign_5":
				camera.position.set(137.6607975409309, 3.686819678386093, 50.258244005958446);
				controls.target.set(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);
				controls.enabled = false;
				firstCamera.enabled = true;
				break;
		};
	};

};

// ######## Обновление кадров ну или тип анимация

const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);
	const delta = clock.getDelta();
	if (isNaN(delta)) return;
	
	if (controls.enabled){
		controls.update();
	}else{
		firstCamera.update(delta);
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