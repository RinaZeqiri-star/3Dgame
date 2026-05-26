export const clothingModels: Record<string, any> = {
	longsleve1: require("../assets/models/longsleve1.glb"),
};

export function getClothingModel(clothingId: string) {
	return clothingModels[clothingId] ?? clothingModels.longsleve1;
}
