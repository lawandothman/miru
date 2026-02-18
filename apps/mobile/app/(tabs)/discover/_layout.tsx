import { Stack } from "expo-router";
import { Colors } from "@/lib/constants";

export default function DiscoverLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: Colors.background },
			}}
		/>
	);
}
