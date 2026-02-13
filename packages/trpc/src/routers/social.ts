import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { annotateFollowStatus } from "../helpers";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const socialRouter = router({
	follow: protectedProcedure
		.input(z.object({ friendId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (input.friendId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot follow yourself",
				});
			}

			await ctx.db
				.insert(schema.follows)
				.values({
					followerId: ctx.session.user.id,
					followingId: input.friendId,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	getFollowers: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const followers = await ctx.db
				.select({
					id: schema.users.id,
					name: schema.users.name,
					image: schema.users.image,
				})
				.from(schema.follows)
				.innerJoin(schema.users, eq(schema.users.id, schema.follows.followerId))
				.where(eq(schema.follows.followingId, input.userId));

			return annotateFollowStatus(ctx, followers);
		}),

	getFollowing: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const following = await ctx.db
				.select({
					id: schema.users.id,
					name: schema.users.name,
					image: schema.users.image,
				})
				.from(schema.follows)
				.innerJoin(
					schema.users,
					eq(schema.users.id, schema.follows.followingId),
				)
				.where(eq(schema.follows.followerId, input.userId));

			return annotateFollowStatus(ctx, following);
		}),

	getMatchesWith: protectedProcedure
		.input(z.object({ friendId: z.string() }))
		.query(async ({ ctx, input }) => {
			const myWatchlist = ctx.db
				.select({ movieId: schema.watchlistEntries.movieId })
				.from(schema.watchlistEntries)
				.where(eq(schema.watchlistEntries.userId, ctx.session.user.id))
				.as("my_watchlist");

			const matches = await ctx.db
				.select({
					id: schema.movies.id,
					title: schema.movies.title,
					posterPath: schema.movies.posterPath,
					releaseDate: schema.movies.releaseDate,
					overview: schema.movies.overview,
				})
				.from(schema.watchlistEntries)
				.innerJoin(
					schema.movies,
					eq(schema.movies.id, schema.watchlistEntries.movieId),
				)
				.innerJoin(myWatchlist, eq(myWatchlist.movieId, schema.movies.id))
				.where(eq(schema.watchlistEntries.userId, input.friendId));

			return matches.map((m) => ({ ...m, inWatchlist: true }));
		}),

	searchUsers: publicProcedure
		.input(z.object({ query: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const escaped = input.query.replace(/[%_\\]/g, "\\$&");
			const users = await ctx.db
				.select({
					id: schema.users.id,
					name: schema.users.name,
					image: schema.users.image,
					email: schema.users.email,
				})
				.from(schema.users)
				.where(ilike(schema.users.name, `%${escaped}%`))
				.limit(20);

			return annotateFollowStatus(ctx, users);
		}),

	unfollow: protectedProcedure
		.input(z.object({ friendId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(schema.follows)
				.where(
					and(
						eq(schema.follows.followerId, ctx.session.user.id),
						eq(schema.follows.followingId, input.friendId),
					),
				);

			return { success: true };
		}),
});
