import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const API_URL = "http://192.168.129.8:5000";

type RecyclePost = {
	_id: string;
	title: string;
	description: string;
	mediaUris: string[];
	username: string;
};

export default function RecycleScreen() {
	const router = useRouter();
	const [posts, setPosts] = useState<RecyclePost[]>([]);
	const [search, setSearch] = useState("");

	const fetchPosts = async () => {
		try {
			const response = await fetch(`${API_URL}/recycle-posts`);
			const data = await response.json();
			setPosts(data);
		} catch (error) {
			console.log("Could not fetch recycle posts", error);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));

	return (
		<View style={styles.container}>
			<View style={styles.searchBar}>
				<Pressable onPress={() => router.push("/addpost")}>
					<Text style={styles.plus}>+</Text>
				</Pressable>

				<TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="" />

				<Text style={styles.searchIcon}>⌕</Text>
			</View>

			<ScrollView contentContainerStyle={styles.grid}>
				{filteredPosts.map((post) => (
					<Pressable key={post._id} style={styles.card}>
						<Text style={styles.cardTitle}>{post.title}</Text>

						{post.mediaUris?.[0] && !post.mediaUris[0].startsWith("blob:") && <Image source={{ uri: post.mediaUris[0] }} style={styles.cardImage} resizeMode="cover" />}

						<Text style={styles.username}>{post.username}</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingTop: 65,
		paddingHorizontal: 26,
	},

	searchBar: {
		height: 60,
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 10,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 18,
		marginBottom: 30,
	},

	plus: {
		fontSize: 34,
		fontWeight: "500",
		marginRight: 12,
	},

	searchInput: {
		flex: 1,
		height: "100%",
		fontSize: 16,
	},

	searchIcon: {
		fontSize: 38,
		transform: [{ rotate: "-15deg" }],
	},

	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		paddingBottom: 40,
	},

	card: {
		width: "47%",
		minHeight: 245,
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 10,
		padding: 14,
		marginBottom: 28,
	},

	cardTitle: {
		fontSize: 17,
		fontWeight: "700",
		marginBottom: 10,
	},

	cardImage: {
		width: "100%",
		height: 145,
		marginBottom: 8,
	},

	username: {
		fontSize: 13,
		fontWeight: "700",
		marginTop: "auto",
	},
});
