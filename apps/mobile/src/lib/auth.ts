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

hydrateSessionFromCache();

/** Clear locally stored auth state when signOut() fails. */
export function clearAuthState(): void {
	SecureStore.deleteItemAsync(COOKIE_KEY).catch(() => undefined);
	SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => undefined);
}

export const { signIn, signOut, useSession } = authClient;

// Seed the session atom from SecureStore so useSession() returns the cached
// user on cold start — including when offline. Without this, better-auth's
// initial /get-session fetch is the only signal, and it fails offline.
function hydrateSessionFromCache(): void {
	let raw: string | null;
	try {
		raw = SecureStore.getItem(SESSION_CACHE_KEY);
	} catch {
		return;
	}

	if (!raw) {
		return;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return;
	}

	if (
		!parsed ||
		typeof parsed !== "object" ||
		!("session" in parsed) ||
		!("user" in parsed)
	) {
		return;
	}

	const sessionAtom = authClient.$store.atoms.session;
	const current = sessionAtom.get();
	sessionAtom.set({
		...current,
		data: parsed,
		error: null,
		isPending: false,
		isRefetching: false,
	});
}
