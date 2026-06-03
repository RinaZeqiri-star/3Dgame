import { getClothingById, SavedClothing, updateClothing } from "@/utils/clothingStorage";
import { resetClothingDraft } from "@/utils/createClothingDraft";
import { clearSavedDesignImage } from "@/utils/designStore";
import { calculateSustainability } from "@/utils/sustainabilityCalc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function ClothingInfoScreen() {
	const router = useRouter();
	const { itemId } = useLocalSearchParams<{ itemId: string }>();

	const [userId, setUserId] = useState<string | null>(null);
	const [item, setItem] = useState<SavedClothing | null>(null);

	const [materials, setMaterials] = useState("");
	const [madeIn, setMadeIn] = useState("");
	const [washingInstructions, setWashingInstructions] = useState("");
	const [clothingType, setClothingType] = useState("");

	useEffect(() => {
		const load = async () => {
			const storedUser = await AsyncStorage.getItem("user");

			if (!storedUser || !itemId) return;

			const user = JSON.parse(storedUser);
			const uid = user._id || user.id;
			setUserId(uid);

			const loaded = await getClothingById(uid, String(itemId));

			if (loaded) {
				setItem(loaded);
				setMaterials(loaded.materials ?? "");
				setMadeIn(loaded.madeIn ?? "");
				setWashingInstructions(loaded.washingInstructions ?? "");
				setClothingType(loaded.clothingType ?? "");
			}
		};

		load();
	}, [itemId]);

	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!userId || !item) {
			Alert.alert("Error", "Could not load clothing item");
			return;
		}

		setSaving(true);

		const { co2SavedPct, waterSavedPct, source } = await calculateSustainability({
			materials,
			madeIn,
			washingInstructions,
			clothingType,
		});

		await updateClothing(userId, item.id, {
			materials,
			madeIn,
			washingInstructions,
			clothingType,
			co2SavedPct,
			waterSavedPct,
			sustainabilitySource: source,
			timesWorn: item.timesWorn ?? 0,
		});

		resetClothingDraft();
		clearSavedDesignImage();

		setSaving(false);

		router.replace("/wardrobe2");
	};

	return (
		<KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
				<View style={styles.field}>
					<Text style={styles.label}>What materials are listed on the label?</Text>
					<TextInput style={styles.input} value={materials} onChangeText={setMaterials} placeholder="" />
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>Where was the item made?</Text>
					<TextInput style={styles.input} value={madeIn} onChangeText={setMadeIn} placeholder="" />
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>What washing instructions are shown?</Text>
					<TextInput style={styles.input} value={washingInstructions} onChangeText={setWashingInstructions} placeholder="" />
				</View>

				<View style={styles.field}>
					<Text style={styles.label}>What type of clothing is it?</Text>
					<TextInput style={styles.input} value={clothingType} onChangeText={setClothingType} placeholder="" />
				</View>

				<Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
					<Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: 28,
		paddingVertical: 40,
	},

	previewBox: {
		width: "100%",
		height: 280,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 30,
		position: "relative",
		overflow: "hidden",
	},

	previewImage: {
		width: "100%",
		height: "100%",
	},

	viewerWrapper: {
		width: "100%",
		height: "100%",
	},

	designImage: {
		position: "absolute",
		width: 75,
		height: 75,
		top: 110,
		zIndex: 3,
	},

	field: {
		marginBottom: 22,
	},

	label: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
		marginBottom: 10,
	},

	input: {
		borderWidth: 1.2,
		borderColor: "#1E1E1E",
		borderRadius: 22,
		height: 44,
		paddingHorizontal: 18,
		fontSize: 14,
		color: "#1E1E1E",
	},

	saveButton: {
		alignSelf: "center",
		marginTop: 14,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 10,
		borderWidth: 1.2,
		borderColor: "#1E1E1E",
		backgroundColor: "#FFFFFF",
	},

	saveText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	saveButtonDisabled: {
		opacity: 0.5,
	},
});
