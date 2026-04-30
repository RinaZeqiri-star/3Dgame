import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Profile</Text>

			<View style={styles.card}>
				<Text style={styles.label}>Username</Text>
				<Text style={styles.value}>@rinaZ</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>Email</Text>
				<Text style={styles.value}>rina@example.com</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>Points</Text>
				<Text style={styles.value}>1200 XP</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>CO₂ Saved</Text>
				<Text style={styles.value}>12 kg</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.label}>Water Saved</Text>
				<Text style={styles.value}>250 L</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
		padding: 20,
	},
	title: {
		fontSize: 28,
		color: "#B084FF",
		marginBottom: 20,
	},
	card: {
		backgroundColor: "#1E2A5A",
		padding: 15,
		borderRadius: 12,
		marginBottom: 10,
	},
	label: {
		color: "#B6FF3B",
		fontSize: 12,
	},
	value: {
		color: "#fff",
		fontSize: 16,
	},
});
