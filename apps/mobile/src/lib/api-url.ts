import * as Device from "expo-device";

function getApiUrl(): string {
	const configured = process.env.EXPO_PUBLIC_API_URL;
	if (configured) {
		return configured;
	}

	if (Device.isDevice) {
		throw new Error(
			"EXPO_PUBLIC_API_URL is not set. Physical devices cannot reach localhost.",
		);
	}

	return "http://localhost:3000";
}

export const API_URL = getApiUrl();
