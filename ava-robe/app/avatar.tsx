import AvatarViewer from "@/components/AvatarViewer";
import ClothingViewer from "@/components/ClothingViewer";
import { getHairstyleList } from "@/utils/hairstyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const SCREEN_BG = "#EBEBEB";

const SKIN_COLORS = ["#F5D5BB", "#E0B59A", "#C68863", "#8D5524", "#5C3317"];
const EYE_COLORS = ["#6F4E37", "#1C3A57", "#2E5E2E", "#B8956A", "#1C1C1C"];
const HAIR_COLORS = ["#1C1C1C", "#3B2820", "#6F4E37", "#D4B26A", "#8B3A2C"];

const HAIRSTYLES = getHairstyleList();

type Tab = "skin" | "eyes" | "hair";

export default function AvatarScreen() {
	const router = useRouter();

	const [skinColor, setSkinColor] = useState<string>(SKIN_COLORS[0]);
	const [eyeColor, setEyeColor] = useState<string>(EYE_COLORS[0]);
	const [hairColor, setHairColor] = useState<string>(HAIR_COLORS[0]);
	const [hasHair, setHasHair] = useState<boolean>(false);
	const [hairstyleId, setHairstyleId] = useState<string>("default");
	const [activeTab, setActiveTab] = useState<Tab>("skin");

	useEffect(() => {
		const loadStoredColors = async () => {
			const storedUser = await AsyncStorage.getItem("user");
			if (!storedUser) return;

			const user = JSON.parse(storedUser);
			if (user.skinColor) setSkinColor(user.skinColor);
			if (user.eyeColor) setEyeColor(user.eyeColor);
			if (user.hairColor) setHairColor(user.hairColor);
			if (typeof user.hasHair === "boolean") setHasHair(user.hasHair);
			if (user.hairstyleId) setHairstyleId(user.hairstyleId);
		};

		loadStoredColors();
	}, []);

	const handleSave = async () => {
		try {
			const storedUser = await AsyncStorage.getItem("user");

			if (!storedUser) {
				Alert.alert("Error", "No logged in user");
				return;
			}

			const user = JSON.parse(storedUser);
			const updatedUser = { ...user, skinColor, eyeColor, hairColor, hasHair, hairstyleId };

			await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

			router.replace("/create-clothing");
		} catch (error) {
			console.log("Save avatar error:", error);
			Alert.alert("Error", "Could not save avatar");
		}
	};

	const activeColors = activeTab === "skin" ? SKIN_COLORS : activeTab === "eyes" ? EYE_COLORS : HAIR_COLORS;
	const activeSelected = activeTab === "skin" ? skinColor : activeTab === "eyes" ? eyeColor : hairColor;

	const handleColorPick = (color: string) => {
		if (activeTab === "skin") {
			setSkinColor(color);
		} else if (activeTab === "eyes") {
			setEyeColor(color);
		} else {
			setHairColor(color);
		}
	};

	const helperText = activeTab === "skin" ? "Pick your skin tone" : activeTab === "eyes" ? "Pick your eye color" : "Pick your hair color";

	return (
		<View style={styles.screen}>
			<Pressable style={styles.saveButton} onPress={handleSave}>
				<Text style={styles.saveText}>Save</Text>
			</Pressable>

			<View style={styles.viewerArea}>
				{/* key remount on hairstyle change so the new GLB actually loads. */}
				<AvatarViewer key={hairstyleId} skinColor={skinColor} eyeColor={eyeColor} hairColor={hairColor} hasHair={hasHair} hairstyleId={hairstyleId} backgroundColor={SCREEN_BG} />
			</View>

			<View style={styles.swatchColumn}>
				{activeColors.map((color) => {
					const isSelected = color === activeSelected;

					return (
						<Pressable
							key={color}
							onPress={() => handleColorPick(color)}
							style={[styles.swatch, { backgroundColor: color }, isSelected && styles.selectedSwatch]}
						/>
					);
				})}
			</View>

			<View style={styles.bottomPanel}>
				<View style={styles.tabRow}>
					<Pressable style={styles.tab} onPress={() => setActiveTab("skin")}>
						<Text style={[styles.tabText, activeTab === "skin" && styles.activeTabText]}>Skin</Text>
						{activeTab === "skin" ? <View style={styles.tabIndicator} /> : null}
					</Pressable>

					<Pressable style={styles.tab} onPress={() => setActiveTab("eyes")}>
						<Text style={[styles.tabText, activeTab === "eyes" && styles.activeTabText]}>Eyes</Text>
						{activeTab === "eyes" ? <View style={styles.tabIndicator} /> : null}
					</Pressable>

					<Pressable style={styles.tab} onPress={() => setActiveTab("hair")}>
						<Text style={[styles.tabText, activeTab === "hair" && styles.activeTabText]}>Hair</Text>
						{activeTab === "hair" ? <View style={styles.tabIndicator} /> : null}
					</Pressable>
				</View>

				<Text style={styles.helperText}>{helperText}</Text>

				{activeTab === "hair" ? (
					<>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hairstyleRow}>
							{HAIRSTYLES.map((style) => {
								const isSelected = hairstyleId === style.id;
								return (
									<Pressable key={style.id} style={[styles.hairstyleCard, isSelected && styles.hairstyleCardSelected]} onPress={() => setHairstyleId(style.id)}>
										<View style={styles.hairstylePreview} pointerEvents="none">
											<ClothingViewer modelAsset={style.model} color={hairColor} category="Hair" previewMode />
										</View>
										<Text style={[styles.hairstyleText, isSelected && styles.hairstyleTextSelected]}>{style.name}</Text>
									</Pressable>
								);
							})}
						</ScrollView>

						<Pressable style={styles.hairToggle} onPress={() => setHasHair(!hasHair)}>
							<Text style={styles.hairToggleText}>{hasHair ? "Remove hair" : "Put on hair"}</Text>
						</Pressable>
					</>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: SCREEN_BG,
	},

	saveButton: {
		position: "absolute",
		top: 56,
		right: 24,
		zIndex: 10,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 26,
		paddingVertical: 10,
		borderRadius: 18,
		borderWidth: 1.2,
		borderColor: "#1E1E1E",
	},

	saveText: {
		color: "#1E1E1E",
		fontWeight: "700",
		fontSize: 15,
	},

	viewerArea: {
		height: "60%",
		paddingTop: 60,
	},

	swatchColumn: {
		position: "absolute",
		right: 24,
		top: "26%",
		gap: 16,
		zIndex: 5,
	},

	swatch: {
		width: 38,
		height: 38,
		borderRadius: 6,
		borderWidth: 1.5,
		borderColor: "#1E1E1E",
	},

	selectedSwatch: {
		borderColor: "#1E1E1E",
		borderWidth: 3,
		transform: [{ scale: 1.1 }],
	},

	bottomPanel: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingTop: 18,
		paddingHorizontal: 24,
	},

	tabRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 44,
		paddingBottom: 10,
	},

	tab: {
		alignItems: "center",
		paddingVertical: 10,
	},

	tabText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#999999",
	},

	activeTabText: {
		color: "#1E1E1E",
	},

	tabIndicator: {
		marginTop: 6,
		width: 26,
		height: 3,
		borderRadius: 2,
		backgroundColor: "#1E1E1E",
	},

	helperText: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 14,
		color: "#777777",
		fontWeight: "600",
	},

	hairToggle: {
		alignSelf: "center",
		marginTop: 16,
		backgroundColor: "#1E1E1E",
		borderRadius: 10,
		paddingHorizontal: 28,
		paddingVertical: 12,
	},

	hairToggleText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "700",
		letterSpacing: 0.5,
	},

	hairstyleRow: {
		paddingHorizontal: 4,
		paddingVertical: 16,
		gap: 12,
	},

	hairstyleCard: {
		width: 110,
		paddingVertical: 8,
		paddingHorizontal: 8,
		borderRadius: 16,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
	},

	hairstyleCardSelected: {
		backgroundColor: "#1E1E1E",
	},

	hairstylePreview: {
		width: 94,
		height: 84,
		borderRadius: 10,
		overflow: "hidden",
		marginBottom: 6,
		backgroundColor: "#FFFFFF",
	},

	hairstyleText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	hairstyleTextSelected: {
		color: "#FFFFFF",
	},
});
