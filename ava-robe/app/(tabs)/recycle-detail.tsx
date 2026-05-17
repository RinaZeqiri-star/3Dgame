import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function RecycleDetailScreen() {
	const router = useRouter();
	const { title, description, username, mediaUris } = useLocalSearchParams();

	const images = mediaUris ? JSON.parse(String(mediaUris)) : [];

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Pressable onPress={() => router.push("/recycle")}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<Text style={styles.username}>{username}</Text>

			<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageSlider}>
				{images.map((uri: string, index: number) => (
					<Image key={`${uri}-${index}`} source={{ uri }} style={styles.image} resizeMode="cover" />
				))}
			</ScrollView>

			<Text style={styles.swipeText}>*Swipe to see the rest of the pictures</Text>

			<Text style={styles.title}>{title}</Text>

			<Text style={styles.description}>{description}</Text>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 30,
		paddingTop: 45,
		paddingBottom: 60,
		minHeight: "100%",
	},

	backArrow: {
		fontSize: 46,
		color: "#6E6E6E",
		marginBottom: 12,
	},

	username: {
		fontSize: 22,
		fontWeight: "700",
		textAlign: "right",
		marginBottom: 18,
		color: "#000000",
	},

	imageSlider: {
		marginBottom: 12,
	},

	image: {
		width: 390,
		height: 390,
		borderRadius: 10,
		marginRight: 16,
	},

	swipeText: {
		fontSize: 13,
		color: "#6E6E6E",
		marginBottom: 70,
	},

	title: {
		fontSize: 23,
		fontWeight: "700",
		marginBottom: 26,
		color: "#1E1E1E",
	},

	description: {
		fontSize: 18,
		fontWeight: "700",
		lineHeight: 25,
		color: "#1E1E1E",
	},
});
