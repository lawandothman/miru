import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { match } from "ts-pattern";

Notifications.setNotificationHandler({
	handleNotification: () =>
		Promise.resolve({
			shouldPlaySound: true,
			shouldSetBadge: true,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
});

const DEFAULT_ANDROID_CHANNEL_ID = "default";

type PushRegistrationError =
	| "missing-project-id"
	| "permission-not-granted"
	| "physical-device-required";

export interface PushRegistrationResult {
	error: PushRegistrationError | null;
	status: Notifications.PermissionStatus;
	token: string | null;
}

function resolvePermissionStatus(
	settings: Notifications.NotificationPermissionsStatus,
): Notifications.PermissionStatus {
	if (settings.granted) {
		return Notifications.PermissionStatus.GRANTED;
	}

	return match(settings.canAskAgain)
		.with(true, () => Notifications.PermissionStatus.UNDETERMINED)
		.otherwise(() => Notifications.PermissionStatus.DENIED);
}

function getProjectId() {
	return (
		Constants.easConfig?.projectId ??
		Constants.expoConfig?.extra?.eas?.projectId ??
		null
	);
}

async function ensureAndroidChannel() {
	if (Platform.OS !== "android") {
		return;
	}

	await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
		name: "Default",
		importance: Notifications.AndroidImportance.MAX,
	});
}

export async function getNotificationPermissionsStatus() {
	const settings = await Notifications.getPermissionsAsync();
	return resolvePermissionStatus(settings);
}

export async function getDevicePushToken({
	promptForPermission,
}: {
	promptForPermission: boolean;
}): Promise<PushRegistrationResult> {
	await ensureAndroidChannel();

	if (!Device.isDevice) {
		return {
			error: "physical-device-required",
			status: Notifications.PermissionStatus.UNDETERMINED,
			token: null,
		};
	}

	const existingSettings = await Notifications.getPermissionsAsync();
	let status = resolvePermissionStatus(existingSettings);

	if (
		status !== Notifications.PermissionStatus.GRANTED &&
		promptForPermission
	) {
		const requestedSettings = await Notifications.requestPermissionsAsync();
		status = resolvePermissionStatus(requestedSettings);
	}

	if (status !== Notifications.PermissionStatus.GRANTED) {
		return {
			error: "permission-not-granted",
			status,
			token: null,
		};
	}

	const projectId = getProjectId();
	if (!projectId) {
		return {
			error: "missing-project-id",
			status,
			token: null,
		};
	}

	const token = await Notifications.getExpoPushTokenAsync({ projectId });

	return {
		error: null,
		status,
		token: token.data,
	};
}

export function getNotificationRoute(data: unknown) {
	if (!data || typeof data !== "object") {
		return null;
	}

	const type = "type" in data ? data.type : null;
	const userId = "userId" in data ? data.userId : null;
	const movieId = "movieId" in data ? data.movieId : null;

	if (
		type === "new-follower" &&
		typeof userId === "string" &&
		userId.length > 0
	) {
		return {
			pathname: "/user/[id]" as const,
			params: { id: userId },
		};
	}

	if (
		type === "watchlist-match" &&
		typeof movieId === "string" &&
		movieId.length > 0
	) {
		return {
			pathname: "/movie/[id]" as const,
			params: { id: movieId },
		};
	}

	return null;
}
