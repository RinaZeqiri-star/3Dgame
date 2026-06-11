import AvatarViewer from "@/components/AvatarViewer";
import ClothingViewer from "@/components/ClothingViewer";
import { getBodyList } from "@/utils/bodies";
import { getHairstyleList } from "@/utils/hairstyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const SCREEN_BG = "#EBEBEB";

const SKIN_COLORS = ["#FAE0D0", "#F5D5BB", "#EFC298", "#E0B59A", "#D49B7A", "#C68863", "#A86C45", "#8D5524", "#6F4321", "#5C3317", "#3D2114"];

const EYE_COLORS = ["#6F4E37", "#3D2817", "#1C1C1C", "#1C3A57", "#5E81AC", "#88C0D0", "#2E5E2E", "#5BAA76", "#B8956A", "#7B5734", "#8B5A2B"];

const HAIR_COLORS = ["#1C1C1C", "#3B2820", "#6F4E37", "#9B6A3D", "#C19A6B", "#D8AB6F", "#D4B26A", "#F0DC9E", "#8B3A2C", "#7A7A7A", "#C0C0C0", "#E8A87C"];

const HAIRSTYLES = getHairstyleList();
const BODIES = getBodyList();

type Tab = "skin" | "eyes" | "hair" | "body";

export default function AvatarScreen() {
	const router = useRouter();

	const [skinColor, setSkinColor] = useState<string>(SKIN_COLORS[0]);
	const [eyeColor, setEyeColor] = useState<string>(EYE_COLORS[0]);
	const [hairColor, setHairColor] = useState<string>(HAIR_COLORS[0]);
	const [hasHair, setHasHair] = useState<boolean>(false);
	const [hairstyleId, setHairstyleId] = useState<string>("default");
	const [bodyId, setBodyId] = useState<string>("default");
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
			if (user.bodyId) setBodyId(user.bodyId);
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
			const updatedUser = { ...user, skinColor, eyeColor, hairColor, hasHair, hairstyleId, bodyId };

			await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

			router.replace("/my-room");
		} catch (error) {
			console.log("Save avatar error:", error);
			Alert.alert("Error", "Could not save avatar");
		}
	};

	let activeColors = HAIR_COLORS;
	let activeSelected = hairColor;
	if (activeTab === "skin") {
		activeColors = SKIN_COLORS;
		activeSelected = skinColor;
	} else if (activeTab === "eyes") {
		activeColors = EYE_COLORS;
		activeSelected = eyeColor;
	}

	const handleColorPick = (color: string) => {
		if (activeTab === "skin") {
			setSkinColor(color);
		} else if (activeTab === "eyes") {
			setEyeColor(color);
		} else {
			setHairColor(color);
		}
	};

	let helperText = "Pick your body type";
	if (activeTab === "skin") helperText = "Pick your skin tone";
	else if (activeTab === "eyes") helperText = "Pick your eye color";
	else if (activeTab === "hair") helperText = "Tap a hairstyle to put it on. Tap again to take it off.";

	const handleHairCardPress = (id: string) => {
		if (hasHair && hairstyleId === id) {
			setHasHair(false);
			return;
		}
		setHairstyleId(id);
		setHasHair(true);
	};

	const showColorRow = activeTab !== "body";

	return (
		<View style={styles.screen}>
			<Pressable style={styles.saveButton} onPress={handleSave}>
				<Text style={styles.saveText}>Save</Text>
			</Pressable>

			<View style={styles.viewerArea}>
				{}
				<AvatarViewer key={`${hairstyleId}|${bodyId}`} skinColor={skinColor} eyeColor={eyeColor} hairColor={hairColor} hasHair={hasHair} hairstyleId={hairstyleId} bodyId={bodyId} backgroundColor={SCREEN_BG} />
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

					<Pressable style={styles.tab} onPress={() => setActiveTab("body")}>
						<Text style={[styles.tabText, activeTab === "body" && styles.activeTabText]}>Body</Text>
						{activeTab === "body" ? <View style={styles.tabIndicator} /> : null}
					</Pressable>
				</View>

				{activeTab === "hair" ? null : <Text style={styles.helperText}>{helperText}</Text>}

				{activeTab === "hair" ? (
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hairstyleRow}>
						{HAIRSTYLES.map((style) => {
							const isSelected = hasHair && hairstyleId === style.id;
							return (
								<Pressable key={style.id} style={[styles.hairstyleCard, isSelected && styles.hairstyleCardSelected]} onPress={() => handleHairCardPress(style.id)}>
									<View style={styles.hairstylePreview} pointerEvents="none">
										<ClothingViewer modelAsset={style.model} color={hairColor} category="Hair" previewMode />
									</View>
								</Pressable>
							);
						})}
					</ScrollView>
				) : null}

				{activeTab === "body" ? (
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hairstyleRow}>
						{BODIES.map((body) => {
							const isSelected = bodyId === body.id;
							return (
								<Pressable key={body.id} style={[styles.bodyCard, isSelected && styles.hairstyleCardSelected]} onPress={() => setBodyId(body.id)}>
									<Text style={[styles.hairstyleText, isSelected && styles.hairstyleTextSelected]}>{body.name}</Text>
								</Pressable>
							);
						})}
					</ScrollView>
				) : null}

				{showColorRow ? (
					<View style={styles.swatchGrid}>
						{activeColors.map((color) => {
							const isSelected = color === activeSelected;
							return <Pressable key={color} onPress={() => handleColorPick(color)} style={[styles.swatch, { backgroundColor: color }, isSelected && styles.selectedSwatch]} />;
						})}
					</View>
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
		height: "55%",
		paddingTop: 60,
	},

	swatchGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		paddingHorizontal: 4,
		paddingVertical: 14,
		justifyContent: "center",
	},

	swatch: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1.5,
		borderColor: "#1E1E1E",
	},

	selectedSwatch: {
		borderColor: "#1E1E1E",
		borderWidth: 3,
		transform: [{ scale: 1.15 }],
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

	hairstyleRow: {
		paddingHorizontal: 4,
		paddingVertical: 12,
		gap: 12,
	},

	hairstyleCard: {
		width: 120,
		padding: 6,
		borderRadius: 16,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
	},

	bodyCard: {
		width: 120,
		height: 130,
		borderRadius: 16,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},

	hairstyleCardSelected: {
		borderWidth: 3,
		borderColor: "#1E1E1E",
	},

	hairstylePreview: {
		width: 108,
		height: 120,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#FFFFFF",
	},

	hairstyleText: {
		fontSize: 13,
		fontWeight: "700",
		color: "#1E1E1E",
		marginTop: 6,
	},

	hairstyleTextSelected: {
		color: "#1E1E1E",
	},
});
