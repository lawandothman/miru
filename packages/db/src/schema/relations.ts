import { relations } from "drizzle-orm";
import { accounts, sessions, users } from "./users";
import { follows } from "./social";
import { watchlistEntries } from "./watchlist";
import {
	genres,
	movieBuyProviders,
	movieGenres,
	movieRentProviders,
	movieStreamProviders,
	movies,
	watchProviders,
} from "./movies";

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	followers: many(follows, { relationName: "following" }),
	following: many(follows, { relationName: "follower" }),
	sessions: many(sessions),
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
	buyProviders: many(movieBuyProviders),
	genres: many(movieGenres),
	rentProviders: many(movieRentProviders),
	streamProviders: many(movieStreamProviders),
	watchlistEntries: many(watchlistEntries),
}));

export const genresRelations = relations(genres, ({ many }) => ({
	movies: many(movieGenres),
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
		buyMovies: many(movieBuyProviders),
		rentMovies: many(movieRentProviders),
		streamMovies: many(movieStreamProviders),
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

export const movieBuyProvidersRelations = relations(
	movieBuyProviders,
	({ one }) => ({
		movie: one(movies, {
			fields: [movieBuyProviders.movieId],
			references: [movies.id],
		}),
		provider: one(watchProviders, {
			fields: [movieBuyProviders.providerId],
			references: [watchProviders.id],
		}),
	}),
);

export const movieRentProvidersRelations = relations(
	movieRentProviders,
	({ one }) => ({
		movie: one(movies, {
			fields: [movieRentProviders.movieId],
			references: [movies.id],
		}),
		provider: one(watchProviders, {
			fields: [movieRentProviders.providerId],
			references: [watchProviders.id],
		}),
	}),
);
