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

// Mongo documents come back as _id; the rest of the app uses id.
function normalizeClothing(doc: any): SavedClothing {
	const rawId = doc?._id ?? doc?.id;
	const id = typeof rawId === "string" ? rawId : rawId?.toString?.() ?? "";

	return { ...doc, id };
}

// ---------------------------------------------------------------------------
// Lightweight AsyncStorage cache — gives the wardrobe something to render
// instantly on focus and lets the app fall back to the last-known list when
// the server is briefly unreachable. Only used for reads.
// ---------------------------------------------------------------------------

const cacheKey = (userId: string) => `clothesCache_${userId}`;

async function writeCache(userId: string, items: SavedClothing[]): Promise<void> {
	try {
		await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(items));
	} catch {
		// Cache is best-effort — ignore quota errors here.
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

// ---------------------------------------------------------------------------
// Public API — same names as before so screens don't need to change.
// ---------------------------------------------------------------------------

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

	// Refresh the cache so the wardrobe picks it up immediately on next focus.
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
