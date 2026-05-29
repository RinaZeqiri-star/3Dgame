import { useRouter } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomepageScreen() {
	const router = useRouter();

	return (
		<ImageBackground source={require("../../assets/images/homepage-room.png")} style={styles.background} resizeMode="cover">
			<View style={styles.container}>
				<Pressable style={[styles.navButton, styles.wardrobe]} onPress={() => router.push("/wardrobe2")}>
					<Text style={styles.buttonText}>Wardrobe</Text>
				</Pressable>

				<Pressable style={[styles.navButton, styles.myRoom]} onPress={() => router.push("/my-room")}>
					<Text style={styles.buttonText}>My Room</Text>
				</Pressable>

				<Pressable style={[styles.navButton, styles.store]} onPress={() => router.push("/store")}>
					<Text style={styles.buttonText}>Store</Text>
				</Pressable>

				<Pressable style={[styles.navButton, styles.profile]} onPress={() => router.push("/profile")}>
					<Text style={styles.buttonText}>Profile</Text>
				</Pressable>

				<Pressable style={[styles.navButton, styles.avatar]} onPress={() => router.push("/avatar")}>
					<Text style={styles.buttonText}>Avatar</Text>
				</Pressable>

				<Pressable style={[styles.navButton, styles.recycle]} onPress={() => router.push("/recycle")}>
					<Text style={styles.buttonText}>Recycle</Text>
				</Pressable>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
	},

	container: {
		flex: 1,
		position: "relative",
	},

	navButton: {
		position: "absolute",
		backgroundColor: "#FFFFFF",
		borderWidth: 1.5,
		borderColor: "#000000",
		borderRadius: 6,
		paddingVertical: 7,
		paddingHorizontal: 18,
		minWidth: 100,
		alignItems: "center",

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 3,

		elevation: 4,
	},

	buttonText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000000",
	},

	wardrobe: {
		top: 80,
		left: 10,
	},

	myRoom: {
		top: 80,
		right: 10,
	},

	store: {
		top: 255,
		right: 55,
	},

	profile: {
		top: 423,
		left: 70,
	},

	avatar: {
		bottom: 185,
		left: 38,
	},

	recycle: {
		bottom: 70,
		right: 55,
	},
});
