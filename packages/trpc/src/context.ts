import type { Database, User } from "@miru/db";
import type { TMDBClient } from "./tmdb";

export interface Session {
	user: Pick<User, "id" | "email" | "name" | "image"> & {
		onboardingCompletedAt: Date | null;
		country: string | null;
	};
}

export interface CreateContextOptions {
	db: Database;
	tmdb: TMDBClient;
	session: Session | null;
}

export function createContext(opts: CreateContextOptions) {
	return {
		db: opts.db,
		session: opts.session,
		tmdb: opts.tmdb,
	};
}

export type Context = ReturnType<typeof createContext>;
