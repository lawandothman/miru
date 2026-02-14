import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const watchedRouter = router({
	add: protectedProcedure
		.input(z.object({ movieId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			// Ensure movie exists in DB — fetch from TMDB if not
			const existing = await ctx.db.query.movies.findFirst({
				where: eq(schema.movies.id, input.movieId),
			});

			if (!existing) {
				try {
					const details = await ctx.tmdb.movies.details({
						movie_id: input.movieId,
					});
					await ctx.db
						.insert(schema.movies)
						.values({
							id: details.id,
							title: details.title,
							originalTitle: details.original_title ?? null,
							overview: details.overview ?? null,
							posterPath: details.poster_path ?? null,
							backdropPath: details.backdrop_path ?? null,
							releaseDate: details.release_date ?? null,
							adult: details.adult ?? false,
							popularity: details.popularity ?? null,
						})
						.onConflictDoNothing();
				} catch {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Movie not found on TMDB",
					});
				}
			}

			await ctx.db
				.insert(schema.watchedEntries)
				.values({
					userId: ctx.session.user.id,
					movieId: input.movieId,
				})
				.onConflictDoNothing();

			// Auto-remove from watchlist
			await ctx.db
				.delete(schema.watchlistEntries)
				.where(
					and(
						eq(schema.watchlistEntries.userId, ctx.session.user.id),
						eq(schema.watchlistEntries.movieId, input.movieId),
					),
				);

			return { success: true };
		}),

	getMyWatched: protectedProcedure
		.input(
			z.object({
				cursor: z.number().nullish(),
				limit: z.number().default(20),
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

			return entries.map((e) => ({
				...e.movie,
				isWatched: true,
				watchedAt: e.createdAt,
			}));
		}),

	getUserWatched: publicProcedure
		.input(z.object({ userId: z.string(), limit: z.number().default(30) }))
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.watchedEntries.findMany({
				where: eq(schema.watchedEntries.userId, input.userId),
				with: { movie: true },
				limit: input.limit,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			return entries.map((e) => ({
				...e.movie,
				isWatched: true,
			}));
		}),

	remove: protectedProcedure
		.input(z.object({ movieId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(schema.watchedEntries)
				.where(
					and(
						eq(schema.watchedEntries.userId, ctx.session.user.id),
						eq(schema.watchedEntries.movieId, input.movieId),
					),
				);

			return { success: true };
		}),
});
