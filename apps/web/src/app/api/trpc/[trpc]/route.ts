import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@miru/trpc";
import { db, getServerSession, tmdb } from "@/lib/server";

async function handler(req: Request) {
	const session = await getServerSession();

	return fetchRequestHandler({
		createContext: () => createContext({ db, session, tmdb }),
		endpoint: "/api/trpc",
		req,
		router: appRouter,
	});
}

export { handler as GET, handler as POST };
