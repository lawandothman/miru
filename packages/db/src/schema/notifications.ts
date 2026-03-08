import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pushTokens = pgTable(
	"push_tokens",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		platform: text("platform").notNull(),
		token: text("token").unique().notNull(),
		updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [index("push_tokens_user_idx").on(table.userId)],
);
