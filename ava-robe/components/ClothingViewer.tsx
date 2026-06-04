import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getClothingModel } from "../utils/clothingModels";

export type FabricKind = "cotton" | "silk" | "velvet" | "denim";

type ClothingViewerProps = {
	color?: string | null;
	previewMode?: boolean;
	clothingId?: string;
	category?: string;
	modelAsset?: any;
	fabric?: FabricKind | null;
	onLoaded?: () => void;
};

const FABRIC_PROPS: Record<FabricKind, { roughness: number; metalness: number }> = {
	cotton: { roughness: 0.95, metalness: 0.0 },
	silk: { roughness: 0.2, metalness: 0.15 },
	velvet: { roughness: 0.85, metalness: 0.1 },
	denim: { roughness: 0.8, metalness: 0.0 },
};

function fabricMaterialProps(fabric: FabricKind | null | undefined) {
	if (fabric && FABRIC_PROPS[fabric]) return FABRIC_PROPS[fabric];
	return { roughness: 0.7, metalness: 0.0 };
}

const FABRIC_TEXTURE_SIZE = 64;
const fabricTextureCache: Partial<Record<FabricKind, THREE.DataTexture>> = {};

function buildFabricTexture(fabric: FabricKind): THREE.DataTexture {
	const size = FABRIC_TEXTURE_SIZE;
	const data = new Uint8Array(size * size * 4);

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			let v = 220;

			if (fabric === "denim") {
				const diag = (x + y) % 4;
				v = diag < 2 ? 235 : 170;
			} else if (fabric === "velvet") {
				v = 200 - Math.floor(Math.random() * 55);
			} else if (fabric === "silk") {
				v = 225 + Math.floor(Math.sin(y * 0.6) * 25);
			} else if (fabric === "cotton") {
				v = 240 - Math.floor(Math.random() * 18);
			}

			data[i] = v;
			data[i + 1] = v;
			data[i + 2] = v;
			data[i + 3] = 255;
		}
	}

	const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
	tex.wrapS = THREE.RepeatWrapping;
	tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(8, 8);
	tex.magFilter = THREE.LinearFilter;
	tex.minFilter = THREE.LinearMipmapLinearFilter;
	tex.generateMipmaps = true;
	tex.needsUpdate = true;
	return tex;
}

function getFabricTexture(fabric: FabricKind | null | undefined): THREE.DataTexture | null {
	if (!fabric) return null;
	if (!fabricTextureCache[fabric]) {
		fabricTextureCache[fabric] = buildFabricTexture(fabric);
	}
	return fabricTextureCache[fabric] ?? null;
}

export type ClothingViewerHandle = {
	takeSnapshot: () => Promise<string | null>;
};

