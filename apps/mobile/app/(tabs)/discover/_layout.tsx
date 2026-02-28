import { Stack } from "expo-router";
import { Colors, fontFamily } from "@/lib/constants";

export default function DiscoverLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: Colors.background },
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen
				name="search"
				options={{
					headerShown: true,
					headerStyle: { backgroundColor: Colors.background },
					headerTintColor: Colors.foreground,
					headerTitleStyle: { fontFamily: fontFamily.displayBold },
					headerBackButtonDisplayMode: "minimal",
				}}
			/>
		</Stack>
	);
}
