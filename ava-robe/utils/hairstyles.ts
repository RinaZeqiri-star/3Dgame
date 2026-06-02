export type Hairstyle = {
	id: string;
	name: string;
	model: any;
	needsFilter: boolean;
};

export const hairstyles: Record<string, Hairstyle> = {
	default: {
		id: "default",
		name: "Long",
		model: require("../assets/models/hair.glb"),
		needsFilter: false,
	},
	spacebuns: {
		id: "spacebuns",
		name: "Space buns",
		model: require("../assets/models/spacebuns.glb"),
		needsFilter: true,
	},
	bob: {
		id: "bob",
		name: "Bob",
		model: require("../assets/models/hair-bob.glb"),
		needsFilter: true,
	},
	boy: {
		id: "boy",
		name: "Boy hair",
		model: require("../assets/models/hair-boy.glb"),
		needsFilter: true,
	},
	curly: {
		id: "curly",
		name: "Curly",
		model: require("../assets/models/hair-curly.glb"),
		needsFilter: true,
	},
	cutelong: {
		id: "cutelong",
		name: "Cute long",
		model: require("../assets/models/hair-cutelong.glb"),
		needsFilter: true,
	},
	pigtails: {
		id: "pigtails",
		name: "Pigtails",
		model: require("../assets/models/hair-pigtails.glb"),
		needsFilter: true,
	},
	longboy: {
		id: "longboy",
		name: "Long boy",
		model: require("../assets/models/hair-longboy.glb"),
		needsFilter: true,
	},
	shortbraids: {
		id: "shortbraids",
		name: "Short braids",
		model: require("../assets/models/hair-shortbraids.glb"),
		needsFilter: true,
	},
};

export function getHairstyle(id: string | null | undefined): Hairstyle {
	if (!id) return hairstyles.default;
	return hairstyles[id] ?? hairstyles.default;
}

export function getHairstyleList(): Hairstyle[] {
	return Object.values(hairstyles);
}
