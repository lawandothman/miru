import type { Database, User } from "@miru/db";
import type { TMDBClient } from "./tmdb";

export interface Session {
	user: Pick<User, "id" | "email" | "name" | "image"> & {
		onboardingCompletedAt: Date | null;
		country: string | null;
	};
}

export interface CreateContextOptions {
	captureException?: (
		error: unknown,
		context?: Record<string, unknown>,
	) => void;
	db: Database;
	expoAccessToken?: string;
	tmdb: TMDBClient;
	session: Session | null;
}

export function createContext(opts: CreateContextOptions) {
	return {
		captureException: opts.captureException,
		db: opts.db,
		expoAccessToken: opts.expoAccessToken,
		session: opts.session,
		tmdb: opts.tmdb,
	};
}

export type Context = ReturnType<typeof createContext>;
