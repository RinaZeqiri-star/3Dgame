export const designStore: {
	savedDesignImage?: string;
} = {};

export function setSavedDesignImage(uri: string) {
	designStore.savedDesignImage = uri;
}

export function clearSavedDesignImage() {
	delete designStore.savedDesignImage;
}
