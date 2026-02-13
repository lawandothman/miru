import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { movies } from "./movies";

export const watchlistEntries = pgTable(
	"watchlist_entries",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		movieId: integer("movie_id")
			.notNull()
			.references(() => movies.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.movieId] }),
		index("watchlist_user_idx").on(table.userId),
		index("watchlist_movie_idx").on(table.movieId),
	],
);
