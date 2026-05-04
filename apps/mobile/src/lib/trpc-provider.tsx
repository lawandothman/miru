import { useState } from "react";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import {
	PersistQueryClientProvider,
	type PersistQueryClientOptions,
} from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./trpc";
import { authClient, clearAuthState } from "./auth";
import { API_URL } from "./api-url";
import { Sentry } from "./sentry";

let unauthorizedRecovery: Promise<void> | null = null;

function isUnauthorized(error: unknown): boolean {
	return error instanceof TRPCClientError && error.data?.httpStatus === 401;
}

function handleUnauthorized() {
	if (unauthorizedRecovery) {
		return unauthorizedRecovery;
	}

	unauthorizedRecovery = (async () => {
		try {
			await authClient.signOut();
		} catch {
			clearAuthState();
		}
	})().finally(() => {
		unauthorizedRecovery = null;
	});

	return unauthorizedRecovery;
}

function isNetworkError(error: unknown): boolean {
	if (!(error instanceof TRPCClientError)) {
		return false;
	}
	const msg = error.message.toLowerCase();
	return msg.includes("network request failed") || msg.includes("fetch failed");
}

function captureTrpcError(
	error: unknown,
	context: {
		type: "query" | "mutation";
		key?: readonly unknown[];
	},
) {
	if (isUnauthorized(error) || isNetworkError(error)) {
		return;
	}

	Sentry.withScope((scope) => {
		scope.setTag("error_source", "trpc");
		scope.setTag("trpc_type", context.type);
		if (context.key) {
			scope.setContext("trpc", {
				key: JSON.stringify(context.key),
			});
		}

		Sentry.captureException(error);
	});
}

export const queryPersister = createAsyncStoragePersister({
	storage: AsyncStorage,
	key: "miru-query-cache",
	throttleTime: 1000,
});

const PERSIST_OPTIONS: Omit<PersistQueryClientOptions, "queryClient"> = {
	persister: queryPersister,
	maxAge: 7 * 24 * 60 * 60 * 1000,
	buster: Constants.expoConfig?.version ?? "dev",
	dehydrateOptions: {
		shouldDehydrateQuery: (query) => query.state.status === "success",
	},
};

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (error, query) => {
						if (isUnauthorized(error)) {
							handleUnauthorized().catch(() => undefined);
							return;
						}

						captureTrpcError(error, {
							type: "query",
							key: query.queryKey,
						});
					},
				}),
				mutationCache: new MutationCache({
					onError: (error, _vars, _ctx, mutation) => {
						if (isUnauthorized(error)) {
							handleUnauthorized().catch(() => undefined);
							return;
						}

						captureTrpcError(error, {
							type: "mutation",
							key: mutation.options.mutationKey,
						});
					},
				}),
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000,
						gcTime: 24 * 60 * 60 * 1000,
						retry: (failureCount, error) => {
							if (isUnauthorized(error)) {
								return false;
							}
							return failureCount < 3;
						},
						retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
					},
				},
			}),
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${API_URL}/api/trpc`,
					transformer: superjson,
					fetch: (url, options) =>
						fetch(url, { ...options, credentials: "omit" }),
					headers() {
						const cookies = authClient.getCookie();
						if (cookies) {
							return { Cookie: cookies };
						}
						return {};
					},
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={PERSIST_OPTIONS}
			>
				{children}
			</PersistQueryClientProvider>
		</trpc.Provider>
	);
}
