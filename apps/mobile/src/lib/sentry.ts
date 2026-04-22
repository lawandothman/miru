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
	sendDefaultPii: false,
	tracesSampleRate: 0,
	profilesSampleRate: 0,
	replaysSessionSampleRate: 0,
	replaysOnErrorSampleRate: 0,
	attachScreenshot: false,
	attachViewHierarchy: false,
	enableNativeFramesTracking: false,
	integrations: [navigationIntegration],
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
	executionEnvironment: Constants.executionEnvironment ?? "unknown",
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
