import { Stack } from "expo-router";
import { Colors } from "@/lib/constants";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: Colors.background },
			}}
		/>
	);
}
