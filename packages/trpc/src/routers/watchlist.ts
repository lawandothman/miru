import { schema } from "@miru/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getMovieIdSet } from "../helpers";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { ensureMovieExists } from "./helpers";

export const watchlistRouter = router({
	add: protectedProcedure
		.input(z.object({ movieId: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
			await ensureMovieExists(ctx.db, ctx.tmdb, input.movieId);

			await ctx.db
				.insert(schema.watchlistEntries)
				.values({
					userId: ctx.session.user.id,
					movieId: input.movieId,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	getMyWatchlist: protectedProcedure
		.input(
			z.object({
				cursor: z.number().int().min(0).nullish(),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const offset = input.cursor ?? 0;
			const entries = await ctx.db.query.watchlistEntries.findMany({
				where: eq(schema.watchlistEntries.userId, ctx.session.user.id),
				with: { movie: true },
				limit: input.limit,
				offset,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			return entries.map((e) => ({
				...e.movie,
				inWatchlist: true,
				addedAt: e.createdAt,
			}));
		}),

	getUserWatchlist: publicProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				limit: z.number().int().min(1).max(100).default(30),
			}),
		)
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.watchlistEntries.findMany({
				where: eq(schema.watchlistEntries.userId, input.userId),
				with: { movie: true },
				limit: input.limit,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			const movieIds = entries.map((e) => e.movie.id);
			const watchlistSet = await getMovieIdSet(
				ctx,
				schema.watchlistEntries,
				movieIds,
			);

			return entries.map((e) => ({
				...e.movie,
				inWatchlist: watchlistSet.has(e.movie.id),
			}));
		}),

	remove: protectedProcedure
		.input(z.object({ movieId: z.number().int().positive() }))
		.mutation(async ({ ctx, input }) => {
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
});
