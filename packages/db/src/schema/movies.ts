import { sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const movies = pgTable(
	"movies",
	{
		adult: boolean("adult").default(false),
		backdropPath: text("backdrop_path"),
		budget: bigint("budget", { mode: "number" }),
		homepage: text("homepage"),
		id: integer("id").primaryKey(),
		imdbId: text("imdb_id"),
		originalTitle: text("original_title"),
		overview: text("overview"),
		popularity: real("popularity"),
		posterPath: text("poster_path"),
		releaseDate: text("release_date"),
		revenue: bigint("revenue", { mode: "number" }),
		runtime: integer("runtime"),
		tagline: text("tagline"),
		title: text("title").notNull(),
		tmdbVoteAverage: real("tmdb_vote_average"),
		tmdbVoteCount: integer("tmdb_vote_count"),
		trailerKey: text("trailer_key"),
		trailerSite: text("trailer_site"),
		updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
		watchlistCount: integer("watchlist_count").default(0).notNull(),
	},
	(table) => [
		index("movies_title_idx").on(table.title),
		index("movies_vote_idx").on(table.tmdbVoteCount, table.tmdbVoteAverage),
		index("movies_release_idx").on(table.releaseDate),
		index("movies_popularity_idx").on(table.popularity),
		index("movies_watchlist_count_idx")
			.on(table.watchlistCount)
			.where(sql`${table.adult} = false and ${table.watchlistCount} > 0`),
		index("movies_discover_popularity_idx")
			.on(table.popularity)
			.where(sql`${table.adult} = false and ${table.posterPath} is not null`),
		index("movies_discover_release_idx")
			.on(table.releaseDate, table.popularity)
			.where(sql`${table.adult} = false and ${table.posterPath} is not null`),
	],
);

export const genres = pgTable("genres", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

export const watchProviders = pgTable("watch_providers", {
	displayPriority: integer("display_priority"),
	id: integer("id").primaryKey(),
	logoPath: text("logo_path"),
	name: text("name").notNull(),
});

export const movieGenres = pgTable(
	"movie_genres",
	{
		genreId: integer("genre_id")
			.notNull()
			.references(() => genres.id, { onDelete: "cascade" }),
		movieId: integer("movie_id")
			.notNull()
			.references(() => movies.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.movieId, table.genreId] }),
		index("movie_genres_genre_idx").on(table.genreId),
	],
);

export const movieStreamProviders = pgTable(
	"movie_stream_providers",
	{
		movieId: integer("movie_id")
			.notNull()
			.references(() => movies.id, { onDelete: "cascade" }),
		providerId: integer("provider_id")
			.notNull()
			.references(() => watchProviders.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.movieId, table.providerId] }),
		index("movie_stream_providers_provider_idx").on(table.providerId),
	],
);
