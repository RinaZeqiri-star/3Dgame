import { getBackgroundById } from "@/utils/backgrounds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

const FALLBACK_BACKGROUND = require("../assets/images/homepage-room.png");

export default function MyRoomScreen() {
	const router = useRouter();

	const [backgroundSource, setBackgroundSource] = useState<ImageSourcePropType>(FALLBACK_BACKGROUND);
	const [coins, setCoins] = useState<number>(0);

	useFocusEffect(
		useCallback(() => {
			const loadUser = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setBackgroundSource(FALLBACK_BACKGROUND);
					setCoins(0);
					return;
				}

				const user = JSON.parse(storedUser);
				setCoins(user.coins ?? 0);

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
		<View style={styles.screen}>
			<ImageBackground source={backgroundSource} style={styles.roomSection} resizeMode="cover">
				<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
					<Text style={styles.backArrow}>←</Text>
				</Pressable>

				<View style={styles.coinBalance}>
					<Text style={styles.coinIcon}>🪙</Text>
					<Text style={styles.coinText}>{coins}</Text>
				</View>

				{/* TODO: vervang met AvatarViewer component wanneer avatar feature af is — bottom-aligned zodat voeten op de vloer staan */}
				<View style={styles.avatarPlaceholder}>
					<Text style={styles.placeholderText}>Avatar coming soon</Text>
				</View>
			</ImageBackground>

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
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	roomSection: {
		width: "100%",
		height: "62%",
		position: "relative",
	},

	bottomSection: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 18,
		paddingBottom: 40,
		justifyContent: "space-between",
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

	avatarPlaceholder: {
		position: "absolute",
		bottom: 0,
		left: "50%",
		marginLeft: -100,
		width: 200,
		height: 360,
		alignItems: "center",
		justifyContent: "center",
	},

	placeholderText: {
		fontSize: 16,
		color: "#999999",
		fontWeight: "600",
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
		backgroundColor: "#1E1E1E",
		borderRadius: 10,
		height: 58,
		width: "82%",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
	},

	addOutfitText: {
		fontSize: 18,
		color: "#FFFFFF",
		letterSpacing: 1,
		textAlign: "center",
		fontWeight: "700",
	},
});
