import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
	handleNotification: () =>
		Promise.resolve({
			shouldPlaySound: true,
			shouldSetBadge: false,
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
	return settings.status;
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
	let { status } = existingSettings;

	if (
		status !== Notifications.PermissionStatus.GRANTED &&
		promptForPermission
	) {
		const requestedSettings = await Notifications.requestPermissionsAsync();
		({ status } = requestedSettings);
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

	return null;
}
