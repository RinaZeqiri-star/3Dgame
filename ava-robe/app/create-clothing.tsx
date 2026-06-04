import { saveClothing as saveClothingToStorage } from "@/utils/clothingStorage";
import { createClothingDraft } from "@/utils/createClothingDraft";
import { shrinkDataUri } from "@/utils/imageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import ClothingViewer, { ClothingViewerHandle, FabricKind } from "../components/ClothingViewer";
import { designStore } from "../utils/designStore";

type ClothingItem = {
	id: string;
	category: string;
	preview: ImageSourcePropType;
	model: null;
};

type Fabric = {
	id: FabricKind;
	name: string;
	color: string;
};

type ColorPalette = {
	id: string;
	name: string;
	accent: string;
	colors: string[];
};

const categories = ["T-shirt", "Sweaters", "Pants", "Skirts", "Jackets", "Dresses", "Shoes", "Accessories"];

const clothingItems: ClothingItem[] = [
	{
		id: "tshirt",
		category: "T-shirt",
		preview: require("../assets/images/clothes/longsleve1.png"),
		model: null,
	},
	{
		id: "jeans",
		category: "Pants",
		preview: require("../assets/images/clothes/skirts3.png"),
		model: null,
	},
	{
		id: "shoes",
		category: "Shoes",
		preview: require("../assets/images/clothes/shoes9.png"),
		model: null,
	},
	{
		id: "hoodie",
		category: "Sweaters",
		preview: require("../assets/images/clothes/longsleve5.png"),
		model: null,
	},
	{
		id: "shorts",
		category: "Pants",
		preview: require("../assets/images/clothes/skirts4.png"),
		model: null,
	},
	{
		id: "boots",
		category: "Shoes",
		preview: require("../assets/images/clothes/shoes9.png"),
		model: null,
	},

	{ id: "chemise", category: "T-shirt", preview: require("../assets/images/clothes/blouse3.png"), model: null },
	{ id: "shortsleeve-chemise", category: "T-shirt", preview: require("../assets/images/clothes/blouse4.png"), model: null },
	{ id: "haltertop", category: "T-shirt", preview: require("../assets/images/clothes/blouse3.png"), model: null },
	{ id: "hawaiian-tshirt", category: "T-shirt", preview: require("../assets/images/clothes/longsleve1.png"), model: null },
	{ id: "off-shoulder-top", category: "T-shirt", preview: require("../assets/images/clothes/blouse4.png"), model: null },
	{ id: "tanktop", category: "T-shirt", preview: require("../assets/images/clothes/blouse3.png"), model: null },
	{ id: "workouttop", category: "T-shirt", preview: require("../assets/images/clothes/blouse4.png"), model: null },

	{ id: "cardigan", category: "Sweaters", preview: require("../assets/images/clothes/longsleve5.png"), model: null },
	{ id: "cropped-sweater", category: "Sweaters", preview: require("../assets/images/clothes/longsleve6.png"), model: null },
	{ id: "long-sweater", category: "Sweaters", preview: require("../assets/images/clothes/longsleve5.png"), model: null },
	{ id: "zipup", category: "Sweaters", preview: require("../assets/images/clothes/jacekt1.png"), model: null },
	{ id: "fleece-croptop", category: "Sweaters", preview: require("../assets/images/clothes/longsleve6.png"), model: null },

	{ id: "casual-dress", category: "Dresses", preview: require("../assets/images/clothes/dress1.png"), model: null },
	{ id: "cute-dress", category: "Dresses", preview: require("../assets/images/clothes/dress11.png"), model: null },
	{ id: "fancy-dress", category: "Dresses", preview: require("../assets/images/clothes/dress12.png"), model: null },
	{ id: "sleeveless-dress", category: "Dresses", preview: require("../assets/images/clothes/dress15.png"), model: null },
	{ id: "straps-dress", category: "Dresses", preview: require("../assets/images/clothes/dress1.png"), model: null },
	{ id: "summer-dress", category: "Dresses", preview: require("../assets/images/clothes/dress11.png"), model: null },
	{ id: "very-fancy-dress", category: "Dresses", preview: require("../assets/images/clothes/dress12.png"), model: null },

	{ id: "bikershorts", category: "Pants", preview: require("../assets/images/clothes/skirts4.png"), model: null },
	{ id: "classy-pants", category: "Pants", preview: require("../assets/images/clothes/skirts3.png"), model: null },
	{ id: "jean-shorts", category: "Pants", preview: require("../assets/images/clothes/skirts5.png"), model: null },
	{ id: "leggings", category: "Pants", preview: require("../assets/images/clothes/skirts3.png"), model: null },

	{ id: "long-skirt", category: "Skirts", preview: require("../assets/images/clothes/skirts3.png"), model: null },
	{ id: "mini-skirt", category: "Skirts", preview: require("../assets/images/clothes/skirts4.png"), model: null },
	{ id: "school-skirt", category: "Skirts", preview: require("../assets/images/clothes/skirts5.png"), model: null },

	{ id: "fancy-shoes", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },
	{ id: "heelboots", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },
	{ id: "heels", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },
	{ id: "longboots", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },
	{ id: "over-knee-boots", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },
	{ id: "sandals", category: "Shoes", preview: require("../assets/images/clothes/shoes9.png"), model: null },

	{ id: "little-tie", category: "Accessories", preview: require("../assets/images/clothes/blouse3.png"), model: null },
	{ id: "pink-tie", category: "Accessories", preview: require("../assets/images/clothes/blouse3.png"), model: null },
	{ id: "necklace", category: "Accessories", preview: require("../assets/images/clothes/blouse3.png"), model: null },
];

