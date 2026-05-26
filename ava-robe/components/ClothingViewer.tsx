import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type ClothingViewerProps = {
	color?: string | null;
	previewMode?: boolean;
};

export default function ClothingViewer({ color, previewMode = false }: ClothingViewerProps) {
	const requestRef = useRef<number | null>(null);

	const onContextCreate = async (gl: any) => {
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(previewMode ? "#FFFFFF" : "#EDEDF1");

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		camera.position.set(0, 0, previewMode ? 1.8 : 1.5);

		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);
		renderer.setClearColor(previewMode ? "#FFFFFF" : "#EDEDF1", 1);

		scene.add(new THREE.AmbientLight(0xffffff, 2));

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 2, 4);
		scene.add(directionalLight);

		const asset = Asset.fromModule(require("../assets/models/longsleve1.glb"));
		await asset.downloadAsync();

		const loader = new GLTFLoader();

		loader.load(
			asset.localUri || asset.uri,
			(gltf: any) => {
				const model = gltf.scene;

				model.position.set(0, previewMode ? -0.75 : -1, 0);
				model.scale.set(previewMode ? 0.8 : 1, previewMode ? 0.8 : 1, previewMode ? 0.8 : 1);

				model.traverse((child: any) => {
					if (child.isMesh) {
						child.material = child.material.clone();
						child.material.color = new THREE.Color(color || "#D9D9D9");
						child.material.needsUpdate = true;
					}
				});

				scene.add(model);

				const renderOnce = () => {
					renderer.render(scene, camera);
					gl.endFrameEXP();
				};

				if (previewMode) {
					renderOnce();
					return;
				}

				const animate = () => {
					requestRef.current = requestAnimationFrame(animate);
					renderer.render(scene, camera);
					gl.endFrameEXP();
				};

				animate();
			},
			undefined,
			(error: unknown) => {
				console.log("GLB loading error:", error);
			},
		);
	};

	useEffect(() => {
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, []);

	return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}
