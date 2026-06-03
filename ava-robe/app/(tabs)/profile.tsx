import { resolveMediaUrl } from "@/utils/mediaUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const API_URL = "http://192.168.129.8:5000";

type RecyclePost = {
	_id?: string;
	title?: string;
	mediaUris?: string[];
	username?: string;
	createdAt?: string;
};

export default function ProfileScreen() {
	const router = useRouter();

	const [username, setUsername] = useState("user");
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [clothesPosted, setClothesPosted] = useState<number>(0);
	const [backgroundsUnlocked, setBackgroundsUnlocked] = useState<number>(0);
	const [myPosts, setMyPosts] = useState<RecyclePost[]>([]);

	const loadUser = async () => {
		const storedUser = await AsyncStorage.getItem("user");
		const storedProfileImage = await AsyncStorage.getItem("profileImage");

		if (!storedUser) return;

		const user = JSON.parse(storedUser);
		setUsername(user.instagram || user.name);
		setBackgroundsUnlocked(Array.isArray(user.ownedBackgrounds) ? user.ownedBackgrounds.length : 0);

		if (storedProfileImage) {
			setProfileImage(storedProfileImage);
		}
		try {
			const response = await fetch(`${API_URL}/recycle-posts`);
			if (response.ok) {
				const allPosts = await response.json();
				const myName = user.instagram || user.name;
				const mine: RecyclePost[] = Array.isArray(allPosts) ? allPosts.filter((p: any) => p?.username === myName) : [];
				setClothesPosted(mine.length);
				setMyPosts(mine);
			}
		} catch (err) {
			console.log("[profile] failed to load recycle posts:", err);
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
		<ScrollView style={styles.scrollScreen} contentContainerStyle={styles.container}>
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
					<Text style={styles.number}>{clothesPosted}</Text>
					<Text style={styles.label}>Clothes{"\n"}posted</Text>
				</View>

				<View style={styles.statItem}>
					<Text style={styles.iconGrey}>★</Text>
					<Text style={styles.number}>{backgroundsUnlocked}</Text>
					<Text style={styles.label}>Backgrounds{"\n"}unlocked</Text>
				</View>
			</View>

			<Text style={styles.sectionTitle}>Your posts</Text>
			{myPosts.length === 0 ? (
				<Text style={styles.emptyHint}>You haven&apos;t posted anything yet. Head to Recycle to share a piece.</Text>
			) : (
				<View style={styles.postGrid}>
					{myPosts.map((post) => {
						const firstMedia = post.mediaUris?.[0];
						const imgUri = firstMedia ? resolveMediaUrl(firstMedia) : null;
						return (
							<View key={post._id ?? post.createdAt} style={styles.postTile}>
								{imgUri ? <Image source={{ uri: imgUri }} style={styles.postImage} resizeMode="cover" /> : <View style={styles.postEmpty} />}
							</View>
						);
					})}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollScreen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	container: {
		alignItems: "center",
		paddingTop: 80,
		paddingBottom: 40,
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
		// 2 stats — give each plenty of room.
		width: "48%",
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

	sectionTitle: {
		alignSelf: "flex-start",
		marginLeft: "7%",
		marginTop: 30,
		marginBottom: 14,
		fontSize: 17,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	emptyHint: {
		fontSize: 13,
		color: "#777777",
		fontWeight: "600",
		textAlign: "center",
		paddingHorizontal: 32,
		marginTop: 10,
	},

	postGrid: {
		width: "86%",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 4,
	},

	postTile: {
		width: "32.5%",
		aspectRatio: 1,
		overflow: "hidden",
		backgroundColor: "#F4F0E1",
	},

	postImage: {
		width: "100%",
		height: "100%",
	},

	postEmpty: {
		flex: 1,
		backgroundColor: "#EEE",
	},
});
