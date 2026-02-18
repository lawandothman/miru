import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
	plugins: [
		expoClient({
			scheme: "miru",
			storagePrefix: "miru",
			storage: SecureStore,
		}),
	],
});

export const { signIn, signOut, useSession } = authClient;
