import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomepageScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Homepage</Text>

			<TouchableOpacity style={styles.button} onPress={() => router.push("/wardrobe")}>
				<Text style={styles.buttonText}>Go to wardrobe</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},

	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 40,
		color: "#1E1E1E",
	},

	button: {
		backgroundColor: "#FCC9D9",
		borderRadius: 10,
		height: 58,
		width: "82%",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#E9B5C4",
	},

	buttonText: {
		fontSize: 18,
		color: "#6E6E6E",
		fontWeight: "700",
	},
});
