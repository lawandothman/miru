"use client";

import { useState } from "react";
import {
	QueryClient,
	QueryClientProvider,
	QueryCache,
	MutationCache,
} from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { env } from "@/env";
import { trpc } from "./client";

function getBaseUrl() {
	if (typeof window !== "undefined") {
		return "";
	}
	if (env.VERCEL_URL) {
		return `https://${env.VERCEL_URL}`;
	}
	return `http://localhost:3000`;
}

function isUnauthorized(error: unknown): boolean {
	return error instanceof TRPCClientError && error.data?.httpStatus === 401;
}

function handleUnauthorized() {
	window.location.href = "/signin";
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (error) => {
						if (isUnauthorized(error)) {
							handleUnauthorized();
						}
					},
				}),
				mutationCache: new MutationCache({
					onError: (error) => {
						if (isUnauthorized(error)) {
							handleUnauthorized();
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
					transformer: superjson,
					url: `${getBaseUrl()}/api/trpc`,
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
