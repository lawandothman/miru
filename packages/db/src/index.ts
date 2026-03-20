import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import type { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema/index";

function isNeonUrl(url: string): boolean {
	return url.includes("neon.tech") || url.includes("neon.db");
}

export function createDb(databaseUrl: string) {
	if (isNeonUrl(databaseUrl)) {
		const sql = neon(databaseUrl);
		return drizzleHttp(sql, { schema });
	}

	const sql = postgres(databaseUrl, {
		prepare: false,
		max: 1,
		idle_timeout: 20,
	});
	return drizzlePg(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;

export type User = InferSelectModel<typeof schema.users>;

export { schema };

export { eq, inArray, sql } from "drizzle-orm";
