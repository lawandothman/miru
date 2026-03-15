import type { ExpoConfig } from "expo/config";

const plugins: NonNullable<ExpoConfig["plugins"]> = [
	"expo-router",
	"expo-notifications",
	"expo-secure-store",
	"expo-image-picker",
	"expo-apple-authentication",
	"expo-updates",
];

const sentryOrg = process.env.SENTRY_ORG ?? "lwnd";
const sentryProject = process.env.SENTRY_PROJECT ?? "miru-mobile";
const appVersion = (process.env.APP_VERSION ?? "1.3.0").replace(/^v/, "");

if (sentryProject) {
	plugins.push([
		"@sentry/react-native/expo",
		{
			organization: sentryOrg,
			project: sentryProject,
			...(process.env.SENTRY_URL ? { url: process.env.SENTRY_URL } : {}),
		},
	]);
}

const config: ExpoConfig = {
	name: "Miru",
	slug: "miru",
	version: appVersion,
	orientation: "portrait",
	icon: "./assets/icon.png",
	scheme: "miru",
	userInterfaceStyle: "automatic",
	runtimeVersion: {
		policy: "appVersion",
	},
	updates: {
		url: "https://u.expo.dev/9f32c09b-90b8-455b-a800-068f06d24f1e",
	},
	splash: {
		image: "./assets/splash-icon.png",
		resizeMode: "contain",
		backgroundColor: "#000000",
	},
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.miru.app",
		associatedDomains: ["applinks:miru-chi.vercel.app"],
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
		},
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#000000",
		},
		package: "com.miru.app",
		permissions: ["android.permission.RECORD_AUDIO"],
	},
	plugins,
	experiments: {
		typedRoutes: true,
	},
	extra: {
		router: {},
		eas: {
			projectId: "9f32c09b-90b8-455b-a800-068f06d24f1e",
		},
	},
	owner: "lawandothman",
};

export default config;
