import { sql } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";
import { users } from "./users";

export const RECOMMENDATION_STATUSES = [
	"pending",
	"accepted",
	"dismissed",
] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const movieRecommendations = pgTable(
	"movie_recommendations",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		senderId: text("sender_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		recipientId: text("recipient_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		movieId: integer("movie_id")
			.notNull()
			.references(() => movies.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("pending"),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		respondedAt: timestamp("responded_at", { mode: "date" }),
	},
	(table) => [
		index("movie_recommendations_recipient_inbox_idx").on(
			table.recipientId,
			table.status,
			table.createdAt,
		),
		uniqueIndex("movie_recommendations_pending_unique_idx")
			.on(table.senderId, table.recipientId, table.movieId)
			.where(sql`${table.status} = 'pending'`),
		index("movie_recommendations_movie_idx").on(table.movieId),
		index("movie_recommendations_sender_idx").on(table.senderId),
	],
);
