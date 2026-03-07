import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import * as Sentry from "@sentry/react-native";

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const isSentryEnabled = !__DEV__ && Boolean(dsn);

Sentry.init({
	dsn,
	enabled: isSentryEnabled,
	sendDefaultPii: true,
	enableLogs: true,
	tracesSampleRate: __DEV__ ? 1 : 0.2,
	profilesSampleRate: __DEV__ ? 1 : 0.2,
	replaysSessionSampleRate: __DEV__ ? 1 : 0.1,
	replaysOnErrorSampleRate: 1,
	attachScreenshot: true,
	attachViewHierarchy: true,
	enableNativeFramesTracking: !isRunningInExpoGo(),
	integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
	environment: __DEV__ ? "development" : (Updates.channel ?? "production"),
	beforeSend(event) {
		if (!isSentryEnabled) {
			return null;
		}

		return event;
	},
});

Sentry.setTags({
	platform: Platform.OS,
	appOwnership: Constants.appOwnership ?? "unknown",
	updateChannel: Updates.channel ?? "unknown",
});

Sentry.setContext("expo", {
	appVersion: Constants.expoConfig?.version,
	buildVersion:
		Constants.expoConfig?.ios?.buildNumber ??
		Constants.expoConfig?.android?.versionCode?.toString(),
	runtimeVersion:
		typeof Updates.runtimeVersion === "string"
			? Updates.runtimeVersion
			: undefined,
	updateId: Updates.updateId,
});

export { Sentry, navigationIntegration };
