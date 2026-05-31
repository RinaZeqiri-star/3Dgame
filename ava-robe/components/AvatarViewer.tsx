import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getAvatarModel } from "../utils/avatarModels";

type AvatarViewerProps = {
	skinColor?: string | null;
	eyeColor?: string | null;
	hairColor?: string | null;
	hasHair?: boolean;
	backgroundColor?: string;
};

const DEFAULT_SKIN = "#E8C9A7";
const DEFAULT_EYE = "#6F4E37";
const DEFAULT_HAIR = "#2C2118";
const LIP_COLOR = "#F08080";
const LASH_COLOR = "#1C1C1C";

type MeshKind = "iris" | "eyeWhite" | "lash" | "brow" | "lip" | "underwear" | "hair" | "skin";

function classifyByName(lookupString: string): MeshKind {
	const n = lookupString.toLowerCase();

	if (n.includes("camisole") || n.includes("shorts") || n.includes("underwear") || n.includes("panty") || n.includes("onepiece")) {
		return "underwear";
	}

	if (n.includes("eyelash") || n.includes("eyeline")) return "lash";
	if (n.includes("eyebrow") || n.includes("brow")) return "brow";
	if (n.includes("eyewhite") || n.includes("eye_white")) return "eyeWhite";
	if (n.includes("eyeextra") || n.includes("eye_extra") || n.includes("highlight")) return "eyeWhite";
	if (n.includes("iris") || n.includes("pupil")) return "iris";
	if (n.includes("faceeye") || n.includes("face_eye")) return "iris";

	if (n.includes("mouth") || n.includes("lip")) return "lip";
	if (n.includes("hair")) return "hair";

	return "skin";
}

function colorForKind(kind: MeshKind, skinColor: string, eyeColor: string, hairColor: string): string {
	switch (kind) {
		case "iris":
			return eyeColor;
		case "eyeWhite":
			return "#FFFFFF";
		case "lash":
			return LASH_COLOR;
		case "brow":
			return LASH_COLOR;
		case "lip":
			return LIP_COLOR;
		case "hair":
			return hairColor;
		default:
			return skinColor;
	}
}

function disposeObject(node: THREE.Object3D | null) {
	if (!node) return;
	node.traverse((child: any) => {
		if (!child.isMesh) return;
		child.geometry?.dispose?.();
		if (Array.isArray(child.material)) {
			child.material.forEach((m: any) => m?.dispose?.());
		} else {
			child.material?.dispose?.();
		}
	});
}

