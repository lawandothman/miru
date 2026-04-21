import { execSync } from "node:child_process";
import type { ExpoConfig } from "expo/config";

const plugins: NonNullable<ExpoConfig["plugins"]> = [
	"expo-router",
	"expo-image",
	"expo-notifications",
	"expo-secure-store",
	"expo-image-picker",
	"expo-apple-authentication",
	"expo-updates",
	"expo-web-browser",
	"expo-sharing",
	[
		"expo-splash-screen",
		{
			image: "./assets/splash-icon-light.png",
			backgroundColor: "#fafafa",
			resizeMode: "contain",
			imageWidth: 100,
			dark: {
				image: "./assets/splash-icon-dark.png",
				backgroundColor: "#000000",
				resizeMode: "contain",
				imageWidth: 100,
			},
		},
	],
];

function getVersionFromGitTag(): string {
	try {
		return execSync("git describe --tags --abbrev=0", { encoding: "utf-8" })
			.trim()
			.replace(/^v/, "");
	} catch {
		return "0.0.0";
	}
}

const appVersion = (process.env.APP_VERSION ?? getVersionFromGitTag()).replace(
	/^v/,
	"",
);

plugins.push([
	"@sentry/react-native/expo",
	{
		organization: process.env.SENTRY_ORG ?? "lwnd",
		project: process.env.SENTRY_PROJECT ?? "miru-mobile",
		...(process.env.SENTRY_URL ? { url: process.env.SENTRY_URL } : {}),
	},
]);

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
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.miru.app",
		associatedDomains: ["applinks:watchmiru.app"],
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			LSApplicationQueriesSchemes: ["instagram-stories", "instagram"],
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
