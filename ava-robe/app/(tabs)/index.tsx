import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>ava•robe</Text>

			<View style={styles.avatarPlaceholder}>
				<Text style={styles.avatarText}>👤</Text>
			</View>

			<Text style={styles.username}>@rinaZ</Text>
			<Text style={styles.subtitle}>Fashion Lover • Planet Saver</Text>

			<View style={styles.buttonContainer}>
				<View style={styles.button}>
					<Text style={styles.buttonText}>Wardrobe</Text>
				</View>

				<View style={styles.button}>
					<Text style={styles.buttonText}>Recycle</Text>
				</View>

				<View style={styles.button}>
					<Text style={styles.buttonText}>Profile</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 28,
		color: "#B084FF",
		marginBottom: 20,
	},
	avatarPlaceholder: {
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: "#1E2A5A",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 15,
	},
	avatarText: {
		fontSize: 50,
	},
	username: {
		color: "#fff",
		fontSize: 20,
		marginBottom: 5,
	},
	subtitle: {
		color: "#B6FF3B",
		fontSize: 14,
	},
	buttonContainer: {
		marginTop: 30,
		width: "80%",
	},

	button: {
		backgroundColor: "#1E2A5A",
		padding: 15,
		borderRadius: 12,
		marginBottom: 10,
		alignItems: "center",
	},

	buttonText: {
		color: "#fff",
		fontSize: 16,
	},
});
