import { NativeModules, Platform } from "react-native";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./api-url";

const STORAGE_PREFIX = "miru";
const COOKIE_KEY = `${STORAGE_PREFIX}_cookie`;
const SESSION_CACHE_KEY = `${STORAGE_PREFIX}_session_data`;

export const authClient = createAuthClient({
	baseURL: API_URL,
	plugins: [
		expoClient({
			scheme: "miru",
			storagePrefix: STORAGE_PREFIX,
			storage: SecureStore,
		}),
	],
});

/**
 * Clear all locally stored auth state:
 * 1. SecureStore cookies + cached session (Better Auth expo client)
 * 2. Native HTTP cookie jar (NSHTTPCookieStorage on iOS)
 */
export async function clearAuthState() {
	await Promise.all([
		SecureStore.deleteItemAsync(COOKIE_KEY).catch(() => undefined),
		SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => undefined),
	]);

	if (Platform.OS === "ios") {
		const networking = NativeModules.Networking as
			| { clearCookies?: (cb: (cleared: boolean) => void) => void }
			| undefined;
		await new Promise<void>((resolve) => {
			if (networking?.clearCookies) {
				networking.clearCookies(() => resolve());
			} else {
				resolve();
			}
		});
	}
}

export const { signIn, signOut, useSession } = authClient;