const ClothingViewer = forwardRef<ClothingViewerHandle, ClothingViewerProps>(({ color, previewMode = false, clothingId = "tshirt", category, modelAsset, fabric, onLoaded }, ref) => {
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

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
		camera.position.set(0, 0, 2);
		cameraRef.current = camera;

		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);
		renderer.setClearColor("#FFFFFF", 1);
		rendererRef.current = renderer;

		scene.add(new THREE.AmbientLight(0xffffff, 2));

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 2, 4);
		scene.add(directionalLight);

		const asset = Asset.fromModule(modelAsset ?? getClothingModel(clothingId));
		await asset.downloadAsync();

		const loader = new GLTFLoader();

		loader.load(
			asset.localUri || asset.uri,
			(gltf: any) => {
				const model = gltf.scene;

				model.scale.set(1, 1, 1);
				const isHairCategory = category === "Hair";

				const isCharacterMaterial = (matName: string): boolean => {
					return /_(SKIN|FACE|EYE|HAIR)(\s|_|\.|$)/i.test(matName);
				};

				model.traverse((child: any) => {
					if (!child.isMesh) return;

					const matName = (Array.isArray(child.material) ? child.material[0]?.name : child.material?.name) || "";

					const isCharPart = isHairCategory ? !/_HAIR(\s|_|\.|$)/i.test(matName) : isCharacterMaterial(matName);

					if (isCharPart) {
						child.visible = false;
						child.userData._isCharacterPart = true;
						return;
					}

					const fp = fabricMaterialProps(fabric);
					const fabricMap = getFabricTexture(fabric);
					child.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(color || "#D9D9D9"),
						roughness: fp.roughness,
						metalness: fp.metalness,
						map: fabricMap,
					});
				});

				scene.add(model);
				modelRef.current = model;
				model.updateMatrixWorld(true);

				const CATEGORY_FRAMING: Record<string, { y: number; size: number }> = {
					"T-shirt": { y: 1.2, size: 0.7 },
					Sweaters: { y: 1.15, size: 0.8 },
					Jackets: { y: 1.15, size: 0.8 },
					Dresses: { y: 0.95, size: 1.3 },
					Pants: { y: 0.5, size: 1.0 },
					Skirts: { y: 0.65, size: 0.8 },
					Shoes: { y: 0.18, size: 0.55 },
					Accessories: { y: 1.3, size: 0.55 },
					Hair: { y: 1.66, size: 0.32 },
				};

				const ITEM_FRAMING: Record<string, { y: number; size: number }> = {};

				const box = new THREE.Box3();
				model.traverse((child: any) => {
					if (!child.isMesh || !child.visible) return;
					if (child.userData._isCharacterPart) return;
					const childBox = new THREE.Box3().setFromObject(child);
					box.union(childBox);
				});

				const isEmpty = box.isEmpty();
				const bboxCenter = isEmpty ? new THREE.Vector3(0, 1, 0) : box.getCenter(new THREE.Vector3());
				const bboxSize = isEmpty ? new THREE.Vector3(0.5, 0.5, 0.5) : box.getSize(new THREE.Vector3());
				const bboxMaxDim = Math.max(bboxSize.x, bboxSize.y, bboxSize.z, 0.001);

				const looksContaminated = bboxSize.x > 0.8 || bboxSize.y > 1.2;
				const itemFraming = (clothingId && ITEM_FRAMING[clothingId]) || null;
				const framing = itemFraming || (category && CATEGORY_FRAMING[category]) || null;

				const forceFraming = category === "Accessories";

				const fovRad = (camera.fov * Math.PI) / 180;
				const zoomFactor = previewMode ? 0.95 : 1.1;

				let aimX = bboxCenter.x;
				let aimY = bboxCenter.y;
				let aimZ = bboxCenter.z;
				let targetSize = bboxMaxDim;

				if ((looksContaminated || isEmpty || forceFraming) && framing) {
					aimX = 0;
					aimY = framing.y;
					aimZ = 0;
					targetSize = framing.size;
				}

				const distance = (targetSize / 2 / Math.tan(fovRad / 2)) * zoomFactor;

				camera.position.set(aimX, aimY, aimZ + distance);
				camera.lookAt(aimX, aimY, aimZ);
				camera.updateProjectionMatrix();

				console.log(
					`[ClothingViewer] ${clothingId} cat=${category} | bboxCenter=(${bboxCenter.x.toFixed(2)},${bboxCenter.y.toFixed(2)},${bboxCenter.z.toFixed(2)}) bboxSize=(${bboxSize.x.toFixed(2)},${bboxSize.y.toFixed(2)},${bboxSize.z.toFixed(2)}) contaminated=${looksContaminated} | aim=(${aimX.toFixed(2)},${aimY.toFixed(2)},${aimZ.toFixed(2)}) targetSize=${targetSize.toFixed(2)} dist=${distance.toFixed(2)}`,
				);

				const renderOnce = () => {
					renderer.render(scene, camera);
					gl.endFrameEXP();
				};

				if (previewMode) {
					renderOnce();
					if (onLoaded) {
						setTimeout(onLoaded, 50);
					}
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

		const fp = fabricMaterialProps(fabric);
		const fabricMap = getFabricTexture(fabric);
		modelRef.current.traverse((child: any) => {
			if (child.isMesh && child.material) {
				child.material.color = new THREE.Color(color || "#D9D9D9");
				child.material.roughness = fp.roughness;
				child.material.metalness = fp.metalness;
				child.material.map = fabricMap;
				child.material.needsUpdate = true;
			}
		});

		if (previewMode && rendererRef.current && sceneRef.current && cameraRef.current && glRef.current) {
			rendererRef.current.render(sceneRef.current, cameraRef.current);
			glRef.current.endFrameEXP();
		}
	}, [color, previewMode, fabric]);

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
