import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

	return { sizes, scene, canvas, camera, renderer, controls, cameraTop, controls2 };
};

export default init;
