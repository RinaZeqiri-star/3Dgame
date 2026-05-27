import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getClothingModel } from "../utils/clothingModels";

type ClothingViewerProps = {
	color?: string | null;
	previewMode?: boolean;
	clothingId?: string;
};

export type ClothingViewerHandle = {
	takeSnapshot: () => Promise<string | null>;
};

const ClothingViewer = forwardRef<ClothingViewerHandle, ClothingViewerProps>(({ color, previewMode = false, clothingId = "longsleve1" }, ref) => {
	const requestRef = useRef<number | null>(null);
	const modelRef = useRef<THREE.Object3D | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<Renderer | null>(null);
	const glRef = useRef<any>(null);

	useImperativeHandle(ref, () => ({
		takeSnapshot: async () => {
			if (!glRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
				return null;
			}

			rendererRef.current.render(sceneRef.current, cameraRef.current);

			try {
				const snapshot = await GLView.takeSnapshotAsync(glRef.current, { format: "png" });
				const uri = typeof snapshot.uri === "string" ? snapshot.uri : (snapshot.uri as any)?._data?.uri;
				return uri ?? null;
			} catch (error) {
				console.log("Snapshot error:", error);
				return null;
			}
		},
	}));

	const onContextCreate = async (gl: any) => {
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
		glRef.current = gl;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#FFFFFF");
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		camera.position.set(0, 0.3, previewMode ? 1.2 : 1.5);
		cameraRef.current = camera;

		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);
		renderer.setClearColor("#FFFFFF", 1);
		rendererRef.current = renderer;

		scene.add(new THREE.AmbientLight(0xffffff, 2));

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 2, 4);
		scene.add(directionalLight);

		const asset = Asset.fromModule(getClothingModel(clothingId));
		await asset.downloadAsync();

		const loader = new GLTFLoader();

		loader.load(
			asset.localUri || asset.uri,
			(gltf: any) => {
				const model = gltf.scene;

				model.position.set(0, previewMode ? -0.95 : -1, 0);
				model.scale.set(1, 1, 1);

				model.traverse((child: any) => {
					if (child.isMesh) {
						child.material = child.material.clone();
						child.material.color = new THREE.Color(color || "#D9D9D9");
						child.material.needsUpdate = true;
					}
				});

				scene.add(model);
				modelRef.current = model;

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
		if (!modelRef.current) return;

		modelRef.current.traverse((child: any) => {
			if (child.isMesh && child.material) {
				child.material.color = new THREE.Color(color || "#D9D9D9");
				child.material.needsUpdate = true;
			}
		});

		if (previewMode && rendererRef.current && sceneRef.current && cameraRef.current && glRef.current) {
			rendererRef.current.render(sceneRef.current, cameraRef.current);
			glRef.current.endFrameEXP();
		}
	}, [color, previewMode]);

	useEffect(() => {
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}

			if (rendererRef.current) {
				rendererRef.current.dispose();
			}

			if (modelRef.current) {
				modelRef.current.traverse((child: any) => {
					if (child.isMesh) {
						child.geometry?.dispose?.();
						if (Array.isArray(child.material)) {
							child.material.forEach((m: any) => m?.dispose?.());
						} else {
							child.material?.dispose?.();
						}
					}
				});
			}
		};
	}, []);

	return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
});

ClothingViewer.displayName = "ClothingViewer";

export default ClothingViewer;
