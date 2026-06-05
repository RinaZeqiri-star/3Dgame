import { Platform } from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function makePlaceholderTexture(): THREE.Texture {
	const tex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
	tex.needsUpdate = true;
	return tex;
}

function bytesToBase64(bytes: Uint8Array): string {
	const chunkSize = 0x8000;
	let binary = "";
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
		binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
	}
	const enc = (globalThis as any).btoa;
	if (typeof enc !== "function") {
		throw new Error("btoa is not available — cannot encode embedded texture");
	}
	return enc(binary);
}

type Options = {
	decodeTextures?: boolean;
};

export function createSafeGltfLoader(options: Options = {}): GLTFLoader {
	const { decodeTextures = false } = options;
	const loader = new GLTFLoader();

	if (Platform.OS === "web") {
		return loader;
	}

	loader.register((parser: any) => {
		parser.loadImageSource = function (sourceIndex: number, textureLoader: any) {
			if (parser.sourceCache[sourceIndex] !== undefined) {
				return parser.sourceCache[sourceIndex].then((tex: THREE.Texture) => tex.clone());
			}

			const sourceDef = parser.json.images[sourceIndex];

			const promise: Promise<THREE.Texture> = (async () => {
				if (!decodeTextures) {
					const placeholder = makePlaceholderTexture();
					if (sourceDef.name) placeholder.name = sourceDef.name;
					return placeholder;
				}

				try {
					if (sourceDef.bufferView !== undefined) {
						const bufferView: ArrayBuffer = await parser.getDependency("bufferView", sourceDef.bufferView);
						const bytes = new Uint8Array(bufferView);
						const base64 = bytesToBase64(bytes);
						const mimeType = sourceDef.mimeType || "image/png";
						const dataUri = `data:${mimeType};base64,${base64}`;

						const tex = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(dataUri, resolve, undefined, reject);
						});

						if (sourceDef.name) {
							tex.name = sourceDef.name;
						}
						return tex;
					}

					if (typeof sourceDef.uri === "string") {
						const tex = await new Promise<THREE.Texture>((resolve, reject) => {
							textureLoader.load(sourceDef.uri, resolve, undefined, reject);
						});
						if (sourceDef.name) {
							tex.name = sourceDef.name;
						}
						return tex;
					}

					return makePlaceholderTexture();
				} catch (err) {
					console.log("[safeGltfLoader] texture load failed, using placeholder:", err);
					const fallback = makePlaceholderTexture();
					if (sourceDef.name) {
						fallback.name = sourceDef.name;
					}
					return fallback;
				}
			})();

			parser.sourceCache[sourceIndex] = promise;
			return promise;
		};

		return { name: "EXPO_SAFE_TEXTURE_LOADER" };
	});

	return loader;
}
