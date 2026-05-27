import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
	const colorScheme = useColorScheme();

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
				</Stack>

				<StatusBar style="auto" />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
