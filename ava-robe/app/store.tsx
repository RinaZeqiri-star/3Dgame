import { BACKGROUNDS } from "@/utils/backgrounds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

const API_URL = "http://192.168.129.8:5000";

type StoreUser = {
	_id: string;
	coins: number;
	totalEarned: number;
	ownedBackgrounds: string[];
	currentBackground: string | null;
	claimedMilestones: number[];
	[key: string]: any;
};

export default function StoreScreen() {
	const router = useRouter();

	const [user, setUser] = useState<StoreUser | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	useFocusEffect(
		useCallback(() => {
			const loadUser = async () => {
				const storedUser = await AsyncStorage.getItem("user");

				if (!storedUser) {
					setUser(null);
					return;
				}

				setUser(JSON.parse(storedUser));
			};

			loadUser();
		}, []),
	);

	const currentBg = BACKGROUNDS[currentIndex];
	const isOwned = user?.ownedBackgrounds?.includes(currentBg.id) ?? false;
	const isActive = user?.currentBackground === currentBg.id;

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? BACKGROUNDS.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === BACKGROUNDS.length - 1 ? 0 : prev + 1));
	};

	const persistUser = async (updated: StoreUser) => {
		setUser(updated);
		await AsyncStorage.setItem("user", JSON.stringify(updated));
	};

	const handleBuy = async () => {
		if (!user || isProcessing) return;

		if (user.coins < currentBg.price) {
			Alert.alert("Not enough coins", "Earn more coins to unlock this background.");
			return;
		}

		try {
			setIsProcessing(true);

			const response = await fetch(`${API_URL}/backgrounds/buy`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					backgroundId: currentBg.id,
					price: currentBg.price,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				Alert.alert("Error", data.error || "Could not buy background.");
				return;
			}

			await persistUser({ ...user, ...data.user });
		} catch (err) {
			Alert.alert("Error", "Could not buy background.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleApply = async () => {
		if (!user || isProcessing || isActive) return;

		try {
			setIsProcessing(true);

			const response = await fetch(`${API_URL}/backgrounds/apply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					backgroundId: currentBg.id,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				Alert.alert("Error", data.error || "Could not apply background.");
				return;
			}

			await persistUser({ ...user, ...data.user });
		} catch (err) {
			Alert.alert("Error", "Could not apply background.");
		} finally {
			setIsProcessing(false);
		}
	};

	const renderCenterControl = () => {
		if (!isOwned) {
			return (
				<Pressable style={styles.priceButton} onPress={handleBuy} disabled={isProcessing}>
					<Text style={styles.priceCoin}>🪙</Text>
					<Text style={styles.priceText}>{currentBg.price}</Text>
				</Pressable>
			);
		}

		if (isActive) {
			return (
				<View style={[styles.actionButton, styles.appliedButton]}>
					<Text style={styles.actionText}>Applied</Text>
				</View>
			);
		}

		return (
			<Pressable style={styles.actionButton} onPress={handleApply} disabled={isProcessing}>
				<Text style={styles.actionText}>Apply</Text>
			</Pressable>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.coinBalance}>
				<Text style={styles.coinIcon}>🪙</Text>
				<Text style={styles.coinText}>{user?.coins ?? 0}</Text>
			</View>

			<Pressable onPress={() => router.push("/homepage")} style={styles.backButton}>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<Text style={styles.title}>STORE SHOP</Text>

			<Text style={styles.description}>Earn coins by recycling clothes, posting outfits, rewearing items and completing eco challenges to unlock new aesthetic backgrounds.</Text>

			<View style={styles.card}>
				<View style={styles.previewWrapper}>
					<Image source={currentBg.image} style={styles.previewImage} resizeMode="cover" />

					{!isOwned && (
						<View style={styles.lockOverlay}>
							<Text style={styles.lockIcon}>🔒</Text>
						</View>
					)}
				</View>

				<View style={styles.controlsRow}>
					<Pressable style={styles.arrowButton} onPress={handlePrev}>
						<Text style={styles.arrowText}>◀</Text>
					</Pressable>

					{renderCenterControl()}

					<Pressable style={styles.arrowButton} onPress={handleNext}>
						<Text style={styles.arrowText}>▶</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 24,
		paddingTop: 50,
	},

	coinBalance: {
		position: "absolute",
		top: 50,
		right: 28,
		flexDirection: "row",
		alignItems: "center",
		zIndex: 2,
	},

	coinIcon: {
		fontSize: 24,
		marginRight: 8,
	},

	coinText: {
		fontSize: 20,
		fontWeight: "800",
		color: "#000000",
	},

	backButton: {
		position: "absolute",
		top: 105,
		left: 24,
		zIndex: 2,
	},

	backArrow: {
		fontSize: 44,
		color: "#6E6E6E",
	},

	title: {
		fontSize: 28,
		fontWeight: "800",
		color: "#000000",
		textAlign: "center",
		marginTop: 110,
		letterSpacing: 1.2,
	},

	description: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1E1E1E",
		marginTop: 22,
		marginBottom: 28,
		lineHeight: 20,
	},

	card: {
		borderWidth: 4,
		borderColor: "#1E1E1E",
		borderRadius: 18,
		padding: 18,
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.28,
		shadowRadius: 8,
		elevation: 6,
	},

	previewWrapper: {
		width: "100%",
		aspectRatio: 1,
		borderRadius: 14,
		backgroundColor: "#F2F2F2",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		position: "relative",
	},

	previewImage: {
		width: "90%",
		height: "90%",
		borderRadius: 10,
	},

	lockOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},

	lockIcon: {
		fontSize: 50,
	},

	controlsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 22,
		paddingHorizontal: 6,
	},

	arrowButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},

	arrowText: {
		fontSize: 14,
		color: "#1E1E1E",
	},

	priceButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
		minWidth: 120,
	},

	priceCoin: {
		fontSize: 20,
		marginRight: 8,
	},

	priceText: {
		fontSize: 18,
		fontWeight: "800",
		color: "#000000",
	},

	actionButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderWidth: 1.4,
		borderColor: "#1E1E1E",
		borderRadius: 10,
		backgroundColor: "#1E1E1E",
		minWidth: 120,
		alignItems: "center",
	},

	actionText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
		letterSpacing: 0.5,
	},

	appliedButton: {
		backgroundColor: "#5BC270",
		borderColor: "#5BC270",
	},
});
