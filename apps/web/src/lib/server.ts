import "server-only";

import { headers } from "next/headers";
import { createCache } from "@miru/cache";
import { createDb } from "@miru/db";
import { type Session, TMDB } from "@miru/trpc";
import { env } from "@/env";
import { auth } from "@/lib/auth";

export const db = createDb(env.DATABASE_URL);
export const tmdb = new TMDB(env.TMDB_API_READ_ACCESS_TOKEN);
export const cache =
	env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
		? createCache({
				url: env.UPSTASH_REDIS_REST_URL,
				token: env.UPSTASH_REDIS_REST_TOKEN,
			})
		: undefined;

export async function getServerSession(): Promise<Session | null> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return null;
	}

	return {
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			image: session.user.image ?? null,
			onboardingCompletedAt: session.user.onboardingCompletedAt ?? null,
			country: session.user.country ?? null,
		},
	};
}
