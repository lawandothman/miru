import { schema } from "@miru/db";
import { and, count, desc, eq, inArray, ne, notInArray } from "drizzle-orm";
import { z } from "zod";
import { annotateFollowStatus } from "../helpers";
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
				genreIds: z.array(z.number()).min(1),
				limit: z.number().default(20),
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

		const [user, genrePrefs, streamingPrefs, [watchlistCount], [followCount]] =
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
					.where(eq(schema.userStreamingServices.userId, userId)),
				ctx.db
					.select({ count: count() })
					.from(schema.watchlistEntries)
					.where(eq(schema.watchlistEntries.userId, userId)),
				ctx.db
					.select({ count: count() })
					.from(schema.follows)
					.where(eq(schema.follows.followerId, userId)),
			]);

		return {
			isCompleted: Boolean(user?.onboardingCompletedAt),
			country: user?.country ?? null,
			genreIds: genrePrefs.map((p) => p.genreId),
			providerIds: streamingPrefs.map((p) => p.providerId),
			watchlistCount: watchlistCount?.count ?? 0,
			followCount: followCount?.count ?? 0,
		};
	}),

	getSuggestedUsers: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const users = await ctx.db
			.select({
				id: schema.users.id,
				name: schema.users.name,
				image: schema.users.image,
				watchlistCount: count(schema.watchlistEntries.movieId),
			})
			.from(schema.users)
			.leftJoin(
				schema.watchlistEntries,
				eq(schema.watchlistEntries.userId, schema.users.id),
			)
			.where(
				and(
					ne(schema.users.id, userId),
					notInArray(
						schema.users.id,
						ctx.db
							.select({ id: schema.follows.followingId })
							.from(schema.follows)
							.where(eq(schema.follows.followerId, userId)),
					),
				),
			)
			.groupBy(schema.users.id)
			.orderBy(desc(count(schema.watchlistEntries.movieId)))
			.limit(20);

		return annotateFollowStatus(ctx, users);
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
		.input(z.object({ genreIds: z.array(z.number()).min(1) }))
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

			return { success: true };
		}),

	setStreamingServices: protectedProcedure
		.input(z.object({ providerIds: z.array(z.number()) }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db
				.delete(schema.userStreamingServices)
				.where(eq(schema.userStreamingServices.userId, userId));

			if (input.providerIds.length > 0) {
				await ctx.db.insert(schema.userStreamingServices).values(
					input.providerIds.map((providerId) => ({
						userId,
						providerId,
					})),
				);
			}

			return { success: true };
		}),
});
