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
import { useEffect, useRef, useState } from "react";
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

type BootState = "loading" | "signed-out" | "onboarding" | "ready";
type NotificationRoute = NonNullable<ReturnType<typeof getNotificationRoute>>;

function hasCompletedOnboardingInCachedSession(
	session: { user?: unknown } | null | undefined,
) {
	if (!session?.user || typeof session.user !== "object") {
		return false;
	}

	const onboardingCompletedAt =
		"onboardingCompletedAt" in session.user
			? session.user.onboardingCompletedAt
			: null;

	return Boolean(onboardingCompletedAt);
}

function getBootState(
	session: { user?: unknown } | null | undefined,
	sessionPending: boolean,
): BootState {
	if (!session && sessionPending) {
		return "loading";
	}

	if (!session) {
		return "signed-out";
	}

	return hasCompletedOnboardingInCachedSession(session)
		? "ready"
		: "onboarding";
}

function AuthGuard({ children }: { children: React.ReactNode }) {
	useScreenTracking();
	const utils = trpc.useUtils();
	const { data: session, isPending: sessionPending } = useSession();
	const segments = useSegments();
	const router = useRouter();
	const bootState = getBootState(session, sessionPending);
	const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
		undefined,
		{
			enabled: bootState === "ready",
		},
	);
	const { mutateAsync: registerPushToken } =
		trpc.notification.registerPushToken.useMutation();
	const promptedForPushPermissionUserId = useRef<string | null>(null);
	const handledNotificationResponseId = useRef<string | null>(null);
	const isNavigatingToNotificationRoute = useRef(false);
	const pendingNotificationRoute = useRef<NotificationRoute | null>(null);
	const [pendingNotificationRouteVersion, setPendingNotificationRouteVersion] =
		useState(0);
	const unreadBadgeCount = Number(unreadCount?.count ?? 0);

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
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				utils.notification.getUnreadCount.invalidate().catch(() => undefined);
			}
		});

		return () => subscription.remove();
	}, [utils]);

	useEffect(() => {
		if (!session?.user || bootState !== "ready") {
			Notifications.setBadgeCountAsync(0).catch(() => undefined);
			return;
		}

		Notifications.setBadgeCountAsync(unreadBadgeCount).catch(() => undefined);
	}, [bootState, session?.user, unreadBadgeCount]);

	useEffect(() => {
		let cancelled = false;

		async function queueNotificationRoute(
			response: Notifications.NotificationResponse | null,
		) {
			const route = getNotificationRoute(
				response?.notification.request.content.data,
			);

			if (!route) {
				return;
			}

			const responseId = response?.notification.request.identifier ?? null;
			if (responseId && handledNotificationResponseId.current === responseId) {
				return;
			}

			handledNotificationResponseId.current = responseId;

			if (!cancelled) {
				pendingNotificationRoute.current = route;
				setPendingNotificationRouteVersion((version) => version + 1);
			}

			Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
		}

		Notifications.getLastNotificationResponseAsync()
			.then((response) => queueNotificationRoute(response))
			.catch(() => undefined);

		const subscription = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				void queueNotificationRoute(response);
			},
		);

		return () => {
			cancelled = true;
			subscription.remove();
		};
	}, []);

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

		async function promptForPushPermission() {
			if (
				!user ||
				bootState !== "ready" ||
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
	}, [bootState, segments, session?.user]);

	useEffect(() => {
		if (bootState !== "ready") {
			isNavigatingToNotificationRoute.current = false;
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";
		const inOnboardingGroup = segments[0] === "(onboarding)";

		if (!inAuthGroup && !inOnboardingGroup) {
			isNavigatingToNotificationRoute.current = false;
		}
	}, [bootState, segments]);

	useEffect(() => {
		if (bootState === "loading") {
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";
		const inOnboardingGroup = segments[0] === "(onboarding)";

		if (bootState === "signed-out" && !inAuthGroup) {
			router.replace("/(auth)/sign-in");
		} else if (bootState === "onboarding" && !inOnboardingGroup) {
			router.replace("/(onboarding)");
		} else if (
			bootState === "ready" &&
			(inAuthGroup || inOnboardingGroup) &&
			!pendingNotificationRoute.current &&
			!isNavigatingToNotificationRoute.current
		) {
			router.replace("/(tabs)");
		}
	}, [bootState, pendingNotificationRouteVersion, router, segments]);

	useEffect(() => {
		if (bootState !== "ready" || !pendingNotificationRoute.current) {
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";
		const inOnboardingGroup = segments[0] === "(onboarding)";
		const route = pendingNotificationRoute.current;

		isNavigatingToNotificationRoute.current = true;
		pendingNotificationRoute.current = null;

		if (inAuthGroup || inOnboardingGroup) {
			router.replace(route);
			return;
		}

		router.push(route);
	}, [bootState, pendingNotificationRouteVersion, router, segments]);

	useEffect(() => {
		if (isRunningInExpoGo() || bootState === "loading") {
			return;
		}

		SplashScreen.hideAsync();
	}, [bootState]);

	if (bootState === "loading") {
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
