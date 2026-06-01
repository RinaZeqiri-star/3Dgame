import { saveClothing as saveClothingToStorage } from "@/utils/clothingStorage";
import { createClothingDraft } from "@/utils/createClothingDraft";
import { shrinkDataUri } from "@/utils/imageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import ClothingViewer, { ClothingViewerHandle } from "../components/ClothingViewer";
import { designStore } from "../utils/designStore";

type ClothingItem = {
	id: string;
	category: string;
	preview: ImageSourcePropType;
	model: null;
};

type Fabric = {
	id: string;
	name: string;
	color: string;
};

const categories = ["T-shirt", "Pants", "Skirts", "Jackets", "Dresses", "Shoes"];

const clothingItems: ClothingItem[] = [
	{
		id: "longsleve1",
		category: "T-shirt",
		preview: require("../assets/images/clothes/longsleve1.png"),
		model: null,
	},
	{
		id: "tshirt",
		category: "T-shirt",
		// TODO: replace with assets/images/clothes/tshirt.png once a preview is added
		preview: require("../assets/images/clothes/longsleve1.png"),
		model: null,
	},
	{
		id: "jeans",
		category: "Pants",
		// TODO: replace with assets/images/clothes/jeans.png once a preview is added
		preview: require("../assets/images/clothes/skirts3.png"),
		model: null,
	},
	{
		id: "shoes",
		category: "Shoes",
		preview: require("../assets/images/clothes/shoes9.png"),
		model: null,
	},
];

const colors = ["#FF6B6B", "#FFB347", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6", "#FF85A2", "#1E1E1E", "#8B4513", "#F5E6CC", "#2ECC71", "#E74C3C", "#3498DB", "#F39C12", "#95A5A6"];

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

			// Snapshot has a solid white background, so JPEG is fine and ~5-10x
			// smaller than PNG. Design needs alpha so it stays PNG.
			const snapshotImage = await shrinkDataUri(rawSnapshot, 220, "jpeg", 0.78);
			const shrunkDesignImage = await shrinkDataUri(designImage ?? null, 180, "png");

			// id is omitted — the server assigns _id and we use that for nav.
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
						{/* key forces a fresh GL context whenever a different clothing model is picked */}
						<ClothingViewer key={selectedItem.id} ref={viewerRef} color={selectedColor} clothingId={selectedItem.id} />
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
											<Image source={item.preview} style={styles.gridThumb} />
										</Pressable>
									);
								})}
							</ScrollView>
						</>
					)}

					{activeTab === "Colors" && (
						<ScrollView contentContainerStyle={styles.colorGrid}>
							{colors.map((color) => (
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
						</ScrollView>
					)}

					{activeTab === "Fabric" && (
						<View style={styles.fabricRow}>
							{fabrics.map((fabric) => {
								const isSelected = selectedFabric?.id === fabric.id;

								return (
									<Pressable
										key={fabric.id}
										style={[styles.fabricCard, isSelected && styles.selectedFabricCard]}
										onPress={() => {
											setSelectedFabric(fabric);
											setSelectedColor(fabric.color);
											createClothingDraft.selectedColor = fabric.color;
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
		gap: 10,
		paddingBottom: 14,
	},

	pill: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: "#F0F0F0",
	},

	activePill: {
		backgroundColor: "#1E1E1E",
	},

	pillText: {
		fontSize: 14,
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
	},

	selectedCard: {
		borderWidth: 2.5,
		borderColor: "#1E1E1E",
	},

	gridThumb: {
		width: "90%",
		height: "90%",
		resizeMode: "contain",
	},

	colorGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 14,
		paddingVertical: 8,
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
