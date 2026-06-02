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
};

export function getHairstyle(id: string | null | undefined): Hairstyle {
	if (!id) return hairstyles.default;
	return hairstyles[id] ?? hairstyles.default;
}

export function getHairstyleList(): Hairstyle[] {
	return Object.values(hairstyles);
}
