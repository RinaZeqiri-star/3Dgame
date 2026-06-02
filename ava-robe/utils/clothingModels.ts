export const clothingModels: Record<string, any> = {
	longsleve1: require("../assets/models/longsleve1.glb"),
	tshirt: require("../assets/models/tshirt.glb"),
	jeans: require("../assets/models/jeans.glb"),
	shoes: require("../assets/models/shoes.glb"),
	hoodie: require("../assets/models/hoodie.glb"),
	shorts: require("../assets/models/shorts.glb"),
	boots: require("../assets/models/boots.glb"),
	spacebuns: require("../assets/models/spacebuns.glb"),
};

export function getClothingModel(clothingId: string) {
	return clothingModels[clothingId] ?? clothingModels.longsleve1;
}
