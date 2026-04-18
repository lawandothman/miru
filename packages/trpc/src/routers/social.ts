import { type Database, schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike, isNull, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { annotateFollowStatus, getBlockedUserIds } from "../helpers";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { newFollowerJob } from "../jobs";

type DashboardMatch = {
	id: number;
	posterPath: string | null;
	title: string;
};

async function fetchDashboardMatches(db: Database, userId: string) {
	const myWatchlist = alias(schema.watchlistEntries, "my_watchlist");
	const myWatched = alias(schema.watchedEntries, "my_watched");
	const friendWatched = alias(schema.watchedEntries, "friend_watched");
	const blockedByMe = alias(schema.blockedUsers, "blocked_by_me");
	const blockedMe = alias(schema.blockedUsers, "blocked_me");

	const rows = await db
		.select({
			id: schema.users.id,
			name: schema.users.name,
			image: schema.users.image,
			matchCount: count(schema.movies.id),
			matches: sql<DashboardMatch[]>`
				coalesce(
					jsonb_agg(
						jsonb_build_object(
							'id', ${schema.movies.id},
							'title', ${schema.movies.title},
							'posterPath', ${schema.movies.posterPath}
						)
						order by ${schema.watchlistEntries.createdAt} desc, ${schema.movies.id} desc
					) filter (where ${schema.movies.id} is not null),
					'[]'::jsonb
				)
			`,
		})
		.from(schema.follows)
		.innerJoin(schema.users, eq(schema.users.id, schema.follows.followingId))
		.innerJoin(
			schema.watchlistEntries,
			eq(schema.watchlistEntries.userId, schema.follows.followingId),
		)
		.innerJoin(
			myWatchlist,
			and(
				eq(myWatchlist.userId, userId),
				eq(myWatchlist.movieId, schema.watchlistEntries.movieId),
			),
		)
		.innerJoin(
			schema.movies,
			eq(schema.movies.id, schema.watchlistEntries.movieId),
		)
		.leftJoin(
			myWatched,
			and(
				eq(myWatched.userId, userId),
				eq(myWatched.movieId, schema.movies.id),
			),
		)
		.leftJoin(
			friendWatched,
			and(
				eq(friendWatched.userId, schema.follows.followingId),
				eq(friendWatched.movieId, schema.movies.id),
			),
		)
		.leftJoin(
			blockedByMe,
			and(
				eq(blockedByMe.blockerId, userId),
				eq(blockedByMe.blockedId, schema.follows.followingId),
			),
		)
		.leftJoin(
			blockedMe,
			and(
				eq(blockedMe.blockerId, schema.follows.followingId),
				eq(blockedMe.blockedId, userId),
			),
		)
		.where(
			and(
				eq(schema.follows.followerId, userId),
				eq(schema.movies.adult, false),
				isNull(myWatched.movieId),
				isNull(friendWatched.movieId),
				isNull(blockedByMe.blockedId),
				isNull(blockedMe.blockerId),
			),
		)
		.groupBy(schema.users.id, schema.users.name, schema.users.image)
		.orderBy(desc(count(schema.movies.id)), schema.users.id);

	return rows.map(({ matchCount: _, matches, ...row }) => ({
		...row,
		matches:
			typeof matches === "string"
				? (JSON.parse(matches) as DashboardMatch[])
				: matches,
	}));
}

async function assertUserExists(db: Database, userId: string) {
	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, userId),
		columns: { id: true },
	});
	if (!user) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "User not found",
		});
	}
}

