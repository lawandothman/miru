import { schema } from "@miru/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { ensureMovieExists } from "./helpers";

export const watchedRouter = router({
	add: protectedProcedure
		.input(z.object({ movieId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			await ensureMovieExists(ctx.db, ctx.tmdb, input.movieId);

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
