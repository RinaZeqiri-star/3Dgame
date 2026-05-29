export type SustainabilityInput = {
	materials: string;
	madeIn: string;
	washingInstructions: string;
	clothingType: string;
};

export type SustainabilityResult = {
	co2SavedPct: number;
	waterSavedPct: number;
	source: "climatiq" | "local";
};

const API_BASE_URL = "http://10.2.89.60:5000";

const CLOTHING_WEIGHT_KG: Record<string, number> = {
	tshirt: 0.2,
	"t-shirt": 0.2,
	shirt: 0.25,
	blouse: 0.25,
	top: 0.2,
	sweater: 0.6,
	hoodie: 0.7,
	jumper: 0.6,
	jacket: 1.0,
	coat: 1.4,
	pants: 0.6,
	trousers: 0.6,
	jeans: 0.7,
	skirt: 0.35,
	dress: 0.45,
	shorts: 0.3,
};

const MATERIAL_WATER_L_PER_KG: Record<string, number> = {
	"organic cotton": 8000,
	cotton: 11000,
	polyester: 60,
	nylon: 600,
	acrylic: 200,
	wool: 5000,
	linen: 4000,
	hemp: 2700,
	viscose: 3500,
	rayon: 3500,
	recycled: 500,
};

const MATERIAL_CO2_KG_PER_KG: Record<string, number> = {
	"organic cotton": 2.3,
	cotton: 8.0,
	polyester: 9.5,
	nylon: 11.0,
	acrylic: 9.0,
	wool: 30.0,
	linen: 2.5,
	hemp: 1.5,
	viscose: 6.0,
	rayon: 6.0,
	recycled: 2.0,
};

const inferWeightKg = (clothingType: string) => {
	const t = clothingType.toLowerCase();

	for (const key of Object.keys(CLOTHING_WEIGHT_KG)) {
		if (t.includes(key)) return CLOTHING_WEIGHT_KG[key];
	}

	return 0.4;
};

const detectMaterial = (materials: string) => {
	const m = materials.toLowerCase();

	if (m.includes("organic cotton")) return "organic cotton";
	if (m.includes("recycled")) return "recycled";
	if (m.includes("hemp")) return "hemp";
	if (m.includes("linen")) return "linen";
	if (m.includes("wool")) return "wool";
	if (m.includes("viscose") || m.includes("rayon")) return "viscose";
	if (m.includes("polyester")) return "polyester";
	if (m.includes("nylon")) return "nylon";
	if (m.includes("acrylic")) return "acrylic";
	if (m.includes("cotton")) return "cotton";

	return "cotton";
};

const shippingMultiplier = (madeIn: string) => {
	const m = madeIn.toLowerCase();

	const nearby = ["eu", "europe", "germany", "italy", "portugal", "spain", "france", "netherlands", "belgium", "albania", "kosovo", "turkey"];
	const far = ["china", "bangladesh", "india", "vietnam", "cambodia", "pakistan", "indonesia"];

	if (nearby.some((x) => m.includes(x))) return 0.92;
	if (far.some((x) => m.includes(x))) return 1.12;

	return 1.0;
};

const washingMultiplier = (washing: string) => {
	const w = washing.toLowerCase();

	let mult = 1.0;
	if (w.includes("cold") || w.includes("30") || w.includes("20")) mult -= 0.05;
	if (w.includes("60") || w.includes("hot")) mult += 0.05;
	if (w.includes("90")) mult += 0.08;
	if (w.includes("dry clean")) mult += 0.05;

	return mult;
};

function localFallback(input: SustainabilityInput): SustainabilityResult {
	const weightKg = inferWeightKg(input.clothingType);
	const material = detectMaterial(input.materials);
	const shipMult = shippingMultiplier(input.madeIn);
	const washMult = washingMultiplier(input.washingInstructions);

	const itemCo2 = (MATERIAL_CO2_KG_PER_KG[material] ?? MATERIAL_CO2_KG_PER_KG.cotton) * weightKg * shipMult * washMult;
	const baselineCo2 = MATERIAL_CO2_KG_PER_KG.polyester * weightKg * 1.1;

	const itemWater = (MATERIAL_WATER_L_PER_KG[material] ?? MATERIAL_WATER_L_PER_KG.cotton) * weightKg;
	const baselineWater = MATERIAL_WATER_L_PER_KG.cotton * weightKg * 1.05;

	const co2SavedPct = Math.max(0, Math.min(95, Math.round((1 - itemCo2 / baselineCo2) * 100)));
	const waterSavedPct = Math.max(0, Math.min(95, Math.round((1 - itemWater / baselineWater) * 100)));

	return { co2SavedPct, waterSavedPct, source: "local" };
}

export async function calculateSustainability(input: SustainabilityInput): Promise<SustainabilityResult> {
	try {
		const response = await fetch(`${API_BASE_URL}/sustainability-estimate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			return localFallback(input);
		}

		const data = await response.json();

		return {
			co2SavedPct: data.co2SavedPct,
			waterSavedPct: data.waterSavedPct,
			source: data.source ?? "local",
		};
	} catch (error) {
		console.log("Sustainability fetch error:", error);
		return localFallback(input);
	}
}
