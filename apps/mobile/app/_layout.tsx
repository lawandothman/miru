import {
	DMSans_400Regular,
	DMSans_500Medium,
	DMSans_600SemiBold,
	DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
	PlusJakartaSans_400Regular,
	PlusJakartaSans_600SemiBold,
	PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import {
	Stack,
	useNavigationContainerRef,
	useRouter,
	useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import { useScreenTracking } from "@/hooks/use-screen-tracking";
import { posthog } from "@/lib/analytics";
import { useSession } from "@/lib/auth";
import {
	getDevicePushToken,
	getNotificationPermissionsStatus,
	getNotificationRoute,
} from "@/lib/notifications";
import { navigationIntegration, Sentry } from "@/lib/sentry";
import { trpc } from "@/lib/trpc";
import { TRPCProvider } from "@/lib/trpc-provider";

if (!isRunningInExpoGo()) {
	SplashScreen.preventAutoHideAsync();
}

const pushPlatform =
	Platform.OS === "ios" ? ("ios" as const) : ("android" as const);

function AuthGuard({ children }: { children: React.ReactNode }) {
	useScreenTracking();
	const { data: session, isPending: sessionPending } = useSession();
	const segments = useSegments();
	const router = useRouter();
	const { mutateAsync: registerPushToken } =
		trpc.notification.registerPushToken.useMutation();
	const promptedForPushPermissionUserId = useRef<string | null>(null);

	const { data: onboardingState } = trpc.onboarding.getState.useQuery(
		undefined,
		{ enabled: Boolean(session) },
	);

	const hasLocalSession = Boolean(session);
	// Trust the cached session from SecureStore to skip waiting for network
	// revalidation. If the session is invalid, the tRPC 401 handler will
	// redirect to sign-in. Onboarding state resolves in the background and
	// redirects if needed (rare for returning users).
	const isPending = !hasLocalSession && sessionPending;

	useEffect(() => {
		if (session?.user) {
			Sentry.setUser({
				id: session.user.id,
				email: session.user.email,
				username: session.user.name,
			});
			posthog?.identify(session.user.id, {
				name: session.user.name,
				email: session.user.email,
			});
			return;
		}

		Sentry.setUser(null);
		posthog?.reset();
	}, [session]);

	useEffect(() => {
		Notifications.setBadgeCountAsync(0).catch(() => undefined);

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				Notifications.setBadgeCountAsync(0).catch(() => undefined);
			}
		});

		return () => subscription.remove();
	}, []);

	useEffect(() => {
		Notifications.getLastNotificationResponseAsync()
			.then((response) => {
				const route = getNotificationRoute(
					response?.notification.request.content.data,
				);

				if (route) {
					router.push(route);
				}
			})
			.catch(() => undefined);

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

				await registerPushToken({
					platform: pushPlatform,
					token: result.token,
				});
			} catch {
				// Ignore token sync failures until a later app session or settings update.
			}
		}

		syncPushToken();

		return () => {
			cancelled = true;
		};
	}, [session?.user]);

	useEffect(() => {
		let cancelled = false;
		const user = session?.user;
		const onboardingCompleted = onboardingState?.isCompleted;

		async function promptForPushPermission() {
			if (
				!user ||
				onboardingCompleted !== true ||
				isPending ||
				isRunningInExpoGo() ||
				segments[0] === "(auth)" ||
				segments[0] === "(onboarding)" ||
				promptedForPushPermissionUserId.current === user.id
			) {
				return;
			}

			const status = await getNotificationPermissionsStatus();
			if (status !== Notifications.PermissionStatus.UNDETERMINED) {
				promptedForPushPermissionUserId.current = user.id;
				return;
			}

			promptedForPushPermissionUserId.current = user.id;

			try {
				const result = await getDevicePushToken({ promptForPermission: true });

				if (cancelled || !result.token) {
					return;
				}

				await registerPushToken({
					platform: pushPlatform,
					token: result.token,
				});
			} catch {
				// Ignore permission prompt failures and let settings manage retries.
			}
		}

		promptForPushPermission();

		return () => {
			cancelled = true;
		};
	}, [isPending, onboardingState?.isCompleted, segments, session?.user]);

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

		const canHideSplash = !session || onboardingCompleted !== undefined;
		if (!isRunningInExpoGo() && canHideSplash) {
			SplashScreen.hideAsync();
		}
	}, [session, isPending, onboardingState, segments, router]);

	if (isPending || (session && onboardingState === undefined)) {
		return null;
	}

	return <>{children}</>;
}

function RootLayout() {
	const [fontsLoaded] = useFonts({
		DMSans_400Regular,
		DMSans_500Medium,
		DMSans_600SemiBold,
		DMSans_700Bold,
		PlusJakartaSans_400Regular,
		PlusJakartaSans_600SemiBold,
		PlusJakartaSans_700Bold,
	});
	const navigationRef = useNavigationContainerRef();

	useEffect(() => {
		navigationIntegration.registerNavigationContainer(navigationRef);
	}, [navigationRef]);

	if (!fontsLoaded) {
		return null;
	}

	const content = (
		<SafeAreaProvider initialMetrics={initialWindowMetrics}>
			<TRPCProvider>
				<AuthGuard>
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

	if (!posthog) {
		return content;
	}

	return (
		<PostHogProvider client={posthog} autocapture={{ captureScreens: false }}>
			{content}
		</PostHogProvider>
	);
}

export default Sentry.wrap(RootLayout);
