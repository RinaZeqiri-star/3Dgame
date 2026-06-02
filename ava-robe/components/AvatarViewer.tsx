import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getAvatarModel } from "../utils/avatarModels";
import { getBody } from "../utils/bodies";
import { getClothingModel } from "../utils/clothingModels";
import { getHairstyle } from "../utils/hairstyles";

import type { EquippedItem } from "../utils/outfitStorage";

type PoseMode = "rest" | "aPose";


export type EquippedClothing = EquippedItem;

type AvatarViewerProps = {
	skinColor?: string | null;
	eyeColor?: string | null;
	hairColor?: string | null;
	hasHair?: boolean;
	hairstyleId?: string | null;
	// Selected body type id from utils/bodies.ts. Defaults to "default".
	bodyId?: string | null;
	backgroundColor?: string | null;
	verticalFraming?: number;
	poseMode?: PoseMode;
	outfit?: EquippedClothing[];
	spin?: boolean;
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


const ARM_DROP_RAD = 0.2; 
const ELBOW_BEND_RAD = 1.1; 

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

function sideForLowerArmBone(boneName: string): "left" | "right" | null {
	const n = boneName.toLowerCase();

	if (!/lowerarm|lower_arm|forearm/.test(n)) return null;

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

// Clothing ids that should trigger a foot tilt so the heels sit on the foot
// correctly (high heels are authored assuming the foot is angled downward).
const HEELS_CLOTHING_IDS = new Set(["heels", "heelboots"]);
const HEEL_TILT_RAD = 0.5; // ~28°

// Tall boots are exported from VRoid as shaft-only meshes — the foot "inside"
// was actually the character's body skin (which our filter strips). With the
// shaft alone, body.glb's bare feet poke out below. Shrink the body's foot
// bones so the foot mesh collapses out of sight inside the boot shaft.
const TALL_BOOTS_CLOTHING_IDS = new Set(["longboots", "over-knee-boots"]);
const FOOT_HIDE_SCALE = 0.05;

// Inflate shoe geometry vertically so the shoe top reaches the leg/ankle
// and the bottom extends a bit lower — closes the gap between the shoe and
// the body's foot/leg that you can otherwise see (especially on heels).
const SHOE_Y_SCALE = 1.25;

function sideForFootBone(boneName: string): "left" | "right" | null {
	const n = boneName.toLowerCase();

	// Match the foot bone but NOT the toe bone (J_Bip_*_ToeBase).
	if (!/foot/.test(n) || /toe/.test(n)) return null;

	const isLeft = /left|(^|[._])l($|[._])|\.l$/.test(n);
	const isRight = /right|(^|[._])r($|[._])|\.r$/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

export default function AvatarViewer({
	skinColor,
	eyeColor,
	hairColor,
	hasHair = false,
	hairstyleId,
	bodyId,
	backgroundColor = "#FFFFFF",
	verticalFraming = 0,
	poseMode = "rest",
	outfit = [],
	spin = false,
}: AvatarViewerProps) {
	const isTransparent = backgroundColor === null;
	const requestRef = useRef<number | null>(null);
	const bodyRef = useRef<THREE.Object3D | null>(null);
	const hairRef = useRef<THREE.Object3D | null>(null);
	const avatarGroupRef = useRef<THREE.Group | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<Renderer | null>(null);
	const glRef = useRef<any>(null);
	const meshKindsRef = useRef<Map<string, MeshKind>>(new Map());
	const spinRef = useRef<boolean>(spin);
	spinRef.current = spin;

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

		const hairstyle = getHairstyle(hairstyleId);
		const body = getBody(bodyId);

		const bodyAsset = Asset.fromModule(body.model);
		const hairAsset = Asset.fromModule(hairstyle.model);
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

		
			const hairMeshesToRemove: any[] = [];
			hairGltf.scene.traverse((child: any) => {
				if (!child.isMesh) return;

				if (hairstyle.needsFilter) {
					const matName = (Array.isArray(child.material) ? child.material[0]?.name : child.material?.name) || "";
					const isHairMesh = /_HAIR(\s|$)/i.test(matName);
					if (!isHairMesh) {
						hairMeshesToRemove.push(child);
						return;
					}
				}

				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(currentHair),
					roughness: 0.65,
					metalness: 0.0,
				});
			});

			for (const m of hairMeshesToRemove) {
				m.parent?.remove(m);
			}

			console.log("[AvatarViewer] body.glb meshes:\n" + collectedNames.join("\n"));

			if (poseMode === "aPose") {
				const boneNames: string[] = [];
				let leftArmBone: THREE.Object3D | null = null;
				let rightArmBone: THREE.Object3D | null = null;
				let leftLowerArmBone: THREE.Object3D | null = null;
				let rightLowerArmBone: THREE.Object3D | null = null;

				bodyGltf.scene.traverse((node: any) => {
					if (!node.isBone) return;
					boneNames.push(node.name);

					const lowerSide = sideForLowerArmBone(node.name);
					if (lowerSide === "left") {
						leftLowerArmBone = node;
						return;
					}
					if (lowerSide === "right") {
						rightLowerArmBone = node;
						return;
					}

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

				
				if (leftLowerArmBone) (leftLowerArmBone as THREE.Object3D).rotation.x = ELBOW_BEND_RAD;
				if (rightLowerArmBone) (rightLowerArmBone as THREE.Object3D).rotation.x = ELBOW_BEND_RAD;

				const leftUpperName = leftArmBone ? (leftArmBone as THREE.Object3D).name : "(none)";
				const rightUpperName = rightArmBone ? (rightArmBone as THREE.Object3D).name : "(none)";
				const leftLowerName = leftLowerArmBone ? (leftLowerArmBone as THREE.Object3D).name : "(none)";
				const rightLowerName = rightLowerArmBone ? (rightLowerArmBone as THREE.Object3D).name : "(none)";
				console.log("[AvatarViewer] bones:", boneNames);
				console.log("[AvatarViewer] aPose applied — upper L:", leftUpperName, "R:", rightUpperName, "lower L:", leftLowerName, "R:", rightLowerName);
			}

			// Heels in VRoid are authored assuming the foot is tilted downward.
			// When we rebind the shoe skinning to the body's neutral foot bone,
			// the heel ends up sticking out at the wrong angle. If any equipped
			// shoe is a heels type, tilt the foot bones to match the shoe's
			// authored angle.
			const hasHeels = outfit.some((item) => HEELS_CLOTHING_IDS.has(item.clothingId));
			const hasTallBoots = outfit.some((item) => TALL_BOOTS_CLOTHING_IDS.has(item.clothingId));

			if (hasHeels || hasTallBoots) {
				let leftFootBone: THREE.Object3D | null = null;
				let rightFootBone: THREE.Object3D | null = null;

				bodyGltf.scene.traverse((node: any) => {
					if (!node.isBone) return;
					const side = sideForFootBone(node.name);
					if (side === "left") leftFootBone = node;
					if (side === "right") rightFootBone = node;
				});

				if (hasHeels) {
					if (leftFootBone) (leftFootBone as THREE.Object3D).rotation.x = HEEL_TILT_RAD;
					if (rightFootBone) (rightFootBone as THREE.Object3D).rotation.x = HEEL_TILT_RAD;
					console.log("[AvatarViewer] heels — feet tilted");
				}

				if (hasTallBoots) {
					if (leftFootBone) (leftFootBone as THREE.Object3D).scale.setScalar(FOOT_HIDE_SCALE);
					if (rightFootBone) (rightFootBone as THREE.Object3D).scale.setScalar(FOOT_HIDE_SCALE);
					console.log("[AvatarViewer] tall boots — body feet hidden");
				}
			}

			const avatarGroup = new THREE.Group();
			avatarGroup.add(bodyGltf.scene);
			avatarGroup.add(hairGltf.scene);
			scene.add(avatarGroup);
			const hasHairItem = outfit.some((item) => item.category === "Hair");
			hairGltf.scene.visible = hasHair && !hasHairItem;

			bodyRef.current = bodyGltf.scene;
			hairRef.current = hairGltf.scene;
			avatarGroupRef.current = avatarGroup;
			avatarGroup.updateMatrixWorld(true);

			const box = new THREE.Box3().setFromObject(avatarGroup);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());

			const frameDim = Math.max(size.y, size.x * 0.6, size.z * 0.6);

			const lookTarget = new THREE.Vector3(center.x, center.y + size.y * verticalFraming, center.z);

			camera.position.set(center.x, center.y + size.y * verticalFraming, center.z + frameDim * 2.0);
			camera.lookAt(lookTarget);

			
			const bodyBoneMap = new Map<string, THREE.Bone>();
			bodyGltf.scene.traverse((node: any) => {
				if (node.isBone) bodyBoneMap.set(node.name, node);
			});
			if (outfit.length > 0) {
				await Promise.all(
					outfit.map(async (item) => {
						try {
							const clothingAsset = Asset.fromModule(getClothingModel(item.clothingId));
							await clothingAsset.downloadAsync();
							const clothingGltf = await loadAsync(clothingAsset.localUri || clothingAsset.uri);

							const colorHex = typeof item.color === "string" && item.color.length > 0 ? item.color : "#FFFFFF";

							let meshCount = 0;
							let reboundCount = 0;
							let skippedBodyParts = 0;
							const skinnedToRebind: any[] = [];
							const meshesToRemove: any[] = [];

							const isHairCategory = item.category === "Hair";
							const shouldSkipMesh = (matName: string): boolean => {
								if (isHairCategory) {
									return !/_HAIR(\s|$)/i.test(matName);
								}
								return /_(SKIN|FACE|EYE|HAIR)(\s|$)/i.test(matName);
							};

							clothingGltf.scene.traverse((node: any) => {
								if (!node.isMesh) return;
								if (!node.geometry) return;

								const meshName = node.name || "";
								const matName = (Array.isArray(node.material) ? node.material[0]?.name : node.material?.name) || "";

								const isCharacterPart = shouldSkipMesh(matName);

								console.log(`[AvatarViewer]   ${item.clothingId} (${item.category}) mesh "${meshName}" mat "${matName}" -> ${isCharacterPart ? "SKIP" : "KEEP"}`);

								if (isCharacterPart) {
									meshesToRemove.push(node);
									skippedBodyParts += 1;
									return;
								}

								if (!node.geometry.attributes.normal) {
									node.geometry.computeVertexNormals();
								}

								node.material = new THREE.MeshStandardMaterial({
									color: new THREE.Color(colorHex),
									roughness: 0.7,
									metalness: 0.0,
								});

								meshCount += 1;

								if (node.isSkinnedMesh && node.skeleton) {
									skinnedToRebind.push(node);
								}
							});

							
							for (const m of meshesToRemove) {
								m.parent?.remove(m);
							}

							
							for (const skinnedMesh of skinnedToRebind) {
								const originalBones: any[] = skinnedMesh.skeleton.bones;
								const remapped: THREE.Bone[] = originalBones.map((bone) => {
									const match = bodyBoneMap.get(bone.name);
									if (match) reboundCount += 1;
									return match ?? bone;
								});

								const newSkeleton = new THREE.Skeleton(remapped, skinnedMesh.skeleton.boneInverses);
								skinnedMesh.bind(newSkeleton, skinnedMesh.bindMatrix);
							}

							// Shoes-category items get a vertical scale-up so the shoe
							// top reaches the leg/ankle (closes the visible gap that
							// otherwise appears between the body and the shoe).
							if (item.category === "Shoes") {
								clothingGltf.scene.traverse((node: any) => {
									if (!node.isMesh || !node.geometry) return;
									node.geometry.scale(1, SHOE_Y_SCALE, 1);
								});
							}

							avatarGroup.add(clothingGltf.scene);
							console.log("[AvatarViewer] loaded clothing", item.clothingId, "meshes:", meshCount, "skipped body parts:", skippedBodyParts, "skinned-bones rebound:", reboundCount);
						} catch (clothingError) {
							console.log("[AvatarViewer] clothing load failed for", item.clothingId, clothingError);
						}
					}),
				);
			}

			let loggedRenderError = false;
			const animate = () => {
				requestRef.current = requestAnimationFrame(animate);

				
				if (spinRef.current && avatarGroupRef.current) {
					avatarGroupRef.current.rotation.y += 0.01;
				}

				try {
					renderer.render(scene, camera);
					gl.endFrameEXP();
				} catch (renderError) {
					if (!loggedRenderError) {
						loggedRenderError = true;
						console.log("[AvatarViewer] render error (silencing further):", renderError);
					}
				}
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
