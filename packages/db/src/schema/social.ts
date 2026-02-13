import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const follows = pgTable(
	"follows",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		followerId: text("follower_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("follows_follower_idx").on(table.followerId),
		index("follows_following_idx").on(table.followingId),
	],
);
