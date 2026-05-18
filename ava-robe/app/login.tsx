import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API_URL = "http://192.168.129.8:5000";

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Email and password are required");
			return;
		}

		try {
			const response = await fetch(`${API_URL}/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				await AsyncStorage.setItem("user", JSON.stringify(data.user));

				Alert.alert("Success", "Login successful!");
				router.replace("/homepage");
			} else {
				Alert.alert("Error", data.error || "Login failed");
			}
		} catch (error) {
			Alert.alert("Error", "Could not connect to server. Check IP and backend status.");
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<Text style={styles.title}>Login</Text>

				<TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6E6E6E" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

				<TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6E6E6E" value={password} onChangeText={setPassword} secureTextEntry />

				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.push("/signup")}>
					<Text style={styles.linkText}>Don't have an account? Sign Up</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		paddingHorizontal: 28,
	},

	formContainer: {
		backgroundColor: "#FFFFFF",
	},

	title: {
		fontSize: 32,
		color: "#000000",
		marginBottom: 40,
		textAlign: "center",
		fontWeight: "700",
	},

	input: {
		backgroundColor: "#FFFFFF",
		color: "#000000",
		padding: 16,
		borderRadius: 10,
		marginBottom: 18,
		borderWidth: 1,
		borderColor: "#000000",
		fontSize: 16,
	},

	button: {
		backgroundColor: "#000000",
		borderRadius: 10,
		height: 58,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
		marginBottom: 22,

		borderWidth: 1,
		borderColor: "#000000",

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.12,
		shadowRadius: 6,

		elevation: 5,
	},

	buttonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 1,
	},

	linkText: {
		color: "#6E6E6E",
		textAlign: "center",
		fontSize: 15,
	},
});
