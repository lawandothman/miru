import { relations } from "drizzle-orm";
import { accounts, sessions, users } from "./users";
import { follows } from "./social";
import { watchedEntries } from "./watched";
import { watchlistEntries } from "./watchlist";
import { userGenrePreferences, userStreamingServices } from "./preferences";
import {
	genres,
	movieGenres,
	movieStreamProviders,
	movies,
	watchProviders,
} from "./movies";

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	followers: many(follows, { relationName: "following" }),
	following: many(follows, { relationName: "follower" }),
	genrePreferences: many(userGenrePreferences),
	sessions: many(sessions),
	streamingServices: many(userStreamingServices),
	watchedEntries: many(watchedEntries),
	watchlistEntries: many(watchlistEntries),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follower",
	}),
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "following",
	}),
}));

export const watchedEntriesRelations = relations(watchedEntries, ({ one }) => ({
	movie: one(movies, {
		fields: [watchedEntries.movieId],
		references: [movies.id],
	}),
	user: one(users, {
		fields: [watchedEntries.userId],
		references: [users.id],
	}),
}));

export const watchlistEntriesRelations = relations(
	watchlistEntries,
	({ one }) => ({
		movie: one(movies, {
			fields: [watchlistEntries.movieId],
			references: [movies.id],
		}),
		user: one(users, {
			fields: [watchlistEntries.userId],
			references: [users.id],
		}),
	}),
);

export const moviesRelations = relations(movies, ({ many }) => ({
	genres: many(movieGenres),
	streamProviders: many(movieStreamProviders),
	watchedEntries: many(watchedEntries),
	watchlistEntries: many(watchlistEntries),
}));

export const genresRelations = relations(genres, ({ many }) => ({
	movies: many(movieGenres),
	userPreferences: many(userGenrePreferences),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
	genre: one(genres, {
		fields: [movieGenres.genreId],
		references: [genres.id],
	}),
	movie: one(movies, {
		fields: [movieGenres.movieId],
		references: [movies.id],
	}),
}));

export const watchProvidersRelations = relations(
	watchProviders,
	({ many }) => ({
		streamMovies: many(movieStreamProviders),
		userServices: many(userStreamingServices),
	}),
);

export const movieStreamProvidersRelations = relations(
	movieStreamProviders,
	({ one }) => ({
		movie: one(movies, {
			fields: [movieStreamProviders.movieId],
			references: [movies.id],
		}),
		provider: one(watchProviders, {
			fields: [movieStreamProviders.providerId],
			references: [watchProviders.id],
		}),
	}),
);

export const userGenrePreferencesRelations = relations(
	userGenrePreferences,
	({ one }) => ({
		genre: one(genres, {
			fields: [userGenrePreferences.genreId],
			references: [genres.id],
		}),
		user: one(users, {
			fields: [userGenrePreferences.userId],
			references: [users.id],
		}),
	}),
);

export const userStreamingServicesRelations = relations(
	userStreamingServices,
	({ one }) => ({
		provider: one(watchProviders, {
			fields: [userStreamingServices.providerId],
			references: [watchProviders.id],
		}),
		user: one(users, {
			fields: [userStreamingServices.userId],
			references: [users.id],
		}),
	}),
);
