export const clothingModels: Record<string, any> = {
	// Original / earlier imports
	longsleve1: require("../assets/models/longsleve1.glb"),
	tshirt: require("../assets/models/tshirt.glb"),
	jeans: require("../assets/models/jeans.glb"),
	shoes: require("../assets/models/shoes.glb"),
	hoodie: require("../assets/models/hoodie.glb"),
	shorts: require("../assets/models/shorts.glb"),
	boots: require("../assets/models/boots.glb"),
	spacebuns: require("../assets/models/spacebuns.glb"),

	// Tops (T-shirt category)
	chemise: require("../assets/models/chemise.glb"),
	"shortsleeve-chemise": require("../assets/models/shortsleeve-chemise.glb"),
	haltertop: require("../assets/models/haltertop.glb"),
	"hawaiian-tshirt": require("../assets/models/hawaiian-tshirt.glb"),
	"off-shoulder-top": require("../assets/models/off-shoulder-top.glb"),
	tanktop: require("../assets/models/tanktop.glb"),
	workouttop: require("../assets/models/workouttop.glb"),

	// Sweaters
	cardigan: require("../assets/models/cardigan.glb"),
	"cropped-sweater": require("../assets/models/cropped-sweater.glb"),
	"long-sweater": require("../assets/models/long-sweater.glb"),
	zipup: require("../assets/models/zipup.glb"),
	"fleece-croptop": require("../assets/models/fleece-croptop.glb"),

	// Jackets
	"cardigan-jacket": require("../assets/models/cardigan.glb"),

	// Dresses
	"casual-dress": require("../assets/models/casual-dress.glb"),
	"cute-dress": require("../assets/models/cute-dress.glb"),
	"fancy-dress": require("../assets/models/fancy-dress.glb"),
	"sleeveless-dress": require("../assets/models/sleeveless-dress.glb"),
	"straps-dress": require("../assets/models/straps-dress.glb"),
	"summer-dress": require("../assets/models/summer-dress.glb"),
	"very-fancy-dress": require("../assets/models/very-fancy-dress.glb"),

	// Pants
	bikershorts: require("../assets/models/bikershorts.glb"),
	"classy-pants": require("../assets/models/classy-pants.glb"),
	"jean-shorts": require("../assets/models/jean-shorts.glb"),
	leggings: require("../assets/models/leggings.glb"),

	// Skirts
	"long-skirt": require("../assets/models/long-skirt.glb"),
	"mini-skirt": require("../assets/models/mini-skirt.glb"),
	"school-skirt": require("../assets/models/school-skirt.glb"),

	// Shoes
	"fancy-shoes": require("../assets/models/fancy-shoes.glb"),
	heelboots: require("../assets/models/heelboots.glb"),
	heels: require("../assets/models/heels.glb"),
	longboots: require("../assets/models/longboots.glb"),
	"over-knee-boots": require("../assets/models/over-knee-boots.glb"),
	sandals: require("../assets/models/sandals.glb"),

	// Accessories
	"little-tie": require("../assets/models/little-tie.glb"),
	"pink-tie": require("../assets/models/pink-tie.glb"),
	necklace: require("../assets/models/necklace.glb"),
	ribbon: require("../assets/models/ribbon.glb"),
	longsocks: require("../assets/models/longsocks.glb"),
};

export function getClothingModel(clothingId: string) {
	return clothingModels[clothingId] ?? clothingModels.longsleve1;
}
