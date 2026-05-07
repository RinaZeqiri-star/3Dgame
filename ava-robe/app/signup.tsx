import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

const API_URL = "http://10.2.88.123:5000";

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
				router.replace("/login");
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

				<TextInput style={styles.input} placeholder="Name" placeholderTextColor="#6E6E6E" value={name} onChangeText={setName} />

				<TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6E6E6E" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

				<TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6E6E6E" value={password} onChangeText={setPassword} secureTextEntry />

				<TextInput style={styles.input} placeholder="Instagram (optional)" placeholderTextColor="#6E6E6E" value={instagram} onChangeText={setInstagram} />

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
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		paddingHorizontal: 28,
	},

	formContainer: {
		backgroundColor: "#FFFFFF",
	},

	title: {
		fontSize: 32,
		color: "#1E1E1E",
		marginBottom: 40,
		textAlign: "center",
		fontWeight: "700",
	},

	input: {
		backgroundColor: "#FFFFFF",
		color: "#1E1E1E",
		padding: 16,
		borderRadius: 10,
		marginBottom: 18,
		borderWidth: 1,
		borderColor: "#FCC9D9",
		fontSize: 16,
	},

	button: {
		backgroundColor: "#FCC9D9",
		borderRadius: 10,
		height: 58,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
		marginBottom: 22,

		borderWidth: 1,
		borderColor: "#E9B5C4",

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
		color: "#6E6E6E",
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
