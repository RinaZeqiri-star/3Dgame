import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer, TextureLoader as ExpoTextureLoader } from "expo-three";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Platform } from "react-native";
import * as THREE from "three";
import { getBody } from "../utils/bodies";
import { getClothingModel } from "../utils/clothingModels";
import { getHairstyle } from "../utils/hairstyles";
import { patchExpoGl } from "../utils/patchExpoGl";
import { createSafeGltfLoader } from "../utils/safeGltfLoader";

import type { EquippedItem } from "../utils/outfitStorage";

type PoseMode = "rest" | "aPose";

export type EquippedClothing = EquippedItem;

export type AvatarViewerHandle = {
	takeSnapshot: () => Promise<string | null>;
};

type AvatarViewerProps = {
	skinColor?: string | null;
	eyeColor?: string | null;
	hairColor?: string | null;
	hasHair?: boolean;
	hairstyleId?: string | null;
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
			return hairColor;
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

type Side = "left" | "right" | null;

function sideForUpperArmBone(boneName: string): Side {
	const n = boneName.toLowerCase();

	if (/forearm|lowerarm|lower_arm|hand|finger|thumb/.test(n)) return null;
	if (!/(upperarm|upper_arm|(?:^|[._])arm(?:$|[._])|shoulder|shldr)/.test(n)) return null;

	const isLeft = /(left|(?:^|[._])l(?:$|[._])|\.l$)/.test(n);
	const isRight = /(right|(?:^|[._])r(?:$|[._])|\.r$)/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

function sideForLowerArmBone(boneName: string): Side {
	const n = boneName.toLowerCase();

	if (!/lowerarm|lower_arm|forearm/.test(n)) return null;

	const isLeft = /(left|(?:^|[._])l(?:$|[._])|\.l$)/.test(n);
	const isRight = /(right|(?:^|[._])r(?:$|[._])|\.r$)/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

function rankArmBone(name: string): number {
	if (/upperarm|upper_arm/i.test(name)) return 3;
	if (/(^|[._])arm($|[._])/i.test(name)) return 2;
	return 1;
}

const HEELS_CLOTHING_IDS = new Set(["heels", "heelboots"]);
const HEEL_TILT_RAD = 0.5;

const SHOE_Y_SCALE = 1.25;

function sideForFootBone(boneName: string): Side {
	const n = boneName.toLowerCase();

	if (!/foot/.test(n) || /toe/.test(n)) return null;

	const isLeft = /(left|(?:^|[._])l(?:$|[._])|\.l$)/.test(n);
	const isRight = /(right|(?:^|[._])r(?:$|[._])|\.r$)/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

function sideForToeBone(boneName: string): Side {
	const n = boneName.toLowerCase();

	if (!/toe/.test(n)) return null;

	const isLeft = /(left|(?:^|[._])l(?:$|[._])|\.l$)/.test(n);
	const isRight = /(right|(?:^|[._])r(?:$|[._])|\.r$)/.test(n);

	if (isLeft && !isRight) return "left";
	if (isRight && !isLeft) return "right";
	return null;
}

const TOE_HIDE_SCALE = 0.01;

const AvatarViewer = forwardRef<AvatarViewerHandle, AvatarViewerProps>(function AvatarViewer(
	{ skinColor, eyeColor, hairColor, hasHair = false, hairstyleId, bodyId, backgroundColor = "#FFFFFF", verticalFraming = 0, poseMode = "rest", outfit = [], spin = false },
	ref,
) {
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

	useImperativeHandle(ref, () => ({
		takeSnapshot: async () => {
			const missing: string[] = [];
			if (!glRef.current) missing.push("gl");
			if (!rendererRef.current) missing.push("renderer");
			if (!sceneRef.current) missing.push("scene");
			if (!cameraRef.current) missing.push("camera");
			if (missing.length > 0) {
				console.log("[AvatarViewer] takeSnapshot — missing refs:", missing.join(", "));
				return null;
			}

			try {
				rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
				const snapshot = await GLView.takeSnapshotAsync(glRef.current, { format: "png" });
				const uri = typeof snapshot.uri === "string" ? snapshot.uri : (snapshot.uri as any)?._data?.uri;
				console.log("[AvatarViewer] takeSnapshot success — uri starts with:", uri?.slice(0, 40));
				return uri ?? null;
			} catch (error) {
				console.log("[AvatarViewer] snapshot error:", error);
				return null;
			}
		},
	}));

	const onContextCreate = async (gl: any) => {
		patchExpoGl(gl);
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
		glRef.current = gl;

		const scene = new THREE.Scene();
		if (!isTransparent && backgroundColor) {
			scene.background = new THREE.Color(backgroundColor);
		}
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
		cameraRef.current = camera;

		const renderer = new Renderer({ gl, alpha: isTransparent });
		renderer.setSize(width, height);
		if (isTransparent) {
			renderer.setClearColor(0x000000, 0);
		} else if (backgroundColor) {
			renderer.setClearColor(backgroundColor, 1);
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

		const loader = createSafeGltfLoader();
		const loadAsync = (uri: string): Promise<any> => new Promise((resolve, reject) => loader.load(uri, resolve, undefined, reject));

		try {
			const [bodyGltf, hairGltf] = await Promise.all([loadAsync(bodyAsset.localUri || bodyAsset.uri), loadAsync(hairAsset.localUri || hairAsset.uri)]);

			if (body.scale && body.scale !== 1) {
				let bodyRootBone: THREE.Bone | null = null;
				bodyGltf.scene.traverse((node: any) => {
					if (!node.isBone) return;
					const parentIsBone = node.parent && (node.parent as any).isBone;
					if (!bodyRootBone && !parentIsBone) {
						bodyRootBone = node;
					}
				});
				if (bodyRootBone) {
					(bodyRootBone as THREE.Bone).scale.setScalar(body.scale);
				}
			}

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

				if (kind === "lash") {
					return;
				}

				if (kind === "underwear") {
					child.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(UNDERWEAR_COLOR),
						roughness: 0.6,
						metalness: 0,
					});
					return;
				}

				const preservedMap = kind === "skin" ? (origMat?.map ?? null) : null;

				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(colorForKind(kind, currentSkin, currentEye, currentHair)),
					map: preservedMap,
					roughness: 0.65,
					metalness: 0,
				});
			});

			const hairMeshDebug: string[] = [];
			const hairMeshesAll: any[] = [];
			const hairMeshesKept: any[] = [];
			const hairMeshesToRemove: any[] = [];

			hairGltf.scene.traverse((child: any) => {
				if (!child.isMesh) return;
				hairMeshesAll.push(child);

				const meshName = child.name || "";
				const matName = (Array.isArray(child.material) ? child.material[0]?.name : child.material?.name) || "";
				const lookup = `${meshName}|${matName}`.toLowerCase();

				if (hairstyle.needsFilter) {
					const isHairMesh = /hair/.test(lookup);
					if (!isHairMesh) {
						hairMeshesToRemove.push(child);
						hairMeshDebug.push(`SKIP mesh="${meshName}" mat="${matName}"`);
						return;
					}
				}

				hairMeshesKept.push(child);
				hairMeshDebug.push(`KEEP mesh="${meshName}" mat="${matName}"`);

				child.material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(currentHair),
					roughness: 0.65,
					metalness: 0,
				});
			});
			if (hairstyle.needsFilter && hairMeshesKept.length === 0 && hairMeshesAll.length > 0) {
				console.log("[AvatarViewer] hair filter would remove every mesh — disabling filter for", hairstyle.id);
				for (const child of hairMeshesAll) {
					child.material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(currentHair),
						roughness: 0.65,
						metalness: 0,
					});
				}
			} else {
				for (const m of hairMeshesToRemove) {
					m.parent?.remove(m);
				}
			}

			console.log(`[AvatarViewer] hairstyle=${hairstyle.id} needsFilter=${hairstyle.needsFilter} totalMeshes=${hairMeshesAll.length} kept=${hairMeshesKept.length}`);
			if (hairMeshDebug.length > 0) {
				console.log("[AvatarViewer] hair mesh decisions:\n" + hairMeshDebug.join("\n"));
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
					} else if (!rightArmBone || rankArmBone(node.name) > rankArmBone(rightArmBone.name)) {
						rightArmBone = node;
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

			const hasHeels = outfit.some((item) => HEELS_CLOTHING_IDS.has(item.clothingId));

			const hasNonSandalShoes = outfit.some((item) => item.category === "Shoes" && item.clothingId !== "sandals");

			if (hasHeels || hasNonSandalShoes) {
				let leftFootBone: THREE.Object3D | null = null;
				let rightFootBone: THREE.Object3D | null = null;
				let leftToeBone: THREE.Object3D | null = null;
				let rightToeBone: THREE.Object3D | null = null;

				bodyGltf.scene.traverse((node: any) => {
					if (!node.isBone) return;
					const footSide = sideForFootBone(node.name);
					if (footSide === "left") leftFootBone = node;
					if (footSide === "right") rightFootBone = node;
					const toeSide = sideForToeBone(node.name);
					if (toeSide === "left") leftToeBone = node;
					if (toeSide === "right") rightToeBone = node;
				});

				if (hasHeels) {
					if (leftFootBone) (leftFootBone as THREE.Object3D).rotation.x = HEEL_TILT_RAD;
					if (rightFootBone) (rightFootBone as THREE.Object3D).rotation.x = HEEL_TILT_RAD;
				}

				if (hasNonSandalShoes) {
					if (leftToeBone) (leftToeBone as THREE.Object3D).scale.setScalar(TOE_HIDE_SCALE);
					if (rightToeBone) (rightToeBone as THREE.Object3D).scale.setScalar(TOE_HIDE_SCALE);
				}

				console.log("[AvatarViewer] shoes detected — hasHeels:", hasHeels, "hasNonSandalShoes:", hasNonSandalShoes);
			}

			const avatarGroup = new THREE.Group();
			avatarGroup.add(bodyGltf.scene);
			avatarGroup.add(hairGltf.scene);
			scene.add(avatarGroup);
			const hasHairItem = outfit.some((item) => item.category === "Hair");
			hairGltf.scene.visible = hasHair && !hasHairItem;
			console.log(`[AvatarViewer] hair visibility — hasHair=${hasHair} hasHairItem=${hasHairItem} -> visible=${hairGltf.scene.visible}`);

			bodyRef.current = bodyGltf.scene;
			hairRef.current = hairGltf.scene;
			avatarGroupRef.current = avatarGroup;
			avatarGroup.updateMatrixWorld(true);

			const box = new THREE.Box3().setFromObject(avatarGroup);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());

			const fovRad = (camera.fov * Math.PI) / 180;
			const aspect = width / height;
			const distForHeight = size.y / 2 / Math.tan(fovRad / 2);
			const distForWidth = size.x / 2 / (Math.tan(fovRad / 2) * aspect);
			const distance = Math.max(distForHeight, distForWidth) * 1.15;

			const lookTarget = new THREE.Vector3(center.x, center.y + size.y * verticalFraming, center.z);

			camera.position.set(center.x, center.y + size.y * verticalFraming, center.z + distance);
			camera.lookAt(lookTarget);

			const bodyBoneMap = new Map<string, THREE.Bone>();
			bodyGltf.scene.traverse((node: any) => {
				if (node.isBone) bodyBoneMap.set(node.name, node);
			});
			console.log(
				"[AvatarViewer] mounted with outfit length:",
				outfit.length,
				"items:",
				outfit.map((it) => `${it.category}/${it.clothingId}`),
			);
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
									metalness: 0,
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

							if (item.category === "Shoes") {
								clothingGltf.scene.traverse((node: any) => {
									if (!node.isMesh || !node.geometry) return;
									node.geometry.scale(1, SHOE_Y_SCALE, 1);
								});
							}

							avatarGroup.add(clothingGltf.scene);
							console.log("[AvatarViewer] loaded clothing", item.clothingId, "meshes:", meshCount, "skipped body parts:", skippedBodyParts, "skinned-bones rebound:", reboundCount);

							if (item.designImage) {
								try {
									const designLoader = Platform.OS === "web" ? new THREE.TextureLoader() : new ExpoTextureLoader();
									const onDesignLoaded = (tex: THREE.Texture) => {
										tex.needsUpdate = true;
										const spriteMat = new THREE.SpriteMaterial({
											map: tex,
											transparent: true,
											depthTest: false,
										});
										const sprite = new THREE.Sprite(spriteMat);

										const cat = item.category;
										let yPos = 1.1;
										if (cat === "Pants") yPos = 0.55;
										else if (cat === "Skirts") yPos = 0.75;
										else if (cat === "Dresses") yPos = 0.9;
										else if (cat === "Shoes") yPos = 0.08;

										const bodyScale = body.scale ?? 1;
										const baseScale = 0.18 * (item.designScale ?? 1);
										sprite.scale.set(baseScale, baseScale, 1);
										sprite.position.set(0, yPos * bodyScale, 0.16);
										sprite.renderOrder = 999;
										avatarGroup.add(sprite);
										console.log("[AvatarViewer] design sprite added for", item.clothingId);
									};
									designLoader.load(item.designImage, onDesignLoaded, undefined, (err: unknown) => {
										console.log("[AvatarViewer] design image failed to load:", err);
									});
								} catch (designErr) {
									console.log("[AvatarViewer] design sprite error:", designErr);
								}
							}
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
				if (kind === "underwear" || kind === "lash") return;

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
});

AvatarViewer.displayName = "AvatarViewer";

export default AvatarViewer;
