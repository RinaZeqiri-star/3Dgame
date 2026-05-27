import ClothingViewer from "@/components/ClothingViewer";
import { getSavedClothes, SavedClothing } from "@/utils/clothingStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["T-shirt", "Jackets", "Sweaters", "Pants", "Dress", "Skirts", "Accessories", "Shoes"];

const DESIGN_PREVIEW_RATIO = 42 / 75;

export default function Wardrobe2Screen() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState("T-shirt");
	const [savedClothes, setSavedClothes] = useState<SavedClothing[]>([]);

	useFocusEffect(
		useCallback(() => {
			const loadSavedClothes = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setSavedClothes([]);
					return;
				}

				const user = JSON.parse(storedUser);
				const userId = user._id || user.id;

				if (!userId) {
					setSavedClothes([]);
					return;
				}

				const clothes = await getSavedClothes(userId);
				setSavedClothes(clothes);
			};

			loadSavedClothes();
		}, []),
	);

	const filteredClothes = savedClothes.filter((item) => item.category === selectedCategory);

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
					filteredClothes.map((item) => (
						<Pressable
							key={item.id}
							style={styles.savedItem}
							onPress={() => {
								router.push({
									pathname: "/clothing-detail" as any,
									params: { itemId: item.id },
								});
							}}
						>
							{item.snapshotImage ? (
								<Image source={{ uri: item.snapshotImage }} style={styles.viewerWrapper} resizeMode="contain" />
							) : (
								<View style={styles.viewerWrapper}>
									<ClothingViewer clothingId={item.clothingId} color={item.color} previewMode />
								</View>
							)}

							{item.designImage ? (
								<Image
									source={{ uri: item.designImage }}
									style={[
										styles.designImage,
										{
											transform: [
												{ translateX: (item.designX ?? 0) * DESIGN_PREVIEW_RATIO },
												{ translateY: (item.designY ?? 0) * DESIGN_PREVIEW_RATIO },
												{ scale: item.designScale ?? 1 },
											],
										},
									]}
									resizeMode="contain"
								/>
							) : null}
						</Pressable>
					))
				)}
			</ScrollView>
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
		top: 68,
		zIndex: 3,
	},

	emptyText: {
		width: "100%",
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
		color: "#777777",
	},
});
