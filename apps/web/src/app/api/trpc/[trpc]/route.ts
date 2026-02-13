import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";
import { appRouter, createContext } from "@miru/trpc";
import { TMDB } from "@lorenzopant/tmdb";
import { createDb } from "@miru/db";
import { auth } from "@/lib/auth";

const db = createDb(process.env["DATABASE_URL"] ?? "");
const tmdb = new TMDB(process.env["TMDB_API_READ_ACCESS_TOKEN"] ?? "");

const handler = async (req: Request) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return fetchRequestHandler({
		createContext: () =>
			createContext({
				db,
				tmdb,
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
			}),
		endpoint: "/api/trpc",
		req,
		router: appRouter,
	});
};

export { handler as GET, handler as POST };
