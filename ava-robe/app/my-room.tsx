import AvatarViewer from "@/components/AvatarViewer";
import { getBackgroundById } from "@/utils/backgrounds";
import { getSavedClothes } from "@/utils/clothingStorage";
import { EquippedItem, getOutfit } from "@/utils/outfitStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

const FALLBACK_BACKGROUND = require("../assets/images/backgrounds/download (21) 1.png");

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

export default function MyRoomScreen() {
	const router = useRouter();

	const [backgroundSource, setBackgroundSource] = useState<ImageSourcePropType>(FALLBACK_BACKGROUND);
	const [coins, setCoins] = useState<number>(0);
	const [avatar, setAvatar] = useState<SavedAvatar>(EMPTY_AVATAR);
	const [hasSavedAvatar, setHasSavedAvatar] = useState<boolean>(false);
	const [outfit, setOutfitState] = useState<EquippedItem[]>([]);

	useFocusEffect(
		useCallback(() => {
			console.log("[my-room] focus effect fired — reloading user + outfit");
			const loadUser = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setBackgroundSource(FALLBACK_BACKGROUND);
					setCoins(0);
					setAvatar(EMPTY_AVATAR);
					setHasSavedAvatar(false);
					setOutfitState([]);
					return;
				}

				const user = JSON.parse(storedUser);
				setCoins(user.coins ?? 0);

				const savedAvatar: SavedAvatar = {
					skinColor: user.skinColor ?? null,
					eyeColor: user.eyeColor ?? null,
					hairColor: user.hairColor ?? null,
					hasHair: typeof user.hasHair === "boolean" ? user.hasHair : false,
					hairstyleId: user.hairstyleId ?? null,
					bodyId: user.bodyId ?? null,
				};

				setAvatar(savedAvatar);
				setHasSavedAvatar(Boolean(user.skinColor || user.eyeColor || user.hairColor));

				const uid = user._id || user.id;
				if (uid) {
					const [loadedOutfit, savedClothes] = await Promise.all([getOutfit(uid), getSavedClothes(uid).catch(() => [])]);
					const byId = new Map(savedClothes.map((c) => [c.id, c]));
					const enriched: EquippedItem[] = loadedOutfit.map((eq) => {
						const full = byId.get(eq.id);
						if (!full) return eq;
						return {
							...eq,
							designImage: full.designImage ?? null,
							designScale: full.designScale ?? 1,
							co2SavedPct: full.co2SavedPct ?? 0,
							waterSavedPct: full.waterSavedPct ?? 0,
						};
					});
					console.log("[my-room] loaded outfit for uid", uid, "items:", enriched);
					setOutfitState(enriched);
				}

				if (user.currentBackground) {
					const bg = getBackgroundById(user.currentBackground);

					if (bg) {
						setBackgroundSource(bg.image);
						return;
					}
				}

				setBackgroundSource(FALLBACK_BACKGROUND);
			};

			loadUser();
		}, []),
	);

	const viewerKey = useMemo(() => `${avatar.hairstyleId ?? "default"}|${avatar.bodyId ?? "default"}|${outfit.map((it) => it.id).join("|")}`, [avatar.hairstyleId, avatar.bodyId, outfit]);
	const { co2Pct, waterPct } = useMemo(() => {
		if (outfit.length === 0) return { co2Pct: 0, waterPct: 0 };
		const co2Sum = outfit.reduce((acc, it) => acc + (it.co2SavedPct ?? 0), 0);
		const waterSum = outfit.reduce((acc, it) => acc + (it.waterSavedPct ?? 0), 0);
		return {
			co2Pct: Math.round(co2Sum / outfit.length),
			waterPct: Math.round(waterSum / outfit.length),
		};
	}, [outfit]);

	return (
		<View style={styles.screen}>
			<Image source={backgroundSource} style={styles.backgroundImage} resizeMode="cover" />

			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<View style={styles.coinBalance}>
				<Text style={styles.coinIcon}>🪙</Text>
				<Text style={styles.coinText}>{coins}</Text>
			</View>

			<View style={styles.avatarStage} pointerEvents="none">
				{hasSavedAvatar ? (
					<AvatarViewer
						key={viewerKey}
						skinColor={avatar.skinColor}
						eyeColor={avatar.eyeColor}
						hairColor={avatar.hairColor}
						hasHair={avatar.hasHair}
						hairstyleId={avatar.hairstyleId}
						bodyId={avatar.bodyId}
						backgroundColor={null}
						verticalFraming={0.22}
						poseMode="rest"
						outfit={outfit}
					/>
				) : (
					<View style={styles.avatarPlaceholder}>
						<Text style={styles.placeholderText}>Save your avatar to see it here</Text>
					</View>
				)}
			</View>

			<View style={styles.bottomSection}>
				<View style={styles.ecoBars}>
					<View style={styles.ecoBarRow}>
						<Text style={styles.ecoIcon}>🌿</Text>
						<View style={styles.progressBarTrack}>
							<View style={[styles.progressBarFill, styles.progressFillCO2, { width: `${Math.max(0, Math.min(100, co2Pct))}%` }]} />
						</View>
						<Text style={styles.ecoPercent}>{co2Pct}%</Text>
					</View>
					<Text style={styles.ecoLabel}>CO2 saved</Text>

					<View style={[styles.ecoBarRow, styles.secondBarSpacing]}>
						<Text style={styles.ecoIcon}>💧</Text>
						<View style={styles.progressBarTrack}>
							<View style={[styles.progressBarFill, styles.progressFillWater, { width: `${Math.max(0, Math.min(100, waterPct))}%` }]} />
						</View>
						<Text style={styles.ecoPercent}>{waterPct}%</Text>
					</View>
					<Text style={styles.ecoLabel}>Water saved</Text>
				</View>

				<View style={styles.buttonRow}>
					<Pressable style={styles.outfitButton} onPress={() => router.push("/wardrobe2?outfitMode=true")}>
						<Text style={styles.outfitButtonText}>Add outfit</Text>
					</Pressable>

					<Pressable style={styles.outfitButton} onPress={() => router.push("/recommend-outfit")}>
						<Text style={styles.outfitButtonText}>Suggest outfit</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	backgroundImage: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
	},

	bottomSection: {
		paddingHorizontal: 24,
		paddingTop: 12,
		paddingBottom: 24,
		gap: 14,
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

	coinBalance: {
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
	},

	coinIcon: {
		fontSize: 18,
		marginRight: 6,
	},

	coinText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#000000",
	},

	avatarStage: {
		flex: 1,
		backgroundColor: "transparent",
	},

	avatarPlaceholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	placeholderText: {
		fontSize: 14,
		color: "#999999",
		fontWeight: "600",
		textAlign: "center",
		paddingHorizontal: 16,
	},

	ecoBars: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 3,
	},

	ecoBarRow: {
		flexDirection: "row",
		alignItems: "center",
	},

	secondBarSpacing: {
		marginTop: 18,
	},

	ecoIcon: {
		fontSize: 22,
		marginRight: 10,
	},

	progressBarTrack: {
		flex: 1,
		height: 14,
		backgroundColor: "#E0E0E0",
		borderRadius: 7,
		overflow: "hidden",
	},

	progressBarFill: {
		height: "100%",
		borderRadius: 7,
	},

	progressFillCO2: {
		backgroundColor: "#5BC270",
	},

	progressFillWater: {
		backgroundColor: "#5B9BD5",
	},

	ecoLabel: {
		fontSize: 14,
		color: "#1E1E1E",
		fontWeight: "600",
		marginTop: 4,
		marginLeft: 32,
	},

	ecoPercent: {
		marginLeft: 10,
		fontSize: 13,
		fontWeight: "800",
		color: "#1E1E1E",
		minWidth: 36,
		textAlign: "right",
	},

	buttonRow: {
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 4,
	},

	outfitButton: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 12,
		height: 54,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 3,
	},

	outfitButtonText: {
		fontSize: 15,
		color: "#000000",
		letterSpacing: 0.5,
		textAlign: "center",
		fontWeight: "700",
	},
});
