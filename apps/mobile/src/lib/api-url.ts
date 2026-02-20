import Constants from "expo-constants";

function getApiUrl(): string {
	const configured = process.env.EXPO_PUBLIC_API_URL;

	// If explicitly set to a non-localhost URL (e.g. an ngrok tunnel), use it as-is.
	if (configured && configured !== "http://localhost:3000") {
		return configured;
	}

	if (__DEV__) {
		// In development, derive the dev machine's IP from the Expo debugger host.
		// This is necessary for physical devices where "localhost" resolves to the
		// phone itself, not the dev machine running the server.
		const debuggerHost =
			Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;

		if (debuggerHost) {
			const [host] = debuggerHost.split(":");
			return `http://${host}:3000`;
		}
	}

	return configured ?? "http://localhost:3000";
}

export const API_URL = getApiUrl();
