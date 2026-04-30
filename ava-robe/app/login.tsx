import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const API_URL = "http://162.120.188.182:5000";

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
				Alert.alert("Success", "Login successful!");
				router.replace("/(tabs)");
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

				<TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.5)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

				<TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.5)" value={password} onChangeText={setPassword} secureTextEntry />

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
		backgroundColor: "#0F172A",
		justifyContent: "center",
		padding: 20,
	},
	formContainer: {
		backgroundColor: "#1E2A5A",
		padding: 20,
		borderRadius: 10,
	},
	title: {
		fontSize: 24,
		color: "#FFFFFF",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#0F172A",
		color: "#FFFFFF",
		padding: 15,
		borderRadius: 5,
		marginBottom: 15,
	},
	button: {
		backgroundColor: "#B6FF3B",
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 15,
	},
	buttonText: {
		color: "#0F172A",
		fontWeight: "bold",
	},
	linkText: {
		color: "#B6FF3B",
		textAlign: "center",
	},
});
