import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./api-url";

const STORAGE_PREFIX = "miru";
const COOKIE_KEY = `${STORAGE_PREFIX}_cookie`;
const SESSION_CACHE_KEY = `${STORAGE_PREFIX}_session_data`;

export const authClient = createAuthClient({
	baseURL: API_URL,
	fetchOptions: {
		// Prevent NSURLSession from storing/sending cookies.
		// The expo client already manages cookies via SecureStore —
		// letting NSURLSession also handle them causes duplicate/stale
		// cookies that corrupt requests after the app resumes from background.
		credentials: "omit",
	},
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
 * Use when sign-in fails to prevent stale session data from
 * leaving the user stuck on a loading spinner.
 */
export function clearAuthState() {
	SecureStore.deleteItemAsync(COOKIE_KEY).catch(() => undefined);
	SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => undefined);
}

export const { signIn, signOut, useSession } = authClient;
