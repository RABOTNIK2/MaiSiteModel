import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

const init = () => {
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	const scene = new THREE.Scene();
	const canvas = document.querySelector('.canvas');
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	const cameraTop = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 1000);
	cameraTop.position.set(0, 150, 0);
	cameraTop.lookAt(0, 0, -10);
	cameraTop.name = "Nad golovoy";
	scene.add(cameraTop);
	scene.add(camera);

	const controls = new OrbitControls(camera, canvas);
	const controls2 = new OrbitControls(cameraTop, canvas);
	controls.enabled = true;
	controls.enableDamping = true;
	controls2.enabled = true;
	controls2.enableDamping = true;

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(sizes.width, sizes.height);
	renderer.render(scene, camera);

	const firstPerson = new FirstPersonControls(camera, canvas);
	firstPerson.movementSpeed = 7;
	firstPerson.lookSpeed = 0.1;
	firstPerson.enabled = false;

	return { sizes, scene, canvas, camera, renderer, controls, firstPerson, cameraTop, controls2 };
};

export default init;
