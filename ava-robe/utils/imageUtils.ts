import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

type ImageFormat = "png" | "jpeg";

export async function persistDataUriAsFile(uri: string | null | undefined, prefix = "design"): Promise<string | null> {
	if (!uri) return null;
	if (Platform.OS === "web") return uri;
	if (!uri.startsWith("data:")) return uri;

	const match = uri.match(/^data:([^;]+);base64,(.*)$/);
	if (!match) return uri;

	const mimeType = match[1];
	const base64 = match[2];
	const ext = mimeType === "image/png" ? "png" : mimeType === "image/jpeg" ? "jpg" : "bin";

	try {
		const atob = (globalThis as any).atob;
		if (typeof atob !== "function") {
			console.log("[persistDataUriAsFile] atob unavailable, returning data URI as-is");
			return uri;
		}
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		const file = new File(Paths.cache, `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}.${ext}`);
		if (file.exists) file.delete();
		file.create();
		file.write(bytes);
		return file.uri;
	} catch (err) {
		console.log("[persistDataUriAsFile] write failed, returning data URI:", err);
		return uri;
	}
}

async function blobUriToDataUri(blobUri: string): Promise<string> {
	const response = await fetch(blobUri);
	const blob = await response.blob();
	return await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export async function shrinkDataUri(uri: string | null | undefined, maxDim = 240, format: ImageFormat = "png", quality = 0.85): Promise<string | null> {
	if (!uri) return null;
	if (Platform.OS !== "web") return uri;

	let workingUri = uri;

	if (workingUri.startsWith("blob:")) {
		try {
			workingUri = await blobUriToDataUri(workingUri);
		} catch (err) {
			console.log("[shrinkDataUri] blob → data conversion failed:", err);
			return uri;
		}
	}

	if (!workingUri.startsWith("data:image")) return workingUri;

	const sourceUri = workingUri;

	return new Promise((resolve) => {
		const img = new (globalThis as any).Image();

		img.onload = () => {
			const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));

			const canvas = (globalThis as any).document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext("2d");

			if (!ctx) {
				resolve(sourceUri);
				return;
			}
			if (format === "jpeg") {
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(0, 0, w, h);
			}

			ctx.drawImage(img, 0, 0, w, h);

			try {
				const mime = format === "jpeg" ? "image/jpeg" : "image/png";
				resolve(canvas.toDataURL(mime, quality));
			} catch {
				resolve(sourceUri);
			}
		};

		img.onerror = () => resolve(sourceUri);
		img.src = sourceUri;
	});
}