export default function AvatarViewer({ skinColor, eyeColor, hairColor, hasHair = false, backgroundColor = "#FFFFFF" }: AvatarViewerProps) {
	const requestRef = useRef<number | null>(null);
	const bodyRef = useRef<THREE.Object3D | null>(null);
	const hairRef = useRef<THREE.Object3D | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<Renderer | null>(null);
	const glRef = useRef<any>(null);
	const meshKindsRef = useRef<Map<string, MeshKind>>(new Map());

	const onContextCreate = async (gl: any) => {
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
		glRef.current = gl;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(backgroundColor);
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
		cameraRef.current = camera;

		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);
		renderer.setClearColor(backgroundColor, 1);
		rendererRef.current = renderer;

		scene.add(new THREE.AmbientLight(0xffffff, 1.8));

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
		directionalLight.position.set(2, 4, 3);
		scene.add(directionalLight);

		const bodyAsset = Asset.fromModule(getAvatarModel("body"));
		const hairAsset = Asset.fromModule(getAvatarModel("hair"));
		await Promise.all([bodyAsset.downloadAsync(), hairAsset.downloadAsync()]);

		const loader = new GLTFLoader();
		const loadAsync = (uri: string): Promise<any> =>
			new Promise((resolve, reject) => loader.load(uri, resolve, undefined, reject));

		try {
			const [bodyGltf, hairGltf] = await Promise.all([
				loadAsync(bodyAsset.localUri || bodyAsset.uri),
				loadAsync(hairAsset.localUri || hairAsset.uri),
			]);

			const currentSkin = skinColor || DEFAULT_SKIN;
			const currentEye = eyeColor || DEFAULT_EYE;
			const currentHair = hairColor || DEFAULT_HAIR;
			const collectedNames: string[] = [];

			bodyGltf.scene.traverse((child: any) => {
				if (!child.isMesh) return;

				const meshName = child.name || "";
				const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
				const matName = origMat?.name || "";
				const mapName = origMat?.map?.name || origMat?.map?.source?.uuid || "";

				const lookupString = `${meshName} | ${matName} | ${mapName}`;
				const kind = classifyByName(lookupString);

				collectedNames.push(`mesh="${meshName}" mat="${matName}" map="${mapName}" -> ${kind}`);
				meshKindsRef.current.set(child.uuid, kind);

				if (kind === "underwear") {
					child.visible = false;
					return;
				}

				// Lashes and brows are flat planes whose shape comes from the
				// texture's alpha channel. If we replace the material we lose
				// the alpha and end up with big rectangular black blocks.
				// Keep the original material so transparency stays intact.
				if (kind === "lash" || kind === "brow") {
					return;
				}

				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(colorForKind(kind, currentSkin, currentEye, currentHair)),
					roughness: 0.65,
					metalness: 0.0,
				});
			});

			// Every mesh in hair.glb is hair geometry, so we don't bother
			// classifying — just tint everything with hairColor.
			hairGltf.scene.traverse((child: any) => {
				if (!child.isMesh) return;
				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(currentHair),
					roughness: 0.65,
					metalness: 0.0,
				});
			});

			console.log("[AvatarViewer] body.glb meshes:\n" + collectedNames.join("\n"));

			const avatarGroup = new THREE.Group();
			avatarGroup.add(bodyGltf.scene);
			avatarGroup.add(hairGltf.scene);
			scene.add(avatarGroup);

			// Hair stays in the scene even when hidden so that the camera
			// framing is stable when the user toggles it on/off.
			hairGltf.scene.visible = hasHair;

			bodyRef.current = bodyGltf.scene;
			hairRef.current = hairGltf.scene;

			const box = new THREE.Box3().setFromObject(avatarGroup);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);

			camera.position.set(center.x, center.y, center.z + maxDim * 1.6);
			camera.lookAt(center);

			const animate = () => {
				requestRef.current = requestAnimationFrame(animate);
				renderer.render(scene, camera);
				gl.endFrameEXP();
			};

			animate();
		} catch (error) {
			console.log("Avatar GLB loading error:", error);
		}
	};

	useEffect(() => {
		const currentSkin = skinColor || DEFAULT_SKIN;
		const currentEye = eyeColor || DEFAULT_EYE;
		const currentHair = hairColor || DEFAULT_HAIR;

		if (bodyRef.current) {
			bodyRef.current.traverse((child: any) => {
				if (!child.isMesh || !child.material) return;

				const kind = meshKindsRef.current.get(child.uuid) ?? classifyByName(child.name || "");
				if (kind === "underwear" || kind === "lash" || kind === "brow") return;

				child.material.color = new THREE.Color(colorForKind(kind, currentSkin, currentEye, currentHair));
				child.material.needsUpdate = true;
			});
		}

		if (hairRef.current) {
			hairRef.current.traverse((child: any) => {
				if (!child.isMesh || !child.material) return;
				child.material.color = new THREE.Color(currentHair);
				child.material.needsUpdate = true;
			});
		}
	}, [skinColor, eyeColor, hairColor]);

	useEffect(() => {
		if (!hairRef.current) return;
		hairRef.current.visible = hasHair;
	}, [hasHair]);

	useEffect(() => {
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}

			if (rendererRef.current) {
				rendererRef.current.dispose();
			}

			disposeObject(bodyRef.current);
			disposeObject(hairRef.current);
		};
	}, []);

	return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}