export const socialRouter = router({
	block: protectedProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			if (input.userId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot block yourself",
				});
			}

			await assertUserExists(ctx.db, input.userId);

			await ctx.db
				.insert(schema.blockedUsers)
				.values({
					blockerId: ctx.session.user.id,
					blockedId: input.userId,
				})
				.onConflictDoNothing();

			await ctx.db
				.delete(schema.follows)
				.where(
					or(
						and(
							eq(schema.follows.followerId, ctx.session.user.id),
							eq(schema.follows.followingId, input.userId),
						),
						and(
							eq(schema.follows.followerId, input.userId),
							eq(schema.follows.followingId, ctx.session.user.id),
						),
					),
				);

			return { success: true };
		}),

	getBlockedUsers: protectedProcedure.query(({ ctx }) => {
		return ctx.db
			.select({
				id: schema.users.id,
				name: schema.users.name,
				image: schema.users.image,
			})
			.from(schema.blockedUsers)
			.innerJoin(
				schema.users,
				eq(schema.users.id, schema.blockedUsers.blockedId),
			)
			.where(eq(schema.blockedUsers.blockerId, ctx.session.user.id));
	}),

	getDashboardMatches: protectedProcedure.query(async ({ ctx }) => {
		return fetchDashboardMatches(ctx.db, ctx.session.user.id);
	}),

	follow: protectedProcedure
		.input(z.object({ friendId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			if (input.friendId === ctx.session.user.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot follow yourself",
				});
			}

			const [, blockedIds] = await Promise.all([
				assertUserExists(ctx.db, input.friendId),
				getBlockedUserIds(ctx.db, ctx.session.user.id),
			]);
			if (blockedIds.has(input.friendId)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot follow this user",
				});
			}

			const [follow] = await ctx.db
				.insert(schema.follows)
				.values({
					followerId: ctx.session.user.id,
					followingId: input.friendId,
				})
				.onConflictDoNothing()
				.returning();

			if (follow) {
				const payload = {
					followerId: ctx.session.user.id,
					followerName: ctx.session.user.name,
					userId: input.friendId,
				};
				void newFollowerJob
					.publish(payload)
					.then((published) => {
						if (!published) {
							ctx.captureException?.(
								new Error("Failed to publish new-follower job"),
								payload,
							);
						}
					})
					.catch((error) => {
						ctx.captureException?.(error, payload);
					});
			}

			return { success: true };
		}),

	getFollowers: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const blockedIdsPromise = ctx.session?.user
				? getBlockedUserIds(ctx.db, ctx.session.user.id)
				: Promise.resolve(new Set<string>());

			const [blockedIds, followers] = await Promise.all([
				blockedIdsPromise,
				ctx.db
					.select({
						id: schema.users.id,
						name: schema.users.name,
						image: schema.users.image,
					})
					.from(schema.follows)
					.innerJoin(
						schema.users,
						eq(schema.users.id, schema.follows.followerId),
					)
					.where(eq(schema.follows.followingId, input.userId)),
			]);

			return annotateFollowStatus(
				ctx,
				followers.filter((f) => !blockedIds.has(f.id)),
			);
		}),

	getFollowing: publicProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const blockedIdsPromise = ctx.session?.user
				? getBlockedUserIds(ctx.db, ctx.session.user.id)
				: Promise.resolve(new Set<string>());

			const [blockedIds, following] = await Promise.all([
				blockedIdsPromise,
				ctx.db
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
					.where(eq(schema.follows.followerId, input.userId)),
			]);

			return annotateFollowStatus(
				ctx,
				following.filter((f) => !blockedIds.has(f.id)),
			);
		}),

	getMatchesWith: protectedProcedure
		.input(z.object({ friendId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			const [blockedIds] = await Promise.all([
				getBlockedUserIds(ctx.db, ctx.session.user.id),
				assertUserExists(ctx.db, input.friendId),
			]);
			if (blockedIds.has(input.friendId)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const myWatchlist = ctx.db
				.select({ movieId: schema.watchlistEntries.movieId })
				.from(schema.watchlistEntries)
				.where(eq(schema.watchlistEntries.userId, ctx.session.user.id))
				.as("my_watchlist");

			const [matches, myWatchedEntries, friendWatchedEntries] =
				await Promise.all([
					ctx.db
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
						.where(eq(schema.watchlistEntries.userId, input.friendId)),
					ctx.db
						.select({ movieId: schema.watchedEntries.movieId })
						.from(schema.watchedEntries)
						.where(eq(schema.watchedEntries.userId, ctx.session.user.id)),
					ctx.db
						.select({ movieId: schema.watchedEntries.movieId })
						.from(schema.watchedEntries)
						.where(eq(schema.watchedEntries.userId, input.friendId)),
				]);

			const myWatchedSet = new Set(myWatchedEntries.map((e) => e.movieId));
			const friendWatchedSet = new Set(
				friendWatchedEntries.map((e) => e.movieId),
			);

			return matches
				.filter((m) => !myWatchedSet.has(m.id) && !friendWatchedSet.has(m.id))
				.map((m) => ({ ...m, inWatchlist: true }));
		}),

	searchUsers: publicProcedure
		.input(z.object({ query: z.string().min(1).max(100) }))
		.query(async ({ ctx, input }) => {
			const escaped = input.query.replace(/[%_\\]/g, "\\$&");
			const currentUserId = ctx.session?.user?.id;
			const blockedIdsPromise = currentUserId
				? getBlockedUserIds(ctx.db, currentUserId)
				: Promise.resolve(new Set<string>());

			const [blockedIds, users] = await Promise.all([
				blockedIdsPromise,
				ctx.db
					.select({
						id: schema.users.id,
						name: schema.users.name,
						image: schema.users.image,
					})
					.from(schema.users)
					.where(
						and(
							ilike(schema.users.name, `%${escaped}%`),
							currentUserId ? ne(schema.users.id, currentUserId) : undefined,
						),
					)
					.limit(20),
			]);

			return annotateFollowStatus(
				ctx,
				users.filter((u) => !blockedIds.has(u.id)),
			);
		}),

	unblock: protectedProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(schema.blockedUsers)
				.where(
					and(
						eq(schema.blockedUsers.blockerId, ctx.session.user.id),
						eq(schema.blockedUsers.blockedId, input.userId),
					),
				);

			return { success: true };
		}),

	unfollow: protectedProcedure
		.input(z.object({ friendId: z.string().min(1) }))
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
