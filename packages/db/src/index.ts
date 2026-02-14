import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema/index";

export function createDb(databaseUrl: string) {
	const sql = postgres(databaseUrl);
	return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;

export type User = InferSelectModel<typeof schema.users>;

export { schema };

export { eq } from "drizzle-orm";
