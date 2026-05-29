import { ImageSourcePropType } from "react-native";

export type Background = {
	id: string;
	name?: string;
	price: number;
	image: ImageSourcePropType;
};

export const BACKGROUNDS: Background[] = [
	{ id: "bg_1", price: 50, image: require("../assets/images/backgrounds/background1.png") },
	{ id: "bg_2", price: 50, image: require("../assets/images/backgrounds/background2.png") },
	{ id: "bg_3", price: 50, image: require("../assets/images/backgrounds/background3.png") },
	{ id: "bg_4", price: 50, image: require("../assets/images/backgrounds/background4.png") },
	{ id: "bg_5", price: 50, image: require("../assets/images/backgrounds/background5.png") },
	{ id: "bg_6", price: 50, image: require("../assets/images/backgrounds/background6.png") },
	{ id: "bg_7", price: 50, image: require("../assets/images/backgrounds/background7.png") },
];

export const getBackgroundById = (id: string): Background | undefined => {
	return BACKGROUNDS.find((bg) => bg.id === id);
};
