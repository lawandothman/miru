import {
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { genres, watchProviders } from "./movies";

export const userGenrePreferences = pgTable(
	"user_genre_preferences",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		genreId: integer("genre_id")
			.notNull()
			.references(() => genres.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.userId, table.genreId] })],
);

export const userStreamingServices = pgTable(
	"user_streaming_services",
	{
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
		providerId: integer("provider_id")
			.notNull()
			.references(() => watchProviders.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.userId, table.providerId] })],
);
