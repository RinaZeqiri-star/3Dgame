import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getAvatarModel } from "../utils/avatarModels";

type PoseMode = "rest" | "aPose";

type AvatarViewerProps = {
	skinColor?: string | null;
	eyeColor?: string | null;
	hairColor?: string | null;
	hasHair?: boolean;
	backgroundColor?: string | null;
	verticalFraming?: number;
	poseMode?: PoseMode;
};

const DEFAULT_SKIN = "#E8C9A7";
const DEFAULT_EYE = "#6F4E37";
const DEFAULT_HAIR = "#2C2118";
const LIP_COLOR = "#F08080";
const LASH_COLOR = "#1C1C1C";
const UNDERWEAR_COLOR = "#141414";

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

const ARM_DROP_RAD = 1.2;

function sideForUpperArmBone(boneName: string): "left" | "right" | null {
	const n = boneName.toLowerCase();

	if (/forearm|lowerarm|lower_arm|hand|finger|thumb/.test(n)) return null;
	if (!/upperarm|upper_arm|(^|[._])arm($|[._])|shoulder|shldr/.test(n)) return null;

	const isLeft = /left|(^|[._])l($|[._])|\.l$/.test(n);
	const isRight = /right|(^|[._])r($|[._])|\.r$/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

function rankArmBone(name: string): number {
	if (/upperarm|upper_arm/i.test(name)) return 3;
	if (/(^|[._])arm($|[._])/i.test(name)) return 2;
	return 1;
}

export default function AvatarViewer({ skinColor, eyeColor, hairColor, hasHair = false, backgroundColor = "#FFFFFF", verticalFraming = 0, poseMode = "rest" }: AvatarViewerProps) {
	const isTransparent = backgroundColor === null;
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
		if (!isTransparent) {
			scene.background = new THREE.Color(backgroundColor as string);
		}
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
		cameraRef.current = camera;

		const renderer = new Renderer({ gl, alpha: isTransparent });
		renderer.setSize(width, height);
		if (isTransparent) {
			renderer.setClearColor(0x000000, 0);
		} else {
			renderer.setClearColor(backgroundColor as string, 1);
		}
		rendererRef.current = renderer;

		scene.add(new THREE.AmbientLight(0xffffff, 1.8));

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
		directionalLight.position.set(2, 4, 3);
		scene.add(directionalLight);

		const bodyAsset = Asset.fromModule(getAvatarModel("body"));
		const hairAsset = Asset.fromModule(getAvatarModel("hair"));
		await Promise.all([bodyAsset.downloadAsync(), hairAsset.downloadAsync()]);

		const loader = new GLTFLoader();
		const loadAsync = (uri: string): Promise<any> => new Promise((resolve, reject) => loader.load(uri, resolve, undefined, reject));

		try {
			const [bodyGltf, hairGltf] = await Promise.all([loadAsync(bodyAsset.localUri || bodyAsset.uri), loadAsync(hairAsset.localUri || hairAsset.uri)]);

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

				if (kind === "lash" || kind === "brow") {
					return;
				}

				if (kind === "underwear") {
					child.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(UNDERWEAR_COLOR),
						roughness: 0.6,
						metalness: 0.0,
					});
					return;
				}

				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(colorForKind(kind, currentSkin, currentEye, currentHair)),
					roughness: 0.65,
					metalness: 0.0,
				});
			});

			hairGltf.scene.traverse((child: any) => {
				if (!child.isMesh) return;
				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(currentHair),
					roughness: 0.65,
					metalness: 0.0,
				});
			});

			console.log("[AvatarViewer] body.glb meshes:\n" + collectedNames.join("\n"));

			if (poseMode === "aPose") {
				const boneNames: string[] = [];
				let leftArmBone: THREE.Object3D | null = null;
				let rightArmBone: THREE.Object3D | null = null;

				bodyGltf.scene.traverse((node: any) => {
					if (!node.isBone) return;
					boneNames.push(node.name);

					const side = sideForUpperArmBone(node.name);
					if (!side) return;

					if (side === "left") {
						if (!leftArmBone || rankArmBone(node.name) > rankArmBone(leftArmBone.name)) {
							leftArmBone = node;
						}
					} else {
						if (!rightArmBone || rankArmBone(node.name) > rankArmBone(rightArmBone.name)) {
							rightArmBone = node;
						}
					}
				});

				if (leftArmBone) (leftArmBone as THREE.Object3D).rotation.z = -ARM_DROP_RAD;
				if (rightArmBone) (rightArmBone as THREE.Object3D).rotation.z = ARM_DROP_RAD;

				const leftName = leftArmBone ? (leftArmBone as THREE.Object3D).name : "(none)";
				const rightName = rightArmBone ? (rightArmBone as THREE.Object3D).name : "(none)";
				console.log("[AvatarViewer] bones:", boneNames);
				console.log("[AvatarViewer] aPose rotation applied — left:", leftName, "right:", rightName);
			}

			const avatarGroup = new THREE.Group();
			avatarGroup.add(bodyGltf.scene);
			avatarGroup.add(hairGltf.scene);
			scene.add(avatarGroup);

			hairGltf.scene.visible = hasHair;

			bodyRef.current = bodyGltf.scene;
			hairRef.current = hairGltf.scene;

			avatarGroup.updateMatrixWorld(true);

			const box = new THREE.Box3().setFromObject(avatarGroup);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());

			const frameDim = Math.max(size.y, size.x * 0.6, size.z * 0.6);

			const lookTarget = new THREE.Vector3(center.x, center.y + size.y * verticalFraming, center.z);

			camera.position.set(center.x, center.y + size.y * verticalFraming, center.z + frameDim * 2.0);
			camera.lookAt(lookTarget);

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

	return <GLView style={{ flex: 1, backgroundColor: isTransparent ? "transparent" : undefined }} onContextCreate={onContextCreate} />;
}
