import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { annotateFollowStatus } from "../helpers";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const socialRouter = router({
	getDashboardMatches: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Single query: for each friend I follow, find movies we both have in our watchlists
		const rows = await ctx.db
			.select({
				friendId: schema.users.id,
				friendName: schema.users.name,
				friendImage: schema.users.image,
				movieId: schema.movies.id,
				movieTitle: schema.movies.title,
				moviePosterPath: schema.movies.posterPath,
			})
			.from(schema.follows)
			.innerJoin(
				schema.users,
				eq(schema.users.id, schema.follows.followingId),
			)
			.innerJoin(
				schema.watchlistEntries,
				eq(schema.watchlistEntries.userId, schema.follows.followingId),
			)
			.innerJoin(
				schema.movies,
				eq(schema.movies.id, schema.watchlistEntries.movieId),
			)
			.where(
				and(
					eq(schema.follows.followerId, userId),
					eq(schema.movies.adult, false),
				),
			);

		// Get my watchlist movie IDs to filter for actual matches
		const myWatchlist = await ctx.db
			.select({ movieId: schema.watchlistEntries.movieId })
			.from(schema.watchlistEntries)
			.where(eq(schema.watchlistEntries.userId, userId));

		const myMovieIds = new Set(myWatchlist.map((w) => w.movieId));

		// Group by friend, only keep movies that are also in my watchlist
		const friendMap = new Map<
			string,
			{
				id: string;
				name: string | null;
				image: string | null;
				matches: { id: number; title: string; posterPath: string | null }[];
			}
		>();

		for (const row of rows) {
			if (!myMovieIds.has(row.movieId)) continue;

			let friend = friendMap.get(row.friendId);
			if (!friend) {
				friend = {
					id: row.friendId,
					name: row.friendName,
					image: row.friendImage,
					matches: [],
				};
				friendMap.set(row.friendId, friend);
			}
			friend.matches.push({
				id: row.movieId,
				title: row.movieTitle,
				posterPath: row.moviePosterPath,
			});
		}

		return Array.from(friendMap.values()).sort(
			(a, b) => b.matches.length - a.matches.length,
		);
	}),

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
