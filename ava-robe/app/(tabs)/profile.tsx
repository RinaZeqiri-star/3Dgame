import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
	const router = useRouter();

	const [username, setUsername] = useState("user");
	const [profileImage, setProfileImage] = useState<string | null>(null);

	const loadUser = async () => {
		const storedUser = await AsyncStorage.getItem("user");
		const storedProfileImage = await AsyncStorage.getItem("profileImage");

		if (storedUser) {
			const user = JSON.parse(storedUser);
			setUsername(user.instagram || user.name);
		}

		if (storedProfileImage) {
			setProfileImage(storedProfileImage);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadUser();
		}, []),
	);

	const pickProfileImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			setProfileImage(uri);
			await AsyncStorage.setItem("profileImage", uri);
		}
	};

	return (
		<View style={styles.container}>
			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<View style={styles.profileWrapper}>
				<Pressable onPress={pickProfileImage}>
					{profileImage ? (
						<Image source={{ uri: profileImage }} style={styles.profileImage} />
					) : (
						<View style={styles.emptyProfile}>
							<Text style={styles.emptyText}>+</Text>
						</View>
					)}
				</Pressable>

				<Pressable style={styles.smallPlus} onPress={pickProfileImage}>
					<Text style={styles.smallPlusText}>+</Text>
				</Pressable>
			</View>

			<Text style={styles.username}>@{username}</Text>

			<View style={styles.statsBox}>
				<View style={styles.statItem}>
					<Text style={styles.icon}>👕</Text>
					<Text style={styles.number}>12</Text>
					<Text style={styles.label}>Clothes{"\n"}recycled</Text>
				</View>

				<View style={styles.statItem}>
					<Text style={styles.leaf}>♧</Text>
					<Text style={styles.number}>24kg</Text>
					<Text style={styles.label}>CO2{"\n"}saved</Text>
				</View>

				<View style={styles.statItem}>
					<Text style={styles.iconGrey}>★</Text>
					<Text style={styles.number}>5</Text>
					<Text style={styles.label}>Backgrounds{"\n"}unlocked</Text>
				</View>

				<View style={styles.statItem}>
					<Text style={styles.heart}>♥</Text>
					<Text style={styles.number}>27</Text>
					<Text style={styles.label}>Outfits{"\n"}saved</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		paddingTop: 80,
	},

	backButton: {
		position: "absolute",
		top: 48,
		left: 26,
	},

	backArrow: {
		fontSize: 42,
		color: "#6E6E6E",
	},

	profileWrapper: {
		position: "relative",
		marginTop: 20,
	},

	profileImage: {
		width: 190,
		height: 190,
		borderRadius: 95,
	},

	emptyProfile: {
		width: 190,
		height: 190,
		borderRadius: 95,
		borderWidth: 1.5,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},

	emptyText: {
		fontSize: 60,
		color: "#000000",
		fontWeight: "300",
	},

	smallPlus: {
		position: "absolute",
		right: 6,
		bottom: 22,
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 1.4,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},

	smallPlusText: {
		fontSize: 22,
		lineHeight: 22,
		color: "#000000",
		marginTop: -5,
	},

	username: {
		fontSize: 22,
		fontWeight: "700",
		marginTop: 12,
		marginBottom: 28,
		color: "#000000",
	},

	statsBox: {
		width: "86%",
		borderWidth: 1.2,
		borderColor: "#000000",
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 22,
		paddingHorizontal: 18,

		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.14,
		shadowRadius: 5,
		elevation: 4,
		backgroundColor: "#FFFFFF",
	},

	statItem: {
		alignItems: "center",
		width: "24%",
	},

	icon: {
		fontSize: 36,
		marginBottom: 8,
	},

	leaf: {
		fontSize: 40,
		color: "#A9D83E",
		marginBottom: 4,
	},

	iconGrey: {
		fontSize: 38,
		color: "#6E6E6E",
		marginBottom: 7,
	},

	heart: {
		fontSize: 42,
		color: "#FCC9D9",
		marginBottom: 5,
	},

	number: {
		fontSize: 17,
		fontWeight: "700",
		marginBottom: 12,
		color: "#000000",
	},

	label: {
		fontSize: 11,
		fontWeight: "600",
		textAlign: "center",
		color: "#000000",
	},
});
