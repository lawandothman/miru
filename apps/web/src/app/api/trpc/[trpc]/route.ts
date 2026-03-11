import * as Sentry from "@sentry/nextjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@miru/trpc";
import { env } from "@/env";
import { db, getServerSession, tmdb } from "@/lib/server";

async function handler(req: Request) {
	const session = await getServerSession();

	return fetchRequestHandler({
		createContext: () =>
			createContext({
				captureException: (error, extra) => {
					Sentry.withScope((scope) => {
						if (extra) {
							scope.setExtras(extra);
						}

						Sentry.captureException(error);
					});
				},
				db,
				...(env.EXPO_ACCESS_TOKEN
					? { expoAccessToken: env.EXPO_ACCESS_TOKEN }
					: {}),
				session,
				tmdb,
			}),
		endpoint: "/api/trpc",
		onError: ({ error, path }) => {
			if (error.code === "INTERNAL_SERVER_ERROR") {
				Sentry.captureException(error.cause ?? error, {
					extra: { path },
				});
			}
		},
		req,
		router: appRouter,
	});
}

export { handler as GET, handler as POST };
