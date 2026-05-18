import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const API_URL = "http://192.168.129.8:5000";

export default function WardrobeScreen() {
	const router = useRouter();

	const [designImage, setDesignImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const pickDesignImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			Alert.alert("Permission needed", "We need access to your photos.");
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

	const removeBackground = async () => {
		if (!designImage) {
			Alert.alert("No image", "Please choose an image first.");
			return;
		}

		try {
			setIsLoading(true);

			const imageResponse = await fetch(designImage);
			const imageBlob = await imageResponse.blob();

			const formData = new FormData();
			formData.append("image", imageBlob, "design.jpg");

			const response = await fetch(`${API_URL}/remove-background`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to remove background");
			}

			const resultBlob = await response.blob();

			const reader = new FileReader();

			reader.onloadend = () => {
				setDesignImage(reader.result as string);
			};

			reader.readAsDataURL(resultBlob);
		} catch (error) {
			console.log(error);
			Alert.alert("Error", "Could not remove the background.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.push("/homepage")}>
				<Text style={styles.backArrow}>←</Text>
			</TouchableOpacity>

			<Text style={styles.title}>Preview design</Text>

			<TouchableOpacity style={styles.imageArea} onPress={pickDesignImage}>
				{isLoading ? <ActivityIndicator size="large" color="#6E6E6E" /> : designImage ? <Image source={{ uri: designImage }} style={styles.preview} /> : <Text style={styles.uploadText}>Choose design image</Text>}
			</TouchableOpacity>

			<Text style={styles.infoText}>This design will be applied to your item</Text>

			<TouchableOpacity style={styles.button} onPress={removeBackground}>
				<Text style={styles.buttonText}>{isLoading ? "Removing..." : "Try on"}</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 24,
		paddingTop: 70,
	},

	backButton: {
		position: "absolute",
		top: 58,
		left: 28,
		zIndex: 2,
	},

	backArrow: {
		fontSize: 44,
		color: "#6E6E6E",
	},

	title: {
		textAlign: "center",
		fontSize: 22,
		color: "#1E1E1E",
		fontWeight: "700",
		marginBottom: 90,
	},

	imageArea: {
		width: "100%",
		height: 300,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 85,
	},

	preview: {
		width: 300,
		height: 300,
		resizeMode: "contain",
	},

	uploadText: {
		color: "#6E6E6E",
		fontSize: 18,
		fontWeight: "600",
	},

	infoText: {
		textAlign: "center",
		fontSize: 20,
		color: "#1E1E1E",
		marginBottom: 100,
		fontWeight: "700",
	},

	button: {
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		height: 58,
		width: "82%",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1.5,
		borderColor: "#000000",

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 4,
	},

	buttonText: {
		fontSize: 18,
		color: "#6E6E6E",
		letterSpacing: 1,
		textAlign: "center",
		fontWeight: "700",
	},
});
