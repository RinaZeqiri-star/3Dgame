export const clothingModels: Record<string, any> = {
	longsleve1: require("../assets/models/longsleve1.glb"),
	tshirt: require("../assets/models/tshirt.glb"),
	jeans: require("../assets/models/jeans.glb"),
	shoes: require("../assets/models/shoes.glb"),
};

export function getClothingModel(clothingId: string) {
	return clothingModels[clothingId] ?? clothingModels.longsleve1;
}
