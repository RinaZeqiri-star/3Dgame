export const avatarModels: Record<string, any> = {
	body: require("../assets/models/body.glb"),
	hair: require("../assets/models/hair.glb"),
	tshirt: require("../assets/models/tshirt.glb"),
	longsleve1: require("../assets/models/longsleve1.glb"),
	jeans: require("../assets/models/jeans.glb"),
	shoes: require("../assets/models/shoes.glb"),
};

export function getAvatarModel(id: string) {
	return avatarModels[id];
}
