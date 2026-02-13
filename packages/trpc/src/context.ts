import type { Database, User } from "@miru/db";
import type { TMDB } from "@lorenzopant/tmdb";

export interface Session {
	user: Pick<User, "id" | "email" | "name" | "image">;
}

export interface CreateContextOptions {
	db: Database;
	tmdb: TMDB;
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
