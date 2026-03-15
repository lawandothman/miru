import { useState } from "react";
import {
	QueryClient,
	QueryClientProvider,
	QueryCache,
	MutationCache,
} from "@tanstack/react-query";
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
						staleTime: 30 * 1000,
						retry: (failureCount, error) => {
							if (isUnauthorized(error)) {
								return false;
							}
							return failureCount < 3;
						},
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
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
