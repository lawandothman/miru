import "server-only";

import { cache as reactCache } from "react";
import * as Sentry from "@sentry/nextjs";
import { appRouter, createCallerFactory, createContext } from "@miru/trpc";
import { env } from "@/env";
import { cache, db, getServerSession, tmdb } from "@/lib/server";

const createCaller = createCallerFactory(appRouter);

export const trpc = reactCache(async () => {
	const session = await getServerSession();

	return createCaller(
		createContext({
			...(cache ? { cache } : {}),
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
	);
});
