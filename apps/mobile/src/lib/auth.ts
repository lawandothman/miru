import { NativeModules, Platform } from "react-native";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { kOnlineManager } from "better-auth/client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./api-url";

// Override the ExpoOnlineManager to prevent expo-network's
// addNetworkStateListener from interfering with networking.
// The manager is initialized as a side effect by importing expoClient.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onlineManager = (globalThis as Record<symbol, unknown>)[kOnlineManager] as
	| {
			isOnline: boolean;
			setOnline: (v: boolean) => void;
			setup: () => () => void;
	  }
	| undefined;
if (onlineManager) {
	onlineManager.isOnline = true;
	// oxlint-disable-next-line no-empty-function
	onlineManager.setOnline = () => undefined;
	// oxlint-disable-next-line no-empty-function
	onlineManager.setup = () => () => undefined;
}

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
 *
 * The native cookie jar accumulates stale session cookies from
 * Set-Cookie headers that conflict with Better Auth's SecureStore
 * cookies, causing "Network request failed" after sessions expire.
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
