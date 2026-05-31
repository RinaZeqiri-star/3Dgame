import AvatarViewer from "@/components/AvatarViewer";
import { getBackgroundById } from "@/utils/backgrounds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

const FALLBACK_BACKGROUND = require("../assets/images/backgrounds/download (21) 1.png");

type SavedAvatar = {
	skinColor: string | null;
	eyeColor: string | null;
	hairColor: string | null;
	hasHair: boolean;
};

const EMPTY_AVATAR: SavedAvatar = {
	skinColor: null,
	eyeColor: null,
	hairColor: null,
	hasHair: false,
};

export default function MyRoomScreen() {
	const router = useRouter();

	const [backgroundSource, setBackgroundSource] = useState<ImageSourcePropType>(FALLBACK_BACKGROUND);
	const [coins, setCoins] = useState<number>(0);
	const [avatar, setAvatar] = useState<SavedAvatar>(EMPTY_AVATAR);
	const [hasSavedAvatar, setHasSavedAvatar] = useState<boolean>(false);

	useFocusEffect(
		useCallback(() => {
			const loadUser = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setBackgroundSource(FALLBACK_BACKGROUND);
					setCoins(0);
					setAvatar(EMPTY_AVATAR);
					setHasSavedAvatar(false);
					return;
				}

				const user = JSON.parse(storedUser);
				setCoins(user.coins ?? 0);

				const savedAvatar: SavedAvatar = {
					skinColor: user.skinColor ?? null,
					eyeColor: user.eyeColor ?? null,
					hairColor: user.hairColor ?? null,
					hasHair: typeof user.hasHair === "boolean" ? user.hasHair : false,
				};

				setAvatar(savedAvatar);
				setHasSavedAvatar(Boolean(user.skinColor || user.eyeColor || user.hairColor));

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

	return (
		<ImageBackground source={backgroundSource} style={styles.screen} resizeMode="cover">
			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<View style={styles.coinBalance}>
				<Text style={styles.coinIcon}>🪙</Text>
				<Text style={styles.coinText}>{coins}</Text>
			</View>

			<View style={styles.avatarStage} pointerEvents="none">
				{hasSavedAvatar ? (
					<AvatarViewer skinColor={avatar.skinColor} eyeColor={avatar.eyeColor} hairColor={avatar.hairColor} hasHair={avatar.hasHair} backgroundColor={null} verticalFraming={0.08} poseMode="aPose" />
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
							{/* TODO: bereken percentage op basis van outfit CO2 wanneer outfit feature af is */}
							<View style={[styles.progressBarFill, styles.progressFillCO2, { width: "0%" }]} />
						</View>
					</View>
					<Text style={styles.ecoLabel}>CO2 emissions</Text>

					<View style={[styles.ecoBarRow, styles.secondBarSpacing]}>
						<Text style={styles.ecoIcon}>💧</Text>
						<View style={styles.progressBarTrack}>
							{/* TODO: bereken percentage op basis van outfit water usage wanneer outfit feature af is */}
							<View style={[styles.progressBarFill, styles.progressFillWater, { width: "0%" }]} />
						</View>
					</View>
					<Text style={styles.ecoLabel}>Water usage</Text>
				</View>

				<Pressable style={styles.addOutfitButton} onPress={() => router.push("/wardrobe2")}>
					<Text style={styles.addOutfitText}>Add outfit</Text>
				</Pressable>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
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

	addOutfitButton: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 12,
		height: 54,
		width: "82%",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 3,
	},

	addOutfitText: {
		fontSize: 17,
		color: "#000000",
		letterSpacing: 1,
		textAlign: "center",
		fontWeight: "700",
	},
});
