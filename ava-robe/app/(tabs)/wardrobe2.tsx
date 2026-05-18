import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["T-shirt", "Jackets", "Sweaters", "Pants", "Dress", "Skirts", "Accessories", "Shoes"];

export default function Wardrobe2Screen() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState("T-shirt");

	return (
		<View style={styles.container}>
			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<Pressable style={styles.addButton}>
				<Text style={styles.addText}>+</Text>
			</Pressable>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
				{categories.map((category) => (
					<Pressable key={category} style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]} onPress={() => setSelectedCategory(category)}>
						<Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>{category}</Text>
					</Pressable>
				))}
			</ScrollView>

			<ScrollView contentContainerStyle={styles.grid}>
				{Array.from({ length: 12 }).map((_, index) => (
					<View key={index} style={styles.emptyItem} />
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingTop: 55,
	},

	backButton: {
		position: "absolute",
		top: 45,
		left: 24,
		zIndex: 2,
	},

	backArrow: {
		fontSize: 42,
		color: "#6E6E6E",
	},

	addButton: {
		position: "absolute",
		top: 48,
		right: 28,
		width: 28,
		height: 28,
		borderRadius: 14,
		borderWidth: 1.4,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2,
	},

	addText: {
		fontSize: 24,
		lineHeight: 24,
		color: "#000000",
		textAlign: "center",
		marginTop: -5,
	},

	categoryRow: {
		paddingHorizontal: 18,
		paddingTop: 70,
		paddingBottom: 30,
		gap: 18,
	},

	categoryButton: {
		minWidth: 110,
		height: 44,
		borderRadius: 22,
		borderWidth: 1.4,
		borderColor: "#000000",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 18,
	},

	activeCategoryButton: {
		backgroundColor: "#1E1E1E",
	},

	categoryText: {
		fontSize: 17,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	activeCategoryText: {
		color: "#FFFFFF",
	},

	grid: {
		marginTop: 10,
		flexDirection: "row",
		flexWrap: "wrap",
		borderTopWidth: 1.2,
		borderLeftWidth: 1.2,
		borderColor: "#000000",
	},

	emptyItem: {
		width: "50%",
		height: 130,
		borderRightWidth: 1.2,
		borderBottomWidth: 1.2,
		borderColor: "#000000",
		backgroundColor: "#FFFFFF",
	},
});