const colorPalettes: ColorPalette[] = [
	{
		id: "rainbow",
		name: "Rainbow",
		accent: "#FF3B30",
		colors: ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", "#007AFF", "#5856D6", "#AF52DE"],
	},
	{
		id: "pastels",
		name: "Pastels",
		accent: "#FFC0CB",
		colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#E0BBE4", "#FCD5CE", "#D8E2DC"],
	},
	{
		id: "neon",
		name: "Neon",
		accent: "#FF14A0",
		colors: ["#FF14A0", "#00FFFF", "#FF00FF", "#39FF14", "#FFFF00", "#FF6600", "#9D00FF", "#00FF7F"],
	},
	{
		id: "earth",
		name: "Earth Tones",
		accent: "#8B4513",
		colors: ["#8B4513", "#A0522D", "#DEB887", "#F4A460", "#D2B48C", "#BC8F8F", "#5C4033", "#6F4E37"],
	},
	{
		id: "jewel",
		name: "Jewel Tones",
		accent: "#4B0082",
		colors: ["#4B0082", "#008080", "#800020", "#FFD700", "#50C878", "#DC143C", "#9966CC", "#0F52BA"],
	},
];

const fabrics: Fabric[] = [
	{ id: "velvet", name: "Velvet", color: "#6C3082" },
	{ id: "silk", name: "Silk", color: "#FFE4B5" },
	{ id: "cotton", name: "Cotton", color: "#F5F5F5" },
	{ id: "denim", name: "Denim", color: "#4169E1" },
];

const tabs = ["Clothes", "Colors", "Design", "Fabric"];

