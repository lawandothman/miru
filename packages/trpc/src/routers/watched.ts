import { keys } from "@miru/cache";
import { type Database, schema } from "@miru/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { ensureMovieExists } from "./helpers";

async function clearWatchlistAndAcceptRecommendations(
	db: Database,
	userId: string,
	movieId: number,
) {
	await db
		.delete(schema.watchlistEntries)
		.where(
			and(
				eq(schema.watchlistEntries.userId, userId),
				eq(schema.watchlistEntries.movieId, movieId),
			),
		);

	await db
		.update(schema.movieRecommendations)
		.set({ status: "accepted", respondedAt: new Date() })
		.where(
			and(
				eq(schema.movieRecommendations.recipientId, userId),
				eq(schema.movieRecommendations.movieId, movieId),
				eq(schema.movieRecommendations.status, "pending"),
			),
		);
}

export const watchedRouter = router({
	add: protectedProcedure
		.input(z.object({ movieId: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			await ensureMovieExists(ctx.db, ctx.tmdb, input.movieId);

			const userId = ctx.session.user.id;

			await ctx.db
				.insert(schema.watchedEntries)
				.values({ userId, movieId: input.movieId })
				.onConflictDoNothing();

			await clearWatchlistAndAcceptRecommendations(
				ctx.db,
				userId,
				input.movieId,
			);

			await ctx.cache?.del(keys.recommendations(userId));

			return { success: true };
		}),

	rate: protectedProcedure
		.input(
			z.object({
				movieId: z.number().int().positive(),
				rating: z.enum(schema.MOVIE_RATINGS).nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Clearing a rating returns the movie to neutral without un-watching it.
			if (input.rating === null) {
				await ctx.db
					.update(schema.watchedEntries)
					.set({ rating: null })
					.where(
						and(
							eq(schema.watchedEntries.userId, userId),
							eq(schema.watchedEntries.movieId, input.movieId),
						),
					);

				return { success: true };
			}

			await ensureMovieExists(ctx.db, ctx.tmdb, input.movieId);

			// Rating a movie also marks it watched, so reuse the watched side-effects.
			await ctx.db
				.insert(schema.watchedEntries)
				.values({ userId, movieId: input.movieId, rating: input.rating })
				.onConflictDoUpdate({
					target: [schema.watchedEntries.userId, schema.watchedEntries.movieId],
					set: { rating: input.rating },
				});

			await clearWatchlistAndAcceptRecommendations(
				ctx.db,
				userId,
				input.movieId,
			);

			await ctx.cache?.del(keys.recommendations(userId));

			return { success: true };
		}),

	getMyWatched: protectedProcedure
		.input(
			z.object({
				cursor: z.number().int().min(0).nullish(),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const offset = input.cursor ?? 0;
			const entries = await ctx.db.query.watchedEntries.findMany({
				where: eq(schema.watchedEntries.userId, ctx.session.user.id),
				with: { movie: true },
				limit: input.limit,
				offset,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			return entries
				.filter((e) => !e.movie.adult)
				.map((e) => ({
					...e.movie,
					isWatched: true,
					rating: e.rating,
					watchedAt: e.createdAt,
				}));
		}),

	getUserWatched: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				limit: z.number().int().min(1).max(100).default(30),
			}),
		)
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.watchedEntries.findMany({
				where: eq(schema.watchedEntries.userId, input.userId),
				with: { movie: true },
				limit: input.limit,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			return entries
				.filter((e) => !e.movie.adult)
				.map((e) => ({
					...e.movie,
					isWatched: true,
					rating: e.rating,
				}));
		}),

	remove: protectedProcedure
		.input(z.object({ movieId: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(schema.watchedEntries)
				.where(
					and(
						eq(schema.watchedEntries.userId, ctx.session.user.id),
						eq(schema.watchedEntries.movieId, input.movieId),
					),
				);

			await ctx.cache?.del(keys.recommendations(ctx.session.user.id));

			return { success: true };
		}),
});
