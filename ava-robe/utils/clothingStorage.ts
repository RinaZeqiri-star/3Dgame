import AsyncStorage from "@react-native-async-storage/async-storage";

import { shrinkDataUri } from "./imageUtils";

export type SavedClothing = {
	id: string;
	userId: string;
	clothingId: string;
	category: string;
	color: string;
	designImage: string | null;
	designX?: number;
	designY?: number;
	designScale?: number;
	snapshotImage?: string | null;
	fabric: string | null;
	createdAt: string;
	materials?: string;
	madeIn?: string;
	washingInstructions?: string;
	clothingType?: string;
	timesWorn?: number;
	co2Score?: number;
	waterScore?: number;
	co2SavedPct?: number;
	waterSavedPct?: number;
	sustainabilitySource?: "climatiq" | "local";
};

const getUserClothesKey = (userId: string) => {
	return `savedClothes_${userId}`;
};

export async function getSavedClothes(userId: string): Promise<SavedClothing[]> {
	const key = getUserClothesKey(userId);

	const data = await AsyncStorage.getItem(key);

	return data ? JSON.parse(data) : [];
}

const isQuotaError = (err: unknown) => {
	const msg = err instanceof Error ? err.message : String(err);
	return msg.toLowerCase().includes("quota");
};

async function compactExistingClothes(items: SavedClothing[]): Promise<SavedClothing[]> {
	return Promise.all(
		items.map(async (item) => ({
			...item,
			snapshotImage: await shrinkDataUri(item.snapshotImage ?? null, 220),
			designImage: await shrinkDataUri(item.designImage ?? null, 200),
		})),
	);
}

async function persistClothes(key: string, list: SavedClothing[]) {
	try {
		await AsyncStorage.setItem(key, JSON.stringify(list));
	} catch (err) {
		if (!isQuotaError(err)) throw err;

		const compacted = await compactExistingClothes(list);

		try {
			await AsyncStorage.setItem(key, JSON.stringify(compacted));
			return;
		} catch (err2) {
			if (!isQuotaError(err2)) throw err2;

			const trimmed = compacted.slice(0, Math.max(1, Math.floor(compacted.length / 2)));
			await AsyncStorage.setItem(key, JSON.stringify(trimmed));
		}
	}
}

export async function saveClothing(item: SavedClothing) {
	const key = getUserClothesKey(item.userId);

	const current = await getSavedClothes(item.userId);

	const updated = [item, ...current];

	await persistClothes(key, updated);

	return updated;
}

export async function updateClothing(userId: string, itemId: string, updates: Partial<SavedClothing>) {
	const key = getUserClothesKey(userId);

	const current = await getSavedClothes(userId);

	const updated = current.map((item) => (item.id === itemId ? { ...item, ...updates } : item));

	await persistClothes(key, updated);

	return updated;
}

export async function getClothingById(userId: string, itemId: string): Promise<SavedClothing | null> {
	const current = await getSavedClothes(userId);

	return current.find((item) => item.id === itemId) ?? null;
}
