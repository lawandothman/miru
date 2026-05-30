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

export const MOVIE_RATINGS = ["disliked", "liked", "loved"] as const;

export type MovieRating = (typeof MOVIE_RATINGS)[number];

export const watchedEntries = pgTable(
	"watched_entries",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		movieId: integer("movie_id")
			.notNull()
			.references(() => movies.id, { onDelete: "cascade" }),
		rating: text("rating", { enum: MOVIE_RATINGS }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.movieId] }),
		index("watched_user_idx").on(table.userId),
		index("watched_movie_idx").on(table.movieId),
	],
);
