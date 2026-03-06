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
import { authClient } from "./auth";
import { API_URL } from "./api-url";

let unauthorizedRecovery: Promise<void> | null = null;

function isUnauthorized(error: unknown): boolean {
	return error instanceof TRPCClientError && error.data?.httpStatus === 401;
}

function handleUnauthorized() {
	if (unauthorizedRecovery) {
		return unauthorizedRecovery;
	}

	unauthorizedRecovery = (async () => {
		const { data: session } = await authClient.getSession();

		if (!session) {
			await authClient.signOut();
		}
	})().finally(() => {
		unauthorizedRecovery = null;
	});

	return unauthorizedRecovery;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (error) => {
						if (isUnauthorized(error)) {
							handleUnauthorized().catch(() => undefined);
						}
					},
				}),
				mutationCache: new MutationCache({
					onError: (error) => {
						if (isUnauthorized(error)) {
							handleUnauthorized().catch(() => undefined);
						}
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
