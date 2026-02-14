import { schema } from "@miru/db";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { ensureMovieExists } from "./helpers";

export const watchlistRouter = router({
	add: protectedProcedure
		.input(z.object({ movieId: z.number() }))
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
				cursor: z.number().nullish(),
				limit: z.number().default(20),
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
		.input(z.object({ userId: z.string(), limit: z.number().default(30) }))
		.query(async ({ ctx, input }) => {
			const entries = await ctx.db.query.watchlistEntries.findMany({
				where: eq(schema.watchlistEntries.userId, input.userId),
				with: { movie: true },
				limit: input.limit,
				orderBy: (we, { desc }) => [desc(we.createdAt)],
			});

			const movieIds = entries.map((e) => e.movie.id);
			let watchlistSet = new Set<number>();
			if (ctx.session?.user && movieIds.length > 0) {
				const myEntries = await ctx.db
					.select({ movieId: schema.watchlistEntries.movieId })
					.from(schema.watchlistEntries)
					.where(
						and(
							eq(schema.watchlistEntries.userId, ctx.session.user.id),
							inArray(schema.watchlistEntries.movieId, movieIds),
						),
					);
				watchlistSet = new Set(myEntries.map((e) => e.movieId));
			}

			return entries.map((e) => ({
				...e.movie,
				inWatchlist: watchlistSet.has(e.movie.id),
			}));
		}),

	remove: protectedProcedure
		.input(z.object({ movieId: z.number() }))
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
