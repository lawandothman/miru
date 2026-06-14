import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { Database } from "./index";
import * as schema from "./schema/index";

type Schema = typeof schema;

export type AtomicExecutor = PgDatabase<
	PgQueryResultHKT,
	Schema,
	ExtractTablesWithRelations<Schema>
>;

type AtomicStatement = BatchItem<"pg"> & PromiseLike<unknown>;

function supportsBatch(
	db: Database,
): db is Extract<Database, { batch: unknown }> {
	return "batch" in db && typeof db.batch === "function";
}

export async function runAtomic(
	db: Database,
	build: (tx: AtomicExecutor) => AtomicStatement[],
): Promise<void> {
	if (supportsBatch(db)) {
		const statements = build(db);
		if (statements.length === 0) {
			return;
		}
		await db.batch(statements as [AtomicStatement, ...AtomicStatement[]]);
		return;
	}

	await db.transaction(async (tx) => {
		for (const statement of build(tx)) {
			await statement;
		}
	});
}
