import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const API_URL = "http://10.2.89.39:5000";

export default function SignupScreen() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [instagram, setInstagram] = useState("");

	const handleSignup = async () => {
		if (!name || !email || !password) {
			Alert.alert("Error", "Name, email and password are required");
			return;
		}

		try {
			const response = await fetch(`${API_URL}/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password, instagram }),
			});

			const data = await response.json();

			if (response.ok) {
				Alert.alert("Success", "Signup successful!");
				-router.replace("/login");
			} else {
				Alert.alert("Error", data.error || "Signup failed");
			}
		} catch (error) {
			Alert.alert("Error", "Could not connect to server. Check IP and backend status.");
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.formContainer}>
				<Text style={styles.title}>Sign Up</Text>

				<TextInput style={styles.input} placeholder="Name" placeholderTextColor="rgba(255,255,255,0.5)" value={name} onChangeText={setName} />

				<TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.5)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

				<TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.5)" value={password} onChangeText={setPassword} secureTextEntry />

				<TextInput style={styles.input} placeholder="Instagram (optional)" placeholderTextColor="rgba(255,255,255,0.5)" value={instagram} onChangeText={setInstagram} />

				<TouchableOpacity style={styles.button} onPress={handleSignup}>
					<Text style={styles.buttonText}>Sign Up</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.push("/login")}>
					<Text style={styles.linkText}>Already have an account? Login</Text>
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
