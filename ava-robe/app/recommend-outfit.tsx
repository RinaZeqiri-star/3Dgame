import AvatarViewer, { AvatarViewerHandle } from "@/components/AvatarViewer";
import ClothingViewer from "@/components/ClothingViewer";
import { getSavedClothes, incrementTimesWorn, SavedClothing } from "@/utils/clothingStorage";
import { EquippedItem, setOutfit } from "@/utils/outfitStorage";
import { clothingToEquipped, generateOutfitSuggestions, OutfitSuggestion } from "@/utils/outfitRecommendations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["T-shirt", "Sweaters", "Jackets", "Pants", "Skirts", "Dresses", "Shoes", "Accessories"];

const API_URL = "http://192.168.129.8:5000";
const COIN_REWARD = 15;
const SNAPSHOT_BG = "#F7E9DC"; 

type SavedAvatar = {
	skinColor: string | null;
	eyeColor: string | null;
	hairColor: string | null;
	hasHair: boolean;
	hairstyleId: string | null;
	bodyId: string | null;
};

const EMPTY_AVATAR: SavedAvatar = {
	skinColor: null,
	eyeColor: null,
	hairColor: null,
	hasHair: false,
	hairstyleId: null,
	bodyId: null,
};

const showAlert = (title: string, message?: string) => {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		window.alert(message ? `${title}\n\n${message}` : title);
	} else {
		Alert.alert(title, message);
	}
};

