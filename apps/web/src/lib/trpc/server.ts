import "server-only";

import { cache } from "react";
import { appRouter, createCallerFactory, createContext } from "@miru/trpc";
import { db, getServerSession, tmdb } from "@/lib/server";

const createCaller = createCallerFactory(appRouter);

export const trpc = cache(async () => {
	const session = await getServerSession();

	return createCaller(createContext({ db, session, tmdb }));
});
