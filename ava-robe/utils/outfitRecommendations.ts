import { SavedClothing } from "./clothingStorage";
import { EquippedItem } from "./outfitStorage";

const TOP_CATEGORIES = ["T-shirt", "Sweaters", "Jackets"];
const BOTTOM_CATEGORIES = ["Pants", "Skirts"];

export type OutfitSuggestion = {
	items: SavedClothing[];
	missing: string[];
};

export function clothingToEquipped(item: SavedClothing): EquippedItem {
	return {
		id: item.id,
		clothingId: item.clothingId,
		category: item.category,
		color: item.color,
	};
}

function sortByLeastWorn(items: SavedClothing[]): SavedClothing[] {
	return [...items].sort((a, b) => (a.timesWorn ?? 0) - (b.timesWorn ?? 0));
}

function pickWeightedLeastWorn(pool: SavedClothing[], excludeIds: Set<string>): SavedClothing | null {
	const available = pool.filter((it) => !excludeIds.has(it.id));
	if (available.length === 0) return null;

	const sorted = sortByLeastWorn(available);
	const sampleSize = Math.min(sorted.length, Math.max(3, Math.ceil(sorted.length / 2)));
	const candidates = sorted.slice(0, sampleSize);
	return candidates[Math.floor(Math.random() * candidates.length)];
}

function outfitKey(items: SavedClothing[]): string {
	return items
		.map((it) => it.id)
		.sort()
		.join("|");
}

function groupByCategory(all: SavedClothing[]): Record<string, SavedClothing[]> {
	const grouped: Record<string, SavedClothing[]> = {};
	for (const item of all) {
		if (!grouped[item.category]) grouped[item.category] = [];
		grouped[item.category].push(item);
	}
	return grouped;
}

export function generateOutfitSuggestions(anchor: SavedClothing, allClothes: SavedClothing[], count = 5): OutfitSuggestion[] {
	const byCategory = groupByCategory(allClothes);

	const pantsPool = byCategory["Pants"] ?? [];
	const skirtsPool = byCategory["Skirts"] ?? [];
	const dressesPool = byCategory["Dresses"] ?? [];
	const shoesPool = byCategory["Shoes"] ?? [];
	const accessoriesPool = byCategory["Accessories"] ?? [];
	const topsPool = TOP_CATEGORIES.flatMap((cat) => byCategory[cat] ?? []);

	const isTopCategory = (c: string) => TOP_CATEGORIES.includes(c);
	const isBottomCategory = (c: string) => BOTTOM_CATEGORIES.includes(c);

	const pickBottomPool = (): SavedClothing[] => {
		const options: SavedClothing[][] = [];
		if (pantsPool.length) options.push(pantsPool);
		if (skirtsPool.length) options.push(skirtsPool);
		if (options.length === 0) return [];
		return options[Math.floor(Math.random() * options.length)];
	};

	const seen = new Set<string>();
	const outfits: OutfitSuggestion[] = [];
	const maxAttempts = count * 25;
	let attempts = 0;

	while (outfits.length < count && attempts < maxAttempts) {
		attempts++;

		const items: SavedClothing[] = [anchor];
		const used = new Set<string>([anchor.id]);
		const missing: string[] = [];

		const addFromPool = (pool: SavedClothing[], label: string) => {
			const picked = pickWeightedLeastWorn(pool, used);
			if (picked) {
				items.push(picked);
				used.add(picked.id);
				return true;
			}
			missing.push(label);
			return false;
		};

		const buildSeparates = () => {
			if (topsPool.length === 0) missing.push("Top");
			else addFromPool(topsPool, "Top");

			const bottomPool = pickBottomPool();
			if (bottomPool.length === 0) missing.push("Pants or Skirt");
			else addFromPool(bottomPool, "Bottom");
		};

		if (anchor.category === "Dresses") {
			addFromPool(shoesPool, "Shoes");
		} else if (isTopCategory(anchor.category)) {
			const bottomPool = pickBottomPool();
			if (bottomPool.length === 0) missing.push("Pants or Skirt");
			else addFromPool(bottomPool, "Bottom");
			addFromPool(shoesPool, "Shoes");
		} else if (isBottomCategory(anchor.category)) {
			if (topsPool.length === 0) missing.push("Top");
			else addFromPool(topsPool, "Top");
			addFromPool(shoesPool, "Shoes");
		} else if (anchor.category === "Shoes") {
			const canDress = dressesPool.length > 0;
			const canSeparates = topsPool.length > 0 && (pantsPool.length > 0 || skirtsPool.length > 0);

			let useDress: boolean;
			if (canDress && canSeparates) {
				useDress = Math.random() < 0.5;
			} else {
				useDress = canDress;
			}

			if (useDress) {
				addFromPool(dressesPool, "Dress");
			} else if (canSeparates) {
				buildSeparates();
			} else {
				missing.push("Dress or Top + Bottom");
			}
		} else if (anchor.category === "Accessories") {
			const canDress = dressesPool.length > 0;
			const canSeparates = topsPool.length > 0 && (pantsPool.length > 0 || skirtsPool.length > 0);

			let useDress: boolean;
			if (canDress && canSeparates) {
				useDress = Math.random() < 0.5;
			} else {
				useDress = canDress;
			}

			if (useDress) {
				addFromPool(dressesPool, "Dress");
			} else if (canSeparates) {
				buildSeparates();
			} else {
				missing.push("Dress or Top + Bottom");
			}
			addFromPool(shoesPool, "Shoes");
		}

		if (anchor.category !== "Accessories" && accessoriesPool.length > 0 && Math.random() < 0.5) {
			addFromPool(accessoriesPool, "Accessory");
		}

		const key = outfitKey(items);
		if (!seen.has(key)) {
			seen.add(key);
			outfits.push({ items, missing });
		}
	}

	return outfits;
}
