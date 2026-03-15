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
 * Clear locally stored auth state (cookies + cached session).
 * Used as a fallback when signOut() fails.
 */
export function clearAuthState() {
	SecureStore.deleteItemAsync(COOKIE_KEY).catch(() => undefined);
	SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => undefined);
}

export const { signIn, signOut, useSession } = authClient;
