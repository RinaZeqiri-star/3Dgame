import ClothingViewer from "@/components/ClothingViewer";
import { getSavedClothes, SavedClothing } from "@/utils/clothingStorage";
import { EquippedItem, getOutfit, setOutfit, toggleItemInOutfit } from "@/utils/outfitStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["T-shirt", "Sweaters", "Jackets", "Pants", "Skirts", "Dresses", "Shoes", "Accessories"];

const DESIGN_PREVIEW_RATIO = 42 / 75;

export default function Wardrobe2Screen() {
	const router = useRouter();
	const { outfitMode } = useLocalSearchParams<{ outfitMode?: string }>();
	const isOutfitMode = outfitMode === "true";

	const [selectedCategory, setSelectedCategory] = useState("T-shirt");
	const [savedClothes, setSavedClothes] = useState<SavedClothing[]>([]);
	const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
	const [userId, setUserId] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			const loadAll = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setSavedClothes([]);
					setEquippedItems([]);
					setUserId(null);
					return;
				}

				const user = JSON.parse(storedUser);
				const uid = user._id || user.id;

				if (!uid) {
					setSavedClothes([]);
					setEquippedItems([]);
					setUserId(null);
					return;
				}

				setUserId(uid);

				const [clothes, outfit] = await Promise.all([getSavedClothes(uid), getOutfit(uid)]);
				setSavedClothes(clothes);
				setEquippedItems(outfit);
			};

			loadAll();
		}, []),
	);

	const filteredClothes = savedClothes.filter((item) => item.category === selectedCategory);

	const isEquipped = (itemId: string) => equippedItems.some((eq) => eq.id === itemId);

	const handleItemPress = (item: SavedClothing) => {
		if (isOutfitMode) {
			const ref: EquippedItem = {
				id: item.id,
				clothingId: item.clothingId,
				category: item.category,
				color: item.color,
			};
			setEquippedItems((current) => toggleItemInOutfit(current, ref));
			return;
		}

		router.push({
			pathname: "/clothing-detail" as any,
			params: { itemId: item.id },
		});
	};

	const handleDone = async () => {
		if (userId) {
			await setOutfit(userId, equippedItems);
		}
		router.replace("/my-room");
	};

	return (
		<View style={styles.container}>
			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<Pressable style={styles.addButton} onPress={() => router.push("/create-clothing")}>
				<Text style={styles.addText}>+</Text>
			</Pressable>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
				{categories.map((category) => (
					<Pressable key={category} style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]} onPress={() => setSelectedCategory(category)}>
						<Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>{category}</Text>
					</Pressable>
				))}
			</ScrollView>

			<ScrollView contentContainerStyle={styles.grid}>
				{filteredClothes.length === 0 ? (
					<Text style={styles.emptyText}>No saved clothes yet</Text>
				) : (
					filteredClothes.map((item) => {
						const equipped = isEquipped(item.id);

						return (
							<Pressable key={item.id} style={[styles.savedItem, isOutfitMode && equipped && styles.equippedItem]} onPress={() => handleItemPress(item)}>
								{item.snapshotImage ? (
									<Image source={{ uri: item.snapshotImage }} style={styles.viewerWrapper} resizeMode="contain" />
								) : (
									<View style={styles.viewerWrapper}>
										<ClothingViewer clothingId={item.clothingId} category={item.category} color={item.color} previewMode />
									</View>
								)}

								{item.designImage ? (
									<Image
										source={{ uri: item.designImage }}
										style={[
											styles.designImage,
											{
												transform: [{ translateX: (item.designX ?? 0) * DESIGN_PREVIEW_RATIO }, { translateY: (item.designY ?? 0) * DESIGN_PREVIEW_RATIO }, { scale: item.designScale ?? 1 }],
											},
										]}
										resizeMode="contain"
									/>
								) : null}

								{isOutfitMode && equipped ? (
									<View style={styles.checkBadge}>
										<Text style={styles.checkText}>✓</Text>
									</View>
								) : null}
							</Pressable>
						);
					})
				)}
			</ScrollView>

			{isOutfitMode ? (
				<Pressable style={styles.doneButton} onPress={handleDone}>
					<Text style={styles.doneText}>Done</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingTop: 55,
	},

	backButton: {
		position: "absolute",
		top: 45,
		left: 24,
		zIndex: 2,
	},

	backArrow: {
		fontSize: 42,
		color: "#6E6E6E",
	},

	addButton: {
		position: "absolute",
		top: 48,
		right: 28,
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 1.4,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2,
	},

	addText: {
		fontSize: 24,
		lineHeight: 24,
		color: "#000000",
		textAlign: "center",
		marginTop: -5,
	},

	categoryRow: {
		paddingHorizontal: 18,
		paddingTop: 70,
		paddingBottom: 30,
		gap: 18,
	},

	categoryButton: {
		minWidth: 110,
		height: 44,
		borderRadius: 22,
		borderWidth: 1.4,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 18,
	},

	activeCategoryButton: {
		backgroundColor: "#1E1E1E",
	},

	categoryText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	activeCategoryText: {
		color: "#FFFFFF",
	},

	grid: {
		marginTop: 10,
		flexDirection: "row",
		flexWrap: "wrap",
		borderTopWidth: 1.2,
		borderLeftWidth: 1.2,
		borderColor: "#000000",
	},

	savedItem: {
		width: "50%",
		height: 150,
		borderRightWidth: 1.2,
		borderBottomWidth: 1.2,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
		overflow: "hidden",
	},

	colorLayer: {
		position: "absolute",
		width: 90,
		height: 100,
		opacity: 0.25,
		borderRadius: 50,
	},

	viewerWrapper: {
		width: "100%",
		height: "100%",
		zIndex: 2,
	},

	designImage: {
		position: "absolute",
		width: 42,
		height: 42,
		top: 30,
		left: "50%",
		marginLeft: -21,
		zIndex: 3,
	},

	emptyText: {
		width: "100%",
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
		color: "#777777",
	},

	equippedItem: {
		backgroundColor: "#F4F0E1",
	},

	checkBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: "#1E1E1E",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 4,
	},

	checkText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "800",
	},

	doneButton: {
		position: "absolute",
		bottom: 28,
		alignSelf: "center",
		backgroundColor: "#1E1E1E",
		borderRadius: 14,
		paddingHorizontal: 48,
		paddingVertical: 14,
		zIndex: 5,
	},

	doneText: {
		color: "#FFFFFF",
		fontSize: 17,
		fontWeight: "800",
		letterSpacing: 1,
	},
});
