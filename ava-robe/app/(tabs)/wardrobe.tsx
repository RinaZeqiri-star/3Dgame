import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function WardrobeScreen() {
	const [designImage, setDesignImage] = useState<string | null>(null);

	const pickDesignImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			Alert.alert("Permission needed", "We need access to your photos so you can select a clothing design.");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setDesignImage(result.assets[0].uri);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Upload Design</Text>
			<Text style={styles.description}>Choose a clothing photo and crop only the design, like the print or flower.</Text>

			<TouchableOpacity style={styles.uploadBox} onPress={pickDesignImage}>
				{designImage ? <Image source={{ uri: designImage }} style={styles.preview} /> : <Text style={styles.uploadText}>Choose design image</Text>}
			</TouchableOpacity>

			{designImage && <Text style={styles.successText}>Design selected and ready to save.</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
		padding: 20,
		justifyContent: "center",
	},
	title: {
		color: "#B6FF3B",
		fontSize: 26,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	description: {
		color: "#FFFFFF",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	uploadBox: {
		height: 260,
		backgroundColor: "#1E2A5A",
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	uploadText: {
		color: "#FFFFFF",
		fontSize: 16,
	},
	preview: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
	successText: {
		color: "#B6FF3B",
		textAlign: "center",
		marginTop: 16,
	},
});
