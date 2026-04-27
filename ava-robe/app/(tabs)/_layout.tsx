import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#B6FF3B",
				tabBarInactiveTintColor: "#ffffff",
				tabBarStyle: {
					backgroundColor: "#0F172A",
					borderTopColor: "#1E2A5A",
				},
			}}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="wardrobe" options={{ title: "Wardrobe" }} />
			<Tabs.Screen name="recycle" options={{ title: "Recycle" }} />
			<Tabs.Screen name="chat" options={{ title: "Chat" }} />
			<Tabs.Screen name="store" options={{ title: "Store" }} />
			<Tabs.Screen name="profile" options={{ title: "Profile" }} />
		</Tabs>
	);
}
