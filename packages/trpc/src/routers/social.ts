import { schema } from "@miru/db";
import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const socialRouter = router({
	follow: protectedProcedure
		.input(z.object({ friendId: z.string() }))
		.mutation(async ({ ctx, input }) => {
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
			const users = await ctx.db
				.select({
					id: schema.users.id,
					name: schema.users.name,
					image: schema.users.image,
					email: schema.users.email,
				})
				.from(schema.users)
				.where(ilike(schema.users.name, `%${input.query}%`))
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

async function annotateFollowStatus(
	ctx: {
		db: import("@miru/db").Database;
		session: { user: { id: string } } | null;
	},
	users: { id: string; name: string | null; image: string | null }[],
) {
	if (!ctx.session?.user || users.length === 0) {
		return users.map((u) => ({ ...u, isFollower: false, isFollowing: false }));
	}

	const userIds = users.map((u) => u.id);
	const myId = ctx.session.user.id;

	// People I follow among these users
	const followingRows = await ctx.db
		.select({ followingId: schema.follows.followingId })
		.from(schema.follows)
		.where(
			and(
				eq(schema.follows.followerId, myId),
				sql`${schema.follows.followingId} IN ${userIds}`,
			),
		);
	const followingSet = new Set(followingRows.map((r) => r.followingId));

	// People who follow me among these users
	const followerRows = await ctx.db
		.select({ followerId: schema.follows.followerId })
		.from(schema.follows)
		.where(
			and(
				eq(schema.follows.followingId, myId),
				sql`${schema.follows.followerId} IN ${userIds}`,
			),
		);
	const followerSet = new Set(followerRows.map((r) => r.followerId));

	return users.map((u) => ({
		...u,
		isFollower: followerSet.has(u.id),
		isFollowing: followingSet.has(u.id),
	}));
}
