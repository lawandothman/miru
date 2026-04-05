import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
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

export const notifications = pgTable(
	"notifications",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		actorId: text("actor_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		data: jsonb("data"),
		read: boolean("read").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	},
	(table) => [
		index("notifications_user_created_idx").on(table.userId, table.createdAt),
		index("notifications_user_read_idx").on(table.userId, table.read),
	],
);
