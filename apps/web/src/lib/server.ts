import "server-only";

import { headers } from "next/headers";
import { TMDB } from "@lorenzopant/tmdb";
import { createDb } from "@miru/db";
import type { Session } from "@miru/trpc";
import { auth } from "@/lib/auth";

export const db = createDb(process.env["DATABASE_URL"] ?? "");
export const tmdb = new TMDB(process.env["TMDB_API_READ_ACCESS_TOKEN"] ?? "");

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
