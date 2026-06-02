import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

const CACHE_CLEANUP_FLAG = "cacheCleanupV1Done";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	useEffect(() => {
		// Older clothes caches stored full base64 snapshotImage/designImage data
		// and blew past localStorage's ~5MB quota, breaking setOutfit. Wipe them
		// once on first launch after the upgrade; future cache writes are lean.
		const cleanup = async () => {
			try {
				const done = await AsyncStorage.getItem(CACHE_CLEANUP_FLAG);
				if (done) return;

				const allKeys = await AsyncStorage.getAllKeys();
				const cacheKeys = allKeys.filter((k) => k.startsWith("clothesCache_"));

				if (cacheKeys.length > 0) {
					await AsyncStorage.multiRemove(cacheKeys);
					console.log("[cleanup] removed bloated clothes caches:", cacheKeys);
				}

				await AsyncStorage.setItem(CACHE_CLEANUP_FLAG, "1");
			} catch (err) {
				console.log("[cleanup] failed:", err);
			}
		};

		cleanup();
	}, []);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />

					<Stack.Screen name="login" options={{ headerShown: false }} />

					<Stack.Screen name="signup" options={{ headerShown: false }} />

					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />

					<Stack.Screen name="create-clothing" options={{ headerShown: false }} />

					<Stack.Screen name="clothing-info" options={{ headerShown: false }} />

					<Stack.Screen name="clothing-detail" options={{ headerShown: false }} />

					<Stack.Screen name="avatar" options={{ headerShown: false }} />

					<Stack.Screen name="my-room" options={{ headerShown: false }} />

					<Stack.Screen name="recommend-outfit" options={{ headerShown: false }} />

					<Stack.Screen name="store" options={{ headerShown: false }} />
				</Stack>

				<StatusBar style="auto" />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
