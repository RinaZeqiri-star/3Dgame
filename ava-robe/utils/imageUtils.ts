import { Platform } from "react-native";

type ImageFormat = "png" | "jpeg";

export async function shrinkDataUri(uri: string | null | undefined, maxDim = 240, format: ImageFormat = "png", quality = 0.85): Promise<string | null> {
	if (!uri) return null;
	if (Platform.OS !== "web") return uri;
	if (!uri.startsWith("data:image")) return uri;

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
				resolve(uri);
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
				resolve(uri);
			}
		};

		img.onerror = () => resolve(uri);
		img.src = uri;
	});
}
