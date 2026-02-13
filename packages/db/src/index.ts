import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema/index";

export function createDb(databaseUrl: string) {
	const sql = neon(databaseUrl);
	return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;

export type User = InferSelectModel<typeof schema.users>;

export { schema };
