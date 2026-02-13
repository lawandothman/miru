import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { appRouter, createCallerFactory, createContext } from "@miru/trpc";
import { TMDB } from "@lorenzopant/tmdb";
import { createDb } from "@miru/db";
import { auth } from "@/lib/auth";

const db = createDb(process.env["DATABASE_URL"] ?? "");
const tmdb = new TMDB(process.env["TMDB_API_READ_ACCESS_TOKEN"] ?? "");

const createCaller = createCallerFactory(appRouter);

export const trpc = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return createCaller(
		createContext({
			db,
			session: session
				? {
						user: {
							id: session.user.id,
							email: session.user.email,
							name: session.user.name,
							image: session.user.image ?? null,
						},
					}
				: null,
			tmdb,
		}),
	);
});
