import { useState, useEffect } from "react";
import { View, Text, Switch, Alert, StyleSheet, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
	getDevicePushToken,
	getNotificationPermissionsStatus,
} from "@/lib/notifications";
import { trpc } from "@/lib/trpc";
import {
	Colors,
	fontSize,
	fontFamily,
	spacing,
	dynamicColorAlpha,
} from "@/lib/constants";

export function NotificationPreferences() {
	const utils = trpc.useUtils();
	const { data: preferences } = trpc.notification.getPreferences.useQuery();
	const registerPushToken = trpc.notification.registerPushToken.useMutation();
	const setPreferences = trpc.notification.setPreferences.useMutation({
		onSuccess: async () => {
			await utils.notification.getPreferences.invalidate();
		},
	});
	const [systemStatus, setSystemStatus] =
		useState<Notifications.PermissionStatus | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadPermissionStatus() {
			const status = await getNotificationPermissionsStatus();

			if (!cancelled) {
				setSystemStatus(status);
			}
		}

		loadPermissionStatus().catch(() => undefined);

		return () => {
			cancelled = true;
		};
	}, []);

	async function handleToggle(nextValue: boolean) {
		if (isUpdating) {
			return;
		}

		setIsUpdating(true);

		try {
			if (!nextValue) {
				await setPreferences.mutateAsync({ enabled: false });
				return;
			}

			const result = await getDevicePushToken({ promptForPermission: true });
			setSystemStatus(result.status);

			if (result.error === "physical-device-required") {
				Alert.alert(
					"Physical device required",
					"Push notifications only work on a real device.",
				);
				return;
			}

			if (!result.token) {
				Alert.alert(
					"Notifications unavailable",
					"Enable notification permissions for Miru in your device settings to turn push notifications on.",
				);
				return;
			}

			await registerPushToken.mutateAsync({
				platform: Platform.OS === "ios" ? "ios" : "android",
				token: result.token,
			});
			await setPreferences.mutateAsync({ enabled: true });
		} catch {
			Alert.alert(
				"Error",
				"Failed to update notification preferences. Please try again.",
			);
		} finally {
			setIsUpdating(false);
		}
	}

	const enabled = preferences?.enabled ?? false;
	const statusText =
		systemStatus === Notifications.PermissionStatus.GRANTED
			? "Allowed in system settings"
			: systemStatus === Notifications.PermissionStatus.DENIED
				? "Blocked in system settings"
				: "System permission not requested yet";

	return (
		<View style={styles.notificationBlock}>
			<View style={styles.notificationRow}>
				<View style={styles.notificationCopy}>
					<Text style={styles.notificationTitle}>Push notifications</Text>
					<Text style={styles.notificationHint}>
						Turn push notifications on or off for your account.
					</Text>
				</View>
				<Switch
					value={enabled}
					onValueChange={handleToggle}
					disabled={isUpdating}
					trackColor={{
						false: Colors.secondary,
						true: dynamicColorAlpha("primary", "80") as string,
					}}
					thumbColor={enabled ? Colors.primary : Colors.mutedForeground}
					accessibilityLabel="Push notifications"
					accessibilityRole="switch"
				/>
			</View>
			<Text style={styles.systemStatusText}>{statusText}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	notificationBlock: {
		gap: spacing[2],
	},
	notificationRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: spacing[4],
	},
	notificationCopy: {
		flex: 1,
		gap: spacing[1],
	},
	notificationTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansMedium,
		color: Colors.foreground,
	},
	notificationHint: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	systemStatusText: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
});
