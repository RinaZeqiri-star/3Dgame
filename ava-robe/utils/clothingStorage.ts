import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.129.8:5000";

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

export type NewClothing = Omit<SavedClothing, "id">;

function normalizeClothing(doc: any): SavedClothing {
	const rawId = doc?._id ?? doc?.id;
	const id = typeof rawId === "string" ? rawId : (rawId?.toString?.() ?? "");

	return { ...doc, id };
}

const cacheKey = (userId: string) => `clothesCache_${userId}`;

async function writeCache(userId: string, items: SavedClothing[]): Promise<void> {
	const lean = items.map((it) => ({
		id: it.id,
		userId: it.userId,
		clothingId: it.clothingId,
		category: it.category,
		color: it.color,
		fabric: it.fabric,
		createdAt: it.createdAt,
		timesWorn: it.timesWorn,
		co2SavedPct: it.co2SavedPct,
		waterSavedPct: it.waterSavedPct,
	}));

	const payload = JSON.stringify(lean);

	try {
		await AsyncStorage.setItem(cacheKey(userId), payload);
	} catch (err) {
		console.log("writeCache error (likely over quota) — wiping ALL clothes caches and retrying:", err);

		try {
			const allKeys = await AsyncStorage.getAllKeys();
			const cacheKeys = allKeys.filter((k) => k.startsWith("clothesCache_"));
			if (cacheKeys.length > 0) {
				await AsyncStorage.multiRemove(cacheKeys);
			}
			await AsyncStorage.setItem(cacheKey(userId), payload);
		} catch (retryErr) {
			console.log("writeCache retry failed — giving up on cache:", retryErr);
		}
	}
}

async function readCache(userId: string): Promise<SavedClothing[]> {
	try {
		const data = await AsyncStorage.getItem(cacheKey(userId));
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export async function getSavedClothes(userId: string): Promise<SavedClothing[]> {
	if (!userId) return [];

	try {
		const response = await fetch(`${API_URL}/clothes?userId=${encodeURIComponent(userId)}`);

		if (!response.ok) {
			return readCache(userId);
		}

		const data = await response.json();
		const clothes: SavedClothing[] = (data.clothes ?? []).map(normalizeClothing);

		await writeCache(userId, clothes);
		return clothes;
	} catch (err) {
		console.log("getSavedClothes network error — falling back to cache:", err);
		return readCache(userId);
	}
}

export async function saveClothing(item: NewClothing): Promise<SavedClothing> {
	const response = await fetch(`${API_URL}/clothes`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error ?? "Could not save clothing");
	}

	const data = await response.json();
	const saved = normalizeClothing(data.clothing);
	const all = await getSavedClothes(item.userId).catch(() => [] as SavedClothing[]);
	await writeCache(item.userId, all.length ? all : [saved]);

	return saved;
}

export async function updateClothing(userId: string, itemId: string, updates: Partial<SavedClothing>): Promise<SavedClothing> {
	const response = await fetch(`${API_URL}/clothes/${itemId}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updates),
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error ?? "Could not update clothing");
	}

	const data = await response.json();
	const updated = normalizeClothing(data.clothing);

	const all = await getSavedClothes(userId).catch(() => [] as SavedClothing[]);
	await writeCache(userId, all);

	return updated;
}

export async function incrementTimesWorn(userId: string, itemIds: string[]): Promise<void> {
	if (!userId || itemIds.length === 0) return;

	const all = await getSavedClothes(userId).catch(() => [] as SavedClothing[]);
	const byId = new Map(all.map((c) => [c.id, c]));
	const updatedList: SavedClothing[] = [...all];

	await Promise.all(
		itemIds.map(async (id) => {
			const current = byId.get(id);
			if (!current) return;

			const nextCount = (current.timesWorn ?? 0) + 1;

			try {
				const response = await fetch(`${API_URL}/clothes/${id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ timesWorn: nextCount }),
				});

				if (response.ok) {
					const data = await response.json();
					const idx = updatedList.findIndex((c) => c.id === id);
					if (idx !== -1 && data?.clothing) {
						updatedList[idx] = normalizeClothing(data.clothing);
					}
				}
			} catch (err) {
				console.log("incrementTimesWorn error for", id, err);
				const idx = updatedList.findIndex((c) => c.id === id);
				if (idx !== -1) {
					updatedList[idx] = { ...updatedList[idx], timesWorn: nextCount };
				}
			}
		}),
	);

	await writeCache(userId, updatedList);
}

export async function getClothingById(userId: string, itemId: string): Promise<SavedClothing | null> {
	try {
		const response = await fetch(`${API_URL}/clothes/${itemId}`);

		if (!response.ok) {
			const cached = await readCache(userId);
			return cached.find((c) => c.id === itemId) ?? null;
		}

		const data = await response.json();
		return data.clothing ? normalizeClothing(data.clothing) : null;
	} catch (err) {
		console.log("getClothingById network error — falling back to cache:", err);
		const cached = await readCache(userId);
		return cached.find((c) => c.id === itemId) ?? null;
	}
}

export async function deleteClothing(userId: string, itemId: string): Promise<void> {
	const response = await fetch(`${API_URL}/clothes/${itemId}`, {
		method: "DELETE",
	});

	if (!response.ok && response.status !== 404) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error ?? "Could not delete clothing");
	}

	const all = await getSavedClothes(userId).catch(() => [] as SavedClothing[]);
	await writeCache(userId, all);
}
