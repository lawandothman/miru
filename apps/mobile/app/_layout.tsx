import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { isRunningInExpoGo } from "expo";
import { focusManager } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
	DMSans_400Regular,
	DMSans_500Medium,
	DMSans_600SemiBold,
	DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
	Syne_400Regular,
	Syne_600SemiBold,
	Syne_700Bold,
} from "@expo-google-fonts/syne";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TRPCProvider } from "@/lib/trpc-provider";
import { useSession } from "@/lib/auth";

if (!isRunningInExpoGo()) {
	SplashScreen.preventAutoHideAsync();
}

focusManager.setEventListener((handleFocus) => {
	const subscription = AppState.addEventListener("change", (state) => {
		handleFocus(state === "active");
	});
	return () => subscription.remove();
});

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (isPending) {
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";
		if (!session && !inAuthGroup) {
			router.replace("/(auth)/sign-in");
		} else if (session && inAuthGroup) {
			router.replace("/(tabs)");
		}

		if (!isRunningInExpoGo()) {
			SplashScreen.hideAsync();
		}
	}, [session, isPending, segments, router]);

	if (isPending) {
		return null;
	}

	// oxlint-disable-next-line jsx-no-useless-fragment
	return <>{children}</>;
}

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		DMSans_400Regular,
		DMSans_500Medium,
		DMSans_600SemiBold,
		DMSans_700Bold,
		Syne_400Regular,
		Syne_600SemiBold,
		Syne_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<TRPCProvider>
				<AuthGuard>
					{/* oxlint-disable-next-line style-prop-object */}
					<StatusBar style="light" />
					<Stack
						screenOptions={{
							headerShown: false,
							headerBackButtonDisplayMode: "minimal",
						}}
					/>
				</AuthGuard>
			</TRPCProvider>
		</SafeAreaProvider>
	);
}
