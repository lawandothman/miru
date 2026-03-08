import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import {
	Stack,
	useNavigationContainerRef,
	useRouter,
	useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
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
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { getDevicePushToken, getNotificationRoute } from "@/lib/notifications";
import { Sentry, navigationIntegration } from "@/lib/sentry";

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
	const { data: session, isPending: sessionPending } = useSession();
	const segments = useSegments();
	const router = useRouter();
	const registerPushToken = trpc.notification.registerPushToken.useMutation();

	const { data: onboardingState, isPending: onboardingPending } =
		trpc.onboarding.getState.useQuery(undefined, {
			enabled: Boolean(session),
		});

	const onboardingResolved = !session || !onboardingPending;
	const isPending = sessionPending || !onboardingResolved;

	useEffect(() => {
		if (session?.user) {
			Sentry.setUser({
				id: session.user.id,
				email: session.user.email,
				username: session.user.name,
			});
			return;
		}

		Sentry.setUser(null);
	}, [session]);

	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				const route = getNotificationRoute(
					response.notification.request.content.data,
				);

				if (route) {
					router.push(route);
				}
			},
		);

		return () => subscription.remove();
	}, [router]);

	useEffect(() => {
		let cancelled = false;
		const user = session?.user;

		async function syncPushToken() {
			if (!user) {
				return;
			}

			try {
				const result = await getDevicePushToken({ promptForPermission: false });

				if (cancelled || !result.token) {
					return;
				}

				await registerPushToken.mutateAsync({
					platform: Platform.OS === "ios" ? "ios" : "android",
					token: result.token,
				});
			} catch {
				// Ignore token sync failures until a later app session or settings update.
			}
		}

		syncPushToken().catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, [registerPushToken, session?.user]);

	useEffect(() => {
		if (isPending) {
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";
		const inOnboardingGroup = segments[0] === "(onboarding)";
		const onboardingCompleted = onboardingState?.isCompleted;

		if (!session && !inAuthGroup) {
			router.replace("/(auth)/sign-in");
		} else if (session && onboardingCompleted === false && !inOnboardingGroup) {
			router.replace("/(onboarding)");
		} else if (
			session &&
			onboardingCompleted === true &&
			(inAuthGroup || inOnboardingGroup)
		) {
			router.replace("/(tabs)");
		}

		if (!isRunningInExpoGo()) {
			SplashScreen.hideAsync();
		}
	}, [session, isPending, onboardingState, segments, router]);

	if (isPending) {
		return null;
	}

	// oxlint-disable-next-line jsx-no-useless-fragment
	return <>{children}</>;
}

function RootLayout() {
	const [fontsLoaded] = useFonts({
		DMSans_400Regular,
		DMSans_500Medium,
		DMSans_600SemiBold,
		DMSans_700Bold,
		Syne_400Regular,
		Syne_600SemiBold,
		Syne_700Bold,
	});
	const navigationRef = useNavigationContainerRef();

	useEffect(() => {
		navigationIntegration.registerNavigationContainer(navigationRef);
	}, [navigationRef]);

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

export default Sentry.wrap(RootLayout);
