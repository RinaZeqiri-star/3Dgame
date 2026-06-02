import ClothingViewer from "@/components/ClothingViewer";
import { getSavedClothes, incrementTimesWorn, SavedClothing } from "@/utils/clothingStorage";
import { setOutfit } from "@/utils/outfitStorage";
import { clothingToEquipped, generateOutfitSuggestions, OutfitSuggestion } from "@/utils/outfitRecommendations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["T-shirt", "Sweaters", "Jackets", "Pants", "Skirts", "Dresses", "Shoes", "Accessories"];

export default function RecommendOutfitScreen() {
	const router = useRouter();

	const [phase, setPhase] = useState<"pick" | "suggest">("pick");
	const [selectedCategory, setSelectedCategory] = useState("T-shirt");
	const [savedClothes, setSavedClothes] = useState<SavedClothing[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [anchor, setAnchor] = useState<SavedClothing | null>(null);
	const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
	const [applying, setApplying] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const load = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setSavedClothes([]);
					setUserId(null);
					return;
				}

				const user = JSON.parse(storedUser);
				const uid = user._id || user.id;

				if (!uid) {
					setSavedClothes([]);
					setUserId(null);
					return;
				}

				setUserId(uid);
				const clothes = await getSavedClothes(uid);
				setSavedClothes(clothes);
			};

			load();
		}, []),
	);

	const filteredClothes = useMemo(() => savedClothes.filter((it) => it.category === selectedCategory), [savedClothes, selectedCategory]);

	const handlePickAnchor = (item: SavedClothing) => {
		const generated = generateOutfitSuggestions(item, savedClothes, 5);
		setAnchor(item);
		setSuggestions(generated);
		setPhase("suggest");
	};

	const handleUseOutfit = async (suggestion: OutfitSuggestion) => {
		if (!userId || applying) return;

		setApplying(true);
		const equipped = suggestion.items.map(clothingToEquipped);
		const itemIds = suggestion.items.map((it) => it.id);

		console.log("[recommend-outfit] applying outfit", { userId, equipped });

		try {
			await setOutfit(userId, equipped);
			const verify = await AsyncStorage.getItem(`currentOutfit_${userId}`);
			console.log("[recommend-outfit] setOutfit done — verified in storage:", verify);
		} catch (err) {
			console.log("[recommend-outfit] setOutfit failed:", err);
		}

		// Bump timesWorn on the server in the background — don't block navigation
		// on a slow / unreachable server.
		incrementTimesWorn(userId, itemIds).catch((err) => {
			console.log("[recommend-outfit] incrementTimesWorn failed:", err);
		});

		router.replace("/my-room");
	};

	const handleBack = () => {
		if (phase === "suggest") {
			setPhase("pick");
			setAnchor(null);
			setSuggestions([]);
			return;
		}
		router.back();
	};

	if (phase === "pick") {
		return (
			<View style={styles.container}>
				<Pressable onPress={handleBack} style={styles.backButton}>
					<Text style={styles.backArrow}>←</Text>
				</Pressable>

				<Text style={styles.title}>Pick an item to build around</Text>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
					{categories.map((category) => (
						<Pressable key={category} style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]} onPress={() => setSelectedCategory(category)}>
							<Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>{category}</Text>
						</Pressable>
					))}
				</ScrollView>

				<ScrollView contentContainerStyle={styles.grid}>
					{filteredClothes.length === 0 ? (
						<Text style={styles.emptyText}>No saved clothes in this category</Text>
					) : (
						filteredClothes.map((item) => (
							<Pressable key={item.id} style={styles.savedItem} onPress={() => handlePickAnchor(item)}>
								{item.snapshotImage ? (
									<Image source={{ uri: item.snapshotImage }} style={styles.viewerWrapper} resizeMode="contain" />
								) : (
									<View style={styles.viewerWrapper}>
										<ClothingViewer clothingId={item.clothingId} color={item.color} previewMode />
									</View>
								)}
							</Pressable>
						))
					)}
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Pressable onPress={handleBack} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<Text style={styles.title}>{anchor ? `Suggestions for your ${anchor.category.toLowerCase()}` : "Pick your outfit"}</Text>

			<ScrollView contentContainerStyle={styles.suggestList}>
				{suggestions.length === 0 ? (
					<Text style={styles.emptyText}>Not enough clothes to build an outfit. Save more items in your wardrobe first.</Text>
				) : (
					suggestions.map((suggestion, idx) => (
						<Pressable key={idx} style={[styles.suggestCard, applying && styles.useButtonDisabled]} disabled={applying} onPress={() => handleUseOutfit(suggestion)}>
							<Text style={styles.suggestLabel}>Outfit {idx + 1}</Text>

							<View style={styles.thumbsRow}>
								{suggestion.items.map((item) => (
									<View key={item.id} style={styles.thumb}>
										{item.snapshotImage ? (
											<Image source={{ uri: item.snapshotImage }} style={styles.thumbImage} resizeMode="contain" />
										) : (
											<ClothingViewer clothingId={item.clothingId} color={item.color} previewMode />
										)}
									</View>
								))}
							</View>

							{suggestion.missing.length > 0 ? <Text style={styles.missingText}>Missing: {suggestion.missing.join(", ")}</Text> : null}

							<View style={styles.useButton}>
								<Text style={styles.useButtonText}>Use this outfit</Text>
							</View>
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

	title: {
		marginTop: 50,
		textAlign: "center",
		fontSize: 18,
		fontWeight: "700",
		color: "#1E1E1E",
		paddingHorizontal: 24,
	},

	categoryRow: {
		paddingHorizontal: 18,
		paddingTop: 24,
		paddingBottom: 18,
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
		marginTop: 4,
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

	viewerWrapper: {
		width: "100%",
		height: "100%",
		zIndex: 2,
	},

	emptyText: {
		width: "100%",
		textAlign: "center",
		marginTop: 40,
		fontSize: 16,
		color: "#777777",
		paddingHorizontal: 32,
	},

	suggestList: {
		paddingTop: 18,
		paddingBottom: 32,
	},

	suggestCard: {
		marginHorizontal: 18,
		marginBottom: 16,
		paddingVertical: 14,
		paddingHorizontal: 14,
		borderWidth: 1.4,
		borderColor: "#000000",
		borderRadius: 14,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},

	suggestLabel: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
		marginBottom: 10,
	},

	thumbsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		justifyContent: "center",
		marginBottom: 12,
	},

	thumb: {
		width: 62,
		height: 80,
		borderWidth: 1,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
	},

	thumbImage: {
		width: "100%",
		height: "100%",
	},

	missingText: {
		fontSize: 13,
		color: "#A05A2C",
		marginBottom: 10,
		textAlign: "center",
		fontWeight: "600",
	},

	useButton: {
		backgroundColor: "#1E1E1E",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
		justifyContent: "center",
	},

	useButtonDisabled: {
		opacity: 0.5,
	},

	useButtonText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.5,
	},
});