export default function CreateClothingScreen() {
	const router = useRouter();
	const designImage = designStore.savedDesignImage;

	const viewerRef = useRef<ClothingViewerHandle>(null);

	const [activeTab, setActiveTab] = useState("Clothes");
	const [selectedCategory, setSelectedCategory] = useState(createClothingDraft.selectedCategory);

	const [selectedItem, setSelectedItem] = useState<ClothingItem>(clothingItems.find((item) => item.id === createClothingDraft.selectedClothingId) ?? clothingItems[0]);

	const [selectedColor, setSelectedColor] = useState<string | null>(createClothingDraft.selectedColor);

	const [selectedPaletteId, setSelectedPaletteId] = useState<string>(colorPalettes[0].id);
	const [paletteOpen, setPaletteOpen] = useState<boolean>(false);

	const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const scale = useSharedValue(1);

	const savedTranslateX = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);
	const savedScale = useSharedValue(1);

	const panGesture = Gesture.Pan()
		.onUpdate((e) => {
			translateX.value = savedTranslateX.value + e.translationX;
			translateY.value = savedTranslateY.value + e.translationY;
		})
		.onEnd(() => {
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	const pinchGesture = Gesture.Pinch()
		.onUpdate((e) => {
			scale.value = Math.max(0.3, Math.min(savedScale.value * e.scale, 4));
		})
		.onEnd(() => {
			savedScale.value = scale.value;
		});

	const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

	const animatedDesignStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
	}));

	const filteredItems = clothingItems.filter((item) => item.category === selectedCategory);

	const handleSaveClothing = async () => {
		try {
			const storedUser = await AsyncStorage.getItem("user");

			if (!storedUser) {
				Alert.alert("Error", "No logged in user");
				return;
			}

			const user = JSON.parse(storedUser);
			const userId = user._id || user.id;

			if (!userId) {
				Alert.alert("Error", "User id not found");
				return;
			}

			const rawSnapshot = (await viewerRef.current?.takeSnapshot()) ?? null;

			const snapshotImage = await shrinkDataUri(rawSnapshot, 220, "jpeg", 0.78);
			const shrunkDesignImage = await shrinkDataUri(designImage ?? null, 180, "png");

			const newItem = {
				userId,
				clothingId: selectedItem.id,
				category: selectedItem.category,
				color: selectedColor ?? "#FFFFFF",
				designImage: shrunkDesignImage,
				designX: translateX.value,
				designY: translateY.value,
				designScale: scale.value,
				snapshotImage,
				fabric: selectedFabric?.id ?? null,
				createdAt: new Date().toISOString(),
			};

			const saved = await saveClothingToStorage(newItem);

			router.replace({
				pathname: "/clothing-info" as any,
				params: { itemId: saved.id },
			});
		} catch (error) {
			console.log("Save clothing error:", error);
			Alert.alert("Error", "Could not save clothing");
		}
	};

	const handleTabPress = (tab: string) => {
		if (tab === "Design") {
			router.push("/wardrobe");
			return;
		}

		setActiveTab(tab);
	};

	return (
		<View style={styles.screen}>
			<Pressable style={styles.saveButton} onPress={handleSaveClothing}>
				<Text style={styles.saveText}>Save</Text>
			</Pressable>

			<View style={styles.previewArea}>
				<View style={styles.previewBox}>
					<View style={{ width: "100%", height: 280 }}>
						{}
						<ClothingViewer key={selectedItem.id} ref={viewerRef} color={selectedColor} clothingId={selectedItem.id} category={selectedItem.category} fabric={selectedFabric?.id ?? null} />
					</View>

					{designImage ? (
						<GestureDetector gesture={composedGesture}>
							<Animated.Image source={{ uri: designImage }} style={[styles.designOverlay, animatedDesignStyle]} />
						</GestureDetector>
					) : null}
				</View>
			</View>

			<View style={styles.panel}>
				<View style={styles.tabRow}>
					{tabs.map((tab) => {
						const isActive = activeTab === tab;

						return (
							<Pressable key={tab} onPress={() => handleTabPress(tab)} style={styles.tabButton}>
								<Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>

								{isActive ? <View style={styles.activeIndicator} /> : null}
							</Pressable>
						);
					})}
				</View>

				<View style={styles.tabContent}>
					{activeTab === "Clothes" && (
						<>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
								{categories.map((cat) => {
									const isActive = selectedCategory === cat;

									return (
										<Pressable
											key={cat}
											style={[styles.pill, isActive && styles.activePill]}
											onPress={() => {
												setSelectedCategory(cat);
												createClothingDraft.selectedCategory = cat;
											}}
										>
											<Text style={[styles.pillText, isActive && styles.activePillText]}>{cat}</Text>
										</Pressable>
									);
								})}
							</ScrollView>

							<ScrollView contentContainerStyle={styles.grid}>
								{filteredItems.map((item) => {
									const isSelected = selectedItem.id === item.id;

									return (
										<Pressable
											key={item.id}
											style={[styles.gridCard, isSelected && styles.selectedCard]}
											onPress={() => {
												setSelectedItem(item);
												createClothingDraft.selectedClothingId = item.id;
												createClothingDraft.selectedCategory = item.category;
											}}
										>
											{}
											<View style={styles.gridThumb} pointerEvents="none">
												<ClothingViewer clothingId={item.id} category={item.category} previewMode />
											</View>
										</Pressable>
									);
								})}
							</ScrollView>
						</>
					)}

					{activeTab === "Colors" &&
						(() => {
							const selectedPalette = colorPalettes.find((p) => p.id === selectedPaletteId) ?? colorPalettes[0];

							return (
								<ScrollView contentContainerStyle={styles.colorTabContent}>
									<Pressable style={styles.paletteDropdownHeader} onPress={() => setPaletteOpen((open) => !open)}>
										<Text style={styles.paletteDropdownText}>{selectedPalette.name}</Text>
										<Text style={styles.paletteDropdownChevron}>{paletteOpen ? "▲" : "▼"}</Text>
									</Pressable>

									{paletteOpen ? (
										<View style={styles.paletteDropdownList}>
											{colorPalettes.map((palette) => {
												const isSelected = palette.id === selectedPaletteId;

												return (
													<Pressable
														key={palette.id}
														style={[styles.paletteDropdownItem, isSelected && styles.paletteDropdownItemSelected]}
														onPress={() => {
															setSelectedPaletteId(palette.id);
															setPaletteOpen(false);
														}}
													>
														<Text style={styles.paletteDropdownItemText}>{palette.name}</Text>
													</Pressable>
												);
											})}
										</View>
									) : null}

									<View style={styles.colorGrid}>
										{selectedPalette.colors.map((color) => (
											<Pressable
												key={color}
												style={[styles.swatch, { backgroundColor: color }, selectedColor === color && styles.selectedSwatch]}
												onPress={() => {
													setSelectedColor(color);
													createClothingDraft.selectedColor = color;
													setSelectedFabric(null);
												}}
											/>
										))}
									</View>
								</ScrollView>
							);
						})()}

					{activeTab === "Fabric" && (
						<View style={styles.fabricRow}>
							{fabrics.map((fabric) => {
								const isSelected = selectedFabric?.id === fabric.id;

								return (
									<Pressable
										key={fabric.id}
										style={[styles.fabricCard, isSelected && styles.selectedFabricCard]}
										onPress={() => {
											setSelectedFabric(isSelected ? null : fabric);
										}}
									>
										<View style={[styles.fabricSwatch, { backgroundColor: fabric.color }]} />

										<Text style={styles.fabricName}>{fabric.name}</Text>
									</Pressable>
								);
							})}
						</View>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#EDEDF1",
	},

	saveButton: {
		position: "absolute",
		top: 56,
		right: 24,
		zIndex: 10,
		backgroundColor: "#111111",
		paddingHorizontal: 22,
		paddingVertical: 10,
		borderRadius: 20,
	},

	saveText: {
		color: "#FFFFFF",
		fontWeight: "700",
	},

	previewArea: {
		height: "48%",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 70,
	},

	previewBox: {
		width: 280,
		height: 280,
		backgroundColor: "#F7F7F7",
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},

	designOverlay: {
		position: "absolute",
		width: 75,
		height: 75,
		resizeMode: "contain",
		top: 125,
		left: "50%",
		marginLeft: -37.5,
		zIndex: 20,
	},

	panel: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingTop: 6,
	},

	tabRow: {
		flexDirection: "row",
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 4,
	},

	tabButton: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 10,
	},

	tabText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#999999",
	},

	activeTabText: {
		color: "#1E1E1E",
	},

	activeIndicator: {
		marginTop: 6,
		width: 24,
		height: 3,
		borderRadius: 2,
		backgroundColor: "#1E1E1E",
	},

	tabContent: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 24,
	},

	pillRow: {
		flexDirection: "row",
		gap: 8,
		paddingTop: 12,
		paddingBottom: 14,
		paddingRight: 18,
		alignItems: "center",
	},

	pill: {
		paddingHorizontal: 14,
		paddingVertical: 4,
		borderRadius: 14,
		backgroundColor: "#F0F0F0",
	},

	activePill: {
		backgroundColor: "#1E1E1E",
	},

	pillText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#666666",
	},

	activePillText: {
		color: "#FFFFFF",
	},

	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		paddingBottom: 30,
	},

	gridCard: {
		width: "47%",
		aspectRatio: 1,
		borderRadius: 16,
		backgroundColor: "#F5F5F5",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		borderWidth: 2.5,
		borderColor: "transparent",
	},

	selectedCard: {
		borderColor: "#1E1E1E",
	},

	gridThumb: {
		width: "100%",
		height: "100%",
		overflow: "hidden",
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
	},

	colorTabContent: {
		paddingBottom: 30,
	},

	paletteDropdownHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderWidth: 1.5,
		borderColor: "#E0DAF0",
		borderRadius: 14,
		backgroundColor: "#FFFFFF",
	},

	paletteDropdownText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	paletteDropdownChevron: {
		fontSize: 14,
		color: "#5856D6",
	},

	paletteDropdownList: {
		marginTop: 8,
		borderRadius: 14,
		overflow: "hidden",
		borderWidth: 1.5,
		borderColor: "#E0DAF0",
		backgroundColor: "#FFFFFF",
	},

	paletteDropdownItem: {
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F2EEFF",
	},

	paletteDropdownItemSelected: {
		backgroundColor: "#F7F4FF",
	},

	paletteDropdownItemText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
		textAlign: "center",
	},

	colorGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 14,
		paddingTop: 18,
		paddingBottom: 20,
	},

	swatch: {
		width: 48,
		height: 48,
		borderRadius: 24,
		borderWidth: 2,
		borderColor: "#E0E0E0",
	},

	selectedSwatch: {
		borderColor: "#1E1E1E",
		borderWidth: 3,
		transform: [{ scale: 1.1 }],
	},

	fabricRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		paddingVertical: 8,
	},

	fabricCard: {
		width: "47%",
		paddingVertical: 18,
		borderRadius: 16,
		backgroundColor: "#F5F5F5",
		alignItems: "center",
		gap: 10,
	},

	selectedFabricCard: {
		borderWidth: 2.5,
		borderColor: "#1E1E1E",
	},

	fabricSwatch: {
		width: 60,
		height: 60,
		borderRadius: 30,
	},

	fabricName: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
	},
});
