import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { setSavedDesignImage } from "../../utils/designStore";
import { persistDataUriAsFile } from "../../utils/imageUtils";

const API_URL = "http://192.168.129.8:5000";

export default function WardrobeScreen() {
	const router = useRouter();

	const [designImage, setDesignImage] = useState<string | null>(null);
	const [cleanedImage, setCleanedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const pickDesignImage = async () => {
		try {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert("Permission needed", "We need access to your photos to choose a design.");
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
				setCleanedImage(null);
			}
		} catch (error) {
			console.log("[wardrobe] pickDesignImage error:", error);
			Alert.alert("Error", "Could not open the photo library.");
		}
	};

	const removeBackground = async () => {
		if (!designImage) {
			Alert.alert("No image", "Please choose an image first.");
			return;
		}

		try {
			setIsLoading(true);

			const formData = new FormData();

			if (Platform.OS === "web") {
				const imageResponse = await fetch(designImage);
				const imageBlob = await imageResponse.blob();
				formData.append("image", imageBlob, "design.jpg");
			} else {
				const lastDot = designImage.lastIndexOf(".");
				const ext = lastDot >= 0 ? designImage.slice(lastDot + 1).toLowerCase().split("?")[0] : "jpg";
				const mime = ext === "png" ? "image/png" : "image/jpeg";

				formData.append("image", {
					uri: designImage,
					name: `design.${ext}`,
					type: mime,
				} as any);
			}

			const response = await fetch(`${API_URL}/remove-background`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to remove background");
			}

			let dataUri: string | null = null;

			if (Platform.OS === "web") {
				const resultBlob = await response.blob();
				dataUri = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(resultBlob);
				});
			} else {
				const arrayBuffer = await response.arrayBuffer();
				const bytes = new Uint8Array(arrayBuffer);
				const chunkSize = 0x8000;
				let binary = "";
				for (let i = 0; i < bytes.length; i += chunkSize) {
					binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as any);
				}
				const base64 = (globalThis as any).btoa(binary);
				const contentType = response.headers.get("content-type") || "image/png";
				dataUri = `data:${contentType};base64,${base64}`;
			}

			if (dataUri) {
				const persisted = (await persistDataUriAsFile(dataUri, "design-cleaned")) ?? dataUri;
				setDesignImage(persisted);
				setCleanedImage(persisted);
			}
		} catch (error) {
			console.log("[wardrobe] removeBackground error:", error);
			Alert.alert("Error", "Could not remove the background.");
		} finally {
			setIsLoading(false);
		}
	};

	const useDesign = () => {
		if (!cleanedImage) {
			Alert.alert("No cleaned design", "Please remove the background first.");
			return;
		}

		setSavedDesignImage(cleanedImage);
		router.push("/create-clothing");
	};

	return (
		<View style={styles.screenContainer}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.push("/create-clothing")}>
				<Text style={styles.backArrow}>←</Text>
			</TouchableOpacity>

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<Text style={styles.title}>Preview design</Text>

				<TouchableOpacity style={styles.imageArea} onPress={pickDesignImage}>
					{isLoading && <ActivityIndicator size="large" color="#6E6E6E" />}

					{!isLoading && designImage && <Image source={{ uri: designImage }} style={styles.preview} />}

					{!isLoading && !designImage && <Text style={styles.uploadText}>Choose design image</Text>}
				</TouchableOpacity>

				<Text style={styles.infoText}>This design will be applied to your item</Text>

				<TouchableOpacity style={styles.button} onPress={removeBackground}>
					<Text style={styles.buttonText}>{isLoading ? "Removing..." : "Try on"}</Text>
				</TouchableOpacity>

				{cleanedImage && (
					<TouchableOpacity style={styles.useDesignButton} onPress={useDesign}>
						<Text style={styles.useDesignText}>Use design</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screenContainer: {
		flex: 1,
		backgroundColor: "#FFFFFF",
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

	scrollView: {
		flex: 1,
	},

	scrollContent: {
		paddingHorizontal: 24,
		paddingTop: 110,
		paddingBottom: 40,
	},

	title: {
		textAlign: "center",
		fontSize: 22,
		color: "#1E1E1E",
		fontWeight: "700",
		marginBottom: 60,
	},

	imageArea: {
		width: "100%",
		height: 300,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 60,
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
		marginBottom: 80,
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
	},

	buttonText: {
		fontSize: 18,
		color: "#6E6E6E",
		letterSpacing: 1,
		textAlign: "center",
		fontWeight: "700",
	},

	useDesignButton: {
		backgroundColor: "#1E1E1E",
		borderRadius: 10,
		height: 58,
		width: "82%",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 14,
	},

	useDesignText: {
		fontSize: 18,
		color: "#FFFFFF",
		letterSpacing: 1,
		textAlign: "center",
		fontWeight: "700",
	},
});
