import AsyncStorage from "@react-native-async-storage/async-storage";

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
};

const getUserClothesKey = (userId: string) => {
	return `savedClothes_${userId}`;
};

export async function getSavedClothes(userId: string): Promise<SavedClothing[]> {
	const key = getUserClothesKey(userId);

	const data = await AsyncStorage.getItem(key);

	return data ? JSON.parse(data) : [];
}

export async function saveClothing(item: SavedClothing) {
	const key = getUserClothesKey(item.userId);

	const current = await getSavedClothes(item.userId);

	const updated = [item, ...current];

	await AsyncStorage.setItem(key, JSON.stringify(updated));

	return updated;
}
