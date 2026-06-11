import ClothingViewer from "@/components/ClothingViewer";
import { getClothingById, SavedClothing } from "@/utils/clothingStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const DESIGN_PREVIEW_RATIO = 110 / 280;

export default function ClothingDetailScreen() {
	const router = useRouter();
	const { itemId } = useLocalSearchParams<{ itemId: string }>();

	const [item, setItem] = useState<SavedClothing | null>(null);

	useEffect(() => {
		const load = async () => {
			const storedUser = await AsyncStorage.getItem("user");

			if (!storedUser || !itemId) return;

			const user = JSON.parse(storedUser);
			const uid = user._id || user.id;

			const loaded = await getClothingById(uid, String(itemId));

			if (loaded) {
				setItem(loaded);
			}
		};

		load();
	}, [itemId]);

	const co2SavedPct = item?.co2SavedPct ?? 0;
	const waterSavedPct = item?.waterSavedPct ?? 0;

	const category = item?.clothingType?.trim() || item?.category || "-";
	const madeIn = item?.madeIn?.trim() || "-";
	const timesWorn = item?.timesWorn ?? 0;

	// Build the preview content separately so we don't have a nested ternary
	// in JSX (snapshot → image; otherwise 3D viewer; otherwise nothing).
	let previewContent: ReactNode = null;
	if (item?.snapshotImage) {
		previewContent = <Image source={{ uri: item.snapshotImage }} style={styles.previewImage} resizeMode="contain" />;
	} else if (item) {
		previewContent = (
			<View style={styles.viewerWrapper}>
				<ClothingViewer clothingId={item.clothingId} category={item.category} color={item.color} previewMode />
			</View>
		);
	}

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
			<Pressable
				onPress={() => {
					if (router.canGoBack()) router.back();
					else router.replace("/wardrobe2");
				}}
				style={styles.backButton}
			>
				<Text style={styles.backArrow}>←</Text>
			</Pressable>

			<View style={styles.previewBox}>
				{previewContent}

				{item?.designImage ? (
					<Image
						source={{ uri: item.designImage }}
						style={[
							styles.designImage,
							{
								transform: [{ translateX: (item.designX ?? 0) * DESIGN_PREVIEW_RATIO }, { translateY: (item.designY ?? 0) * DESIGN_PREVIEW_RATIO }, { scale: item.designScale ?? 1 }],
							},
						]}
						resizeMode="contain"
					/>
				) : null}
			</View>

			<View style={styles.card}>
				<Text style={styles.cardLabel}>Category:</Text>
				<Text style={styles.cardValue}>{category}</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardLabel}>Made in:</Text>
				<Text style={styles.cardValue}>{madeIn}</Text>
			</View>

			<View style={[styles.card, styles.inlineCard]}>
				<Text style={styles.cardLabel}>How many times worn:</Text>
				<Text style={styles.cardValueInline}>{timesWorn}</Text>
			</View>

			<View style={styles.metricBox}>
				<Text style={styles.metricLabel}>CO₂ saved: {co2SavedPct}%</Text>
				<View style={styles.metricRow}>
					<Text style={styles.metricIcon}>🌿</Text>
					<View style={styles.barTrack}>
						<View style={[styles.barFill, styles.co2Fill, { width: `${co2SavedPct}%` }]} />
					</View>
				</View>

				<Text style={[styles.metricLabel, styles.metricLabelSpaced]}>Water usage saved: {waterSavedPct}%</Text>
				<View style={styles.metricRow}>
					<Text style={styles.metricIcon}>💧</Text>
					<View style={styles.barTrack}>
						<View style={[styles.barFill, styles.waterFill, { width: `${waterSavedPct}%` }]} />
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},

	scrollContent: {
		paddingHorizontal: 28,
		paddingTop: 50,
		paddingBottom: 60,
	},

	backButton: {
		marginBottom: 6,
	},

	backArrow: {
		fontSize: 42,
		color: "#6E6E6E",
	},

	previewBox: {
		width: "100%",
		height: 280,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 26,
		position: "relative",
		overflow: "hidden",
	},

	previewImage: {
		width: "100%",
		height: "100%",
	},

	viewerWrapper: {
		width: "100%",
		height: "100%",
	},

	designImage: {
		position: "absolute",
		width: 75,
		height: 75,
		top: 110,
		zIndex: 3,
	},

	card: {
		backgroundColor: "#EFEFEF",
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 18,
		marginBottom: 14,
	},

	inlineCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},

	cardLabel: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
		marginBottom: 4,
	},

	cardValue: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
	},

	cardValueInline: {
		fontSize: 15,
		fontWeight: "700",
		color: "#1E1E1E",
		marginLeft: 6,
	},

	metricBox: {
		backgroundColor: "#EFEFEF",
		borderRadius: 14,
		paddingVertical: 18,
		paddingHorizontal: 18,
		marginTop: 4,
	},

	metricLabel: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E1E1E",
		marginBottom: 10,
	},

	metricLabelSpaced: {
		marginTop: 14,
	},

	metricRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},

	metricIcon: {
		fontSize: 22,
	},

	barTrack: {
		flex: 1,
		height: 18,
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
		overflow: "hidden",
	},

	barFill: {
		height: "100%",
		borderRadius: 10,
	},

	co2Fill: {
		backgroundColor: "#B8D24F",
	},

	waterFill: {
		backgroundColor: "#6A8FCF",
	},
});
