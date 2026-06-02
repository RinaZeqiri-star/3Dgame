import AsyncStorage from "@react-native-async-storage/async-storage";
export type EquippedItem = {
	id: string;
	clothingId: string;
	category: string;
	color: string;
};

const outfitKey = (userId: string) => `currentOutfit_${userId}`;

export async function getOutfit(userId: string): Promise<EquippedItem[]> {
	if (!userId) return [];

	try {
		const raw = await AsyncStorage.getItem(outfitKey(userId));
		if (!raw) return [];

		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed.map((item: any) => ({
			id: String(item?.id ?? ""),
			clothingId: String(item?.clothingId ?? ""),
			category: String(item?.category ?? ""),
			color: typeof item?.color === "string" ? item.color : "#FFFFFF",
		}));
	} catch (err) {
		console.log("getOutfit error:", err);
		return [];
	}
}

export async function setOutfit(userId: string, items: EquippedItem[]): Promise<void> {
	if (!userId) return;

	const minimal: EquippedItem[] = items.map((item) => ({
		id: item.id,
		clothingId: item.clothingId,
		category: item.category,
		color: item.color,
	}));

	try {
		await AsyncStorage.setItem(outfitKey(userId), JSON.stringify(minimal));
	} catch (err) {
		console.log("setOutfit error:", err);
	}
}

export function toggleItemInOutfit(outfit: EquippedItem[], item: EquippedItem): EquippedItem[] {
	const alreadyEquipped = outfit.some((existing) => existing.id === item.id);

	if (alreadyEquipped) {
		return outfit.filter((existing) => existing.id !== item.id);
	}

	const withoutSameCategory = outfit.filter((existing) => existing.category !== item.category);
	return [...withoutSameCategory, item];
}
