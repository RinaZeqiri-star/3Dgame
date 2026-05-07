import { View, Text, StyleSheet } from "react-native";

export default function HomepageScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Homepage</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		alignItems: "center",
	},

	title: {
		fontSize: 28,
		fontWeight: "bold",
	},
});
