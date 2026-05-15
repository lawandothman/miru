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

export const NOTIFICATION_TYPES = [
	"new-follower",
	"watchlist-match",
	"movie-recommendation",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

interface NewFollowerNotificationData {
	type: "new-follower";
	data: null;
}

interface WatchlistMatchNotificationData {
	type: "watchlist-match";
	data: {
		movieId: string;
		movieTitle: string;
		posterPath: string | null;
	};
}

interface MovieRecommendationNotificationData {
	type: "movie-recommendation";
	data: {
		recommendationId: string;
		movieId: string;
		movieTitle: string;
		posterPath: string | null;
		message: string | null;
	};
}

export type TypedNotificationData =
	| NewFollowerNotificationData
	| WatchlistMatchNotificationData
	| MovieRecommendationNotificationData;

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
