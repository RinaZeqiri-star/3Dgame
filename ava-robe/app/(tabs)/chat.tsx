import { View, Text, StyleSheet } from "react-native";

export default function WardrobeScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>chat</Text>
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
		color: "#B6FF3B",
		fontSize: 28,
	},
});
