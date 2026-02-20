import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./api-url";

export const authClient = createAuthClient({
	baseURL: API_URL,
	plugins: [
		expoClient({
			scheme: "miru",
			storagePrefix: "miru",
			storage: SecureStore,
		}),
	],
});

export const { signIn, signOut, useSession } = authClient;
