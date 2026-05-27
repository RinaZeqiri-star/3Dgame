export const createClothingDraft = {
	selectedColor: null as string | null,
	selectedClothingId: "longsleve1",
	selectedCategory: "T-shirt",
};

export function resetClothingDraft() {
	createClothingDraft.selectedColor = null;
	createClothingDraft.selectedClothingId = "longsleve1";
	createClothingDraft.selectedCategory = "T-shirt";
}
