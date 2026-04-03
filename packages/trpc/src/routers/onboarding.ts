import { keys } from "@miru/cache";
import { normalizeWatchProviderIds, schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const onboardingRouter = router({
	complete: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(schema.users)
			.set({ onboardingCompletedAt: new Date() })
			.where(eq(schema.users.id, ctx.session.user.id));
		return { success: true };
	}),

	getRecommendedMovies: protectedProcedure
		.input(
			z.object({
				genreIds: z.array(z.number().int().positive()).min(1),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const existingWatchlist = await ctx.db
				.select({ movieId: schema.watchlistEntries.movieId })
				.from(schema.watchlistEntries)
				.where(eq(schema.watchlistEntries.userId, userId));

			const excludeIds = existingWatchlist.map((e) => e.movieId);

			const movies = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					tmdbVoteCount: schema.movies.tmdbVoteCount,
				})
				.from(schema.movieGenres)
				.innerJoin(
					schema.movies,
					eq(schema.movies.id, schema.movieGenres.movieId),
				)
				.where(
					and(
						inArray(schema.movieGenres.genreId, input.genreIds),
						eq(schema.movies.adult, false),
						excludeIds.length > 0
							? notInArray(schema.movies.id, excludeIds)
							: undefined,
					),
				)
				.groupBy(schema.movies.id)
				.orderBy(desc(schema.movies.tmdbVoteCount))
				.limit(input.limit);

			return movies;
		}),

	getState: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const [user, genrePrefs, streamingPrefs, watchlistRows, followRows] =
			await Promise.all([
				ctx.db.query.users.findFirst({
					where: eq(schema.users.id, userId),
				}),
				ctx.db
					.select({ genreId: schema.userGenrePreferences.genreId })
					.from(schema.userGenrePreferences)
					.where(eq(schema.userGenrePreferences.userId, userId)),
				ctx.db
					.select({ providerId: schema.userStreamingServices.providerId })
					.from(schema.userStreamingServices)
					.where(
						and(
							eq(schema.userStreamingServices.userId, userId),
							inArray(
								schema.userStreamingServices.providerId,
								ctx.db
									.select({
										providerId: schema.movieStreamProviders.providerId,
									})
									.from(schema.movieStreamProviders),
							),
						),
					),
				ctx.db
					.select({ count: count() })
					.from(schema.watchlistEntries)
					.where(eq(schema.watchlistEntries.userId, userId)),
				ctx.db
					.select({ count: count() })
					.from(schema.follows)
					.where(eq(schema.follows.followerId, userId)),
			]);

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User account not found",
			});
		}

		return {
			isCompleted: Boolean(user.onboardingCompletedAt),
			country: user.country ?? null,
			genreIds: genrePrefs.map((p) => p.genreId),
			providerIds: normalizeWatchProviderIds(
				streamingPrefs.map((preference) => preference.providerId),
			),
			watchlistCount: watchlistRows[0]?.count ?? 0,
			followCount: followRows[0]?.count ?? 0,
		};
	}),

	setCountry: protectedProcedure
		.input(z.object({ country: z.string().length(2) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(schema.users)
				.set({ country: input.country.toUpperCase() })
				.where(eq(schema.users.id, ctx.session.user.id));
			return { success: true };
		}),

	setGenrePreferences: protectedProcedure
		.input(z.object({ genreIds: z.array(z.number().int().positive()).min(1) }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db
				.delete(schema.userGenrePreferences)
				.where(eq(schema.userGenrePreferences.userId, userId));

			await ctx.db.insert(schema.userGenrePreferences).values(
				input.genreIds.map((genreId) => ({
					userId,
					genreId,
				})),
			);

			await ctx.cache?.del(keys.recommendations(userId));

			return { success: true };
		}),

	setStreamingServices: protectedProcedure
		.input(z.object({ providerIds: z.array(z.number().int().positive()) }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const providerIds = normalizeWatchProviderIds(input.providerIds);
			const streamableProviders =
				providerIds.length > 0
					? await ctx.db
							.select({ providerId: schema.movieStreamProviders.providerId })
							.from(schema.movieStreamProviders)
							.where(
								inArray(schema.movieStreamProviders.providerId, providerIds),
							)
							.groupBy(schema.movieStreamProviders.providerId)
					: [];
			const streamableProviderIds = streamableProviders.map(
				(provider) => provider.providerId,
			);

			await ctx.db
				.delete(schema.userStreamingServices)
				.where(eq(schema.userStreamingServices.userId, userId));

			if (streamableProviderIds.length > 0) {
				await ctx.db.insert(schema.userStreamingServices).values(
					streamableProviderIds.map((providerId) => ({
						userId,
						providerId,
					})),
				);
			}

			await ctx.cache?.del(keys.recommendations(userId));

			return { success: true };
		}),
});
