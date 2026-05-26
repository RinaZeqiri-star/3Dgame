export const designStore: {
	savedDesignImage?: string;
} = {};

export function setSavedDesignImage(uri: string) {
	designStore.savedDesignImage = uri;
}
