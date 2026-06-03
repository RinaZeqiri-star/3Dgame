export const createClothingDraft = {
	selectedColor: null as string | null,
	selectedClothingId: "tshirt",
	selectedCategory: "T-shirt",
};

export function resetClothingDraft() {
	createClothingDraft.selectedColor = null;
	createClothingDraft.selectedClothingId = "tshirt";
	createClothingDraft.selectedCategory = "T-shirt";
}
