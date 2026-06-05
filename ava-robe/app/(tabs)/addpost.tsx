import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const showAlert = (message: string) => {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		window.alert(message);
	} else {
		Alert.alert(message);
	}
};

const API_URL = "http://192.168.129.8:5000";

export default function AddPostScreen() {
	const router = useRouter();

	const [mediaUris, setMediaUris] = useState<string[]>([]);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	useFocusEffect(
		useCallback(() => {
			setMediaUris([]);
			setTitle("");
			setDescription("");
		}, []),
	);

	const pickMedia = async () => {
		try {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert("Permission needed", "We need access to your photos to add media.");
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images", "videos"],
				allowsMultipleSelection: true,
				selectionLimit: 20,
				quality: 1,
			});

			if (!result.canceled) {
				const selectedUris = result.assets.map((asset) => asset.uri);

				setMediaUris((currentMedia) => {
					const allMedia = [...currentMedia, ...selectedUris];
					return allMedia.slice(0, 20);
				});
			}
		} catch (error) {
			console.log("[addpost] pickMedia error:", error);
			Alert.alert("Error", "Could not open the photo library.");
		}
	};

	const uploadMedia = async () => {
		const formData = new FormData();

		for (let index = 0; index < mediaUris.length; index++) {
			const uri = mediaUris[index];

			const lastDot = uri.lastIndexOf(".");
			const ext = lastDot >= 0 ? uri.slice(lastDot + 1).toLowerCase().split("?")[0] : "jpg";
			const mime = ext === "png" ? "image/png" : ext === "mp4" || ext === "mov" ? `video/${ext}` : "image/jpeg";

			if (Platform.OS === "web") {
				const fileResponse = await fetch(uri);
				const blob = await fileResponse.blob();
				formData.append("media", blob, `recycle-media-${index}.${ext}`);
			} else {
				formData.append("media", {
					uri,
					name: `recycle-media-${index}.${ext}`,
					type: mime,
				} as any);
			}
		}

		const response = await fetch(`${API_URL}/upload-recycle-media`, {
			method: "POST",
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "Media upload failed");
		}

		return data.mediaUrls;
	};

	const createPost = async () => {
		if (!title || !description || mediaUris.length === 0) {
			Alert.alert("Error", "Please add pictures/videos, title and description.");
			return;
		}

		try {
			const storedUser = await AsyncStorage.getItem("user");

			if (!storedUser) {
				Alert.alert("Error", "No user found. Please login again.");
				return;
			}

			const user = JSON.parse(storedUser);
			const uploadedMediaUrls = await uploadMedia();

			const response = await fetch(`${API_URL}/recycle-posts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					description,
					mediaUris: uploadedMediaUrls,
					username: user.instagram || user.name,
				}),
			});

			if (response.ok) {
				let coinsEarned = false;

				try {
					const coinsResponse = await fetch(`${API_URL}/coins/add`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userId: user._id,
							amount: 20,
							reason: "recycle_post",
						}),
					});

					if (coinsResponse.ok) {
						const coinsData = await coinsResponse.json();

						const updatedUser = {
							...user,
							coins: coinsData.newBalance,
							totalEarned: coinsData.newTotalEarned,
						};
						await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

						coinsEarned = true;

						if (coinsData.milestoneUnlocked) {
							console.log(`Milestone ${coinsData.milestoneNumber} reached!`);
						}
					}
				} catch (coinsError) {
					console.log("Could not add coins", coinsError);
				}

				if (coinsEarned) {
					showAlert("+20 coins earned!");
				}

				router.replace("/recycle");
			} else {
				Alert.alert("Error", "Could not create post.");
			}
		} catch (error) {
			Alert.alert("Error", "Could not upload post.");
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
				{mediaUris.map((uri, index) => (
					<View key={`${uri}-${index}`} style={styles.mediaPreviewContainer}>
						<Image source={{ uri }} style={styles.mediaPreview} />

						{index === 0 && (
							<View style={styles.mainBadge}>
								<Text style={styles.mainBadgeText}>Main</Text>
							</View>
						)}
					</View>
				))}

				{mediaUris.length < 20 && (
					<Pressable style={styles.addMoreBox} onPress={pickMedia}>
						<Text style={styles.addMorePlus}>+</Text>
					</Pressable>
				)}
			</ScrollView>

			{mediaUris.length > 0 && <Text style={styles.mediaCount}>{mediaUris.length}/20 file(s) selected</Text>}

			<Text style={styles.label}>Titel:</Text>
			<TextInput style={styles.input} value={title} onChangeText={setTitle} />

			<Text style={styles.label}>Discribe the pictures/videos</Text>
			<TextInput style={styles.textArea} value={description} onChangeText={setDescription} multiline />

			<Pressable style={styles.postButton} onPress={createPost}>
				<Text style={styles.postText}>post</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 28,
		paddingTop: 35,
		paddingBottom: 40,
		minHeight: "100%",
	},

	mediaRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingRight: 20,
		marginBottom: 14,
	},

	mediaPreviewContainer: {
		width: 140,
		height: 190,
		borderRadius: 14,
		overflow: "hidden",
		marginRight: 14,
		borderWidth: 1.5,
		borderColor: "#000000",
		position: "relative",
		backgroundColor: "#FFFFFF",
	},

	mediaPreview: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},

	mainBadge: {
		position: "absolute",
		left: 8,
		bottom: 8,
		backgroundColor: "#FFFFFF",
		borderRadius: 14,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},

	mainBadgeText: {
		fontSize: 13,
		color: "#6E6E6E",
		fontWeight: "700",
	},

	addMoreBox: {
		width: 140,
		height: 190,
		borderRadius: 14,
		borderWidth: 1.5,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},

	addMorePlus: {
		fontSize: 60,
		fontWeight: "200",
		color: "#000000",
	},

	mediaCount: {
		fontSize: 13,
		color: "#6E6E6E",
		marginBottom: 22,
		textAlign: "center",
	},

	label: {
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 10,
		color: "#1E1E1E",
	},

	input: {
		height: 38,
		borderWidth: 1.2,
		borderColor: "#000000",
		borderRadius: 10,
		paddingHorizontal: 12,
		fontSize: 16,
		marginBottom: 28,
	},

	textArea: {
		height: 145,
		borderWidth: 1.2,
		borderColor: "#000000",
		borderRadius: 10,
		padding: 12,
		fontSize: 16,
		textAlignVertical: "top",
		marginBottom: 24,
	},

	postButton: {
		height: 38,
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.18,
		shadowRadius: 4,
		elevation: 4,
	},

	postText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#6E6E6E",
	},
});