export default function RecommendOutfitScreen() {
	const router = useRouter();

	const [phase, setPhase] = useState<"pick" | "suggest" | "preview">("pick");
	const [selectedCategory, setSelectedCategory] = useState("T-shirt");
	const [savedClothes, setSavedClothes] = useState<SavedClothing[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [anchor, setAnchor] = useState<SavedClothing | null>(null);
	const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
	const [applying, setApplying] = useState(false);

	const [avatar, setAvatar] = useState<SavedAvatar>(EMPTY_AVATAR);
	const [hasSavedAvatar, setHasSavedAvatar] = useState<boolean>(false);
	const [chosenOutfit, setChosenOutfit] = useState<EquippedItem[]>([]);
	const [coinsEarned, setCoinsEarned] = useState<number>(0);
	const [saving, setSaving] = useState(false);

	const avatarRef = useRef<AvatarViewerHandle>(null);

	useFocusEffect(
		useCallback(() => {
			const load = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setSavedClothes([]);
					setUserId(null);
					setAvatar(EMPTY_AVATAR);
					setHasSavedAvatar(false);
					return;
				}

				const user = JSON.parse(storedUser);
				const uid = user._id || user.id;

				if (!uid) {
					setSavedClothes([]);
					setUserId(null);
					setAvatar(EMPTY_AVATAR);
					setHasSavedAvatar(false);
					return;
				}

				setUserId(uid);
				const clothes = await getSavedClothes(uid);
				setSavedClothes(clothes);

				setAvatar({
					skinColor: user.skinColor ?? null,
					eyeColor: user.eyeColor ?? null,
					hairColor: user.hairColor ?? null,
					hasHair: typeof user.hasHair === "boolean" ? user.hasHair : false,
					hairstyleId: user.hairstyleId ?? null,
					bodyId: user.bodyId ?? null,
				});
				setHasSavedAvatar(Boolean(user.skinColor || user.eyeColor || user.hairColor));
			};

			load();
		}, []),
	);

	const previewKey = useMemo(
		() => `${avatar.hairstyleId ?? "default"}|${avatar.bodyId ?? "default"}|${chosenOutfit.map((it) => it.id).join("|")}`,
		[avatar.hairstyleId, avatar.bodyId, chosenOutfit],
	);

	const filteredClothes = useMemo(() => savedClothes.filter((it) => it.category === selectedCategory), [savedClothes, selectedCategory]);

	const handlePickAnchor = (item: SavedClothing) => {
		const generated = generateOutfitSuggestions(item, savedClothes, 5);
		setAnchor(item);
		setSuggestions(generated);
		setPhase("suggest");
	};

	const awardCoins = async (uid: string): Promise<number> => {
		try {
			const coinsResponse = await fetch(`${API_URL}/coins/add`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: uid,
					amount: COIN_REWARD,
					reason: "suggested_outfit",
				}),
			});

			if (!coinsResponse.ok) return 0;

			const coinsData = await coinsResponse.json();

			const storedUser = await AsyncStorage.getItem("user");
			if (storedUser) {
				const user = JSON.parse(storedUser);
				const updatedUser = {
					...user,
					coins: coinsData.newBalance,
					totalEarned: coinsData.newTotalEarned,
				};
				await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
			}

			return COIN_REWARD;
		} catch (err) {
			console.log("[recommend-outfit] awardCoins failed:", err);
			return 0;
		}
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

		
		incrementTimesWorn(userId, itemIds).catch((err) => {
			console.log("[recommend-outfit] incrementTimesWorn failed:", err);
		});

		const earned = await awardCoins(userId);

		setChosenOutfit(equipped);
		setCoinsEarned(earned);
		setPhase("preview");
		setApplying(false);
	};

	const handleSaveImage = async () => {
		if (saving) return;
		setSaving(true);

		try {
			const uri = await avatarRef.current?.takeSnapshot();

			if (!uri) {
				showAlert("Could not capture image", "Please wait a moment for the avatar to load, then try again.");
				return;
			}

			if (Platform.OS === "web") {
				
				const a = document.createElement("a");
				a.href = uri;
				a.download = `ava-robe-outfit-${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				showAlert("Downloaded!", "Your outfit was downloaded — upload it to Instagram as a story.");
				return;
			}

			const permission = await MediaLibrary.requestPermissionsAsync(true);
			if (!permission.granted) {
				showAlert("Permission needed", "Allow access to your photos so we can save the outfit image.");
				return;
			}

			await MediaLibrary.saveToLibraryAsync(uri);
			showAlert("Saved!", "Your outfit is in your photos — open Instagram to share it as a story.");
		} catch (err) {
			console.log("[recommend-outfit] save image failed:", err);
			showAlert("Could not save image", "Something went wrong. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleDone = () => {
		router.replace("/my-room");
	};

	const handleBack = () => {
		if (phase === "preview") {
			router.replace("/my-room");
			return;
		}
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

	if (phase === "preview") {
		return (
			<View style={styles.container}>
				<Pressable onPress={handleBack} style={styles.backButton}>
					<Text style={styles.backArrow}>←</Text>
				</Pressable>

				{coinsEarned > 0 ? (
					<View style={styles.coinBadge}>
						<Text style={styles.coinBadgeIcon}>🪙</Text>
						<Text style={styles.coinBadgeText}>+{coinsEarned}</Text>
					</View>
				) : null}

				<Text style={styles.title}>Your new look</Text>
				<Text style={styles.subtitle}>Save the picture to share it as an Insta story</Text>

				<View style={styles.previewStage}>
					{hasSavedAvatar ? (
						<AvatarViewer
							ref={avatarRef}
							key={previewKey}
							skinColor={avatar.skinColor}
							eyeColor={avatar.eyeColor}
							hairColor={avatar.hairColor}
							hasHair={avatar.hasHair}
							hairstyleId={avatar.hairstyleId}
							bodyId={avatar.bodyId}
							backgroundColor={SNAPSHOT_BG}
							verticalFraming={0.08}
							poseMode="rest"
							outfit={chosenOutfit}
						/>
					) : (
						<View style={styles.previewPlaceholder}>
							<Text style={styles.previewPlaceholderText}>Save your avatar first to see it dressed up here.</Text>
						</View>
					)}
				</View>

				<View style={styles.previewButtonRow}>
					<Pressable
						style={[styles.previewButton, styles.previewSaveButton, (saving || !hasSavedAvatar) && styles.previewButtonDisabled]}
						onPress={handleSaveImage}
						disabled={saving || !hasSavedAvatar}
					>
						{saving ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text style={styles.previewSaveButtonText}>Save to phone</Text>
						)}
					</Pressable>

					<Pressable style={[styles.previewButton, styles.previewDoneButton]} onPress={handleDone}>
						<Text style={styles.previewDoneButtonText}>Done</Text>
					</Pressable>
				</View>
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

	subtitle: {
		marginTop: 8,
		textAlign: "center",
		fontSize: 14,
		color: "#6E6E6E",
		fontWeight: "600",
		paddingHorizontal: 24,
	},

	coinBadge: {
		position: "absolute",
		top: 55,
		right: 24,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 10,
		paddingVertical: 6,
		paddingHorizontal: 12,
		zIndex: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 3,
	},

	coinBadgeIcon: {
		fontSize: 18,
		marginRight: 6,
	},

	coinBadgeText: {
		fontSize: 16,
		fontWeight: "800",
		color: "#000000",
	},

	previewStage: {
		flex: 1,
		marginTop: 14,
		marginHorizontal: 18,
		marginBottom: 18,
		borderRadius: 18,
		borderWidth: 1.5,
		borderColor: "#000000",
		overflow: "hidden",
		backgroundColor: SNAPSHOT_BG,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.18,
		shadowRadius: 5,
		elevation: 4,
	},

	previewPlaceholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},

	previewPlaceholderText: {
		fontSize: 15,
		color: "#777777",
		fontWeight: "600",
		textAlign: "center",
	},

	previewButtonRow: {
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 24,
		paddingBottom: 28,
	},

	previewButton: {
		flex: 1,
		height: 54,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 3,
	},

	previewSaveButton: {
		backgroundColor: "#1E1E1E",
	},

	previewSaveButtonText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.5,
	},

	previewDoneButton: {
		backgroundColor: "#FFFFFF",
	},

	previewDoneButtonText: {
		color: "#1E1E1E",
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.5,
	},

	previewButtonDisabled: {
		opacity: 0.5,
	},
});
