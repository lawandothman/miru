import { type Database, schema } from "@miru/db";
import { and, eq, inArray } from "drizzle-orm";

export async function annotateFollowStatus<
	T extends { id: string; name: string | null; image: string | null },
>(ctx: { db: Database; session: { user: { id: string } } | null }, users: T[]) {
	if (!ctx.session?.user || users.length === 0) {
		return users.map((u) => ({ ...u, isFollower: false, isFollowing: false }));
	}

	const userIds = users.map((u) => u.id);
	const myId = ctx.session.user.id;

	const [followingRows, followerRows] = await Promise.all([
		ctx.db
			.select({ followingId: schema.follows.followingId })
			.from(schema.follows)
			.where(
				and(
					eq(schema.follows.followerId, myId),
					inArray(schema.follows.followingId, userIds),
				),
			),
		ctx.db
			.select({ followerId: schema.follows.followerId })
			.from(schema.follows)
			.where(
				and(
					eq(schema.follows.followingId, myId),
					inArray(schema.follows.followerId, userIds),
				),
			),
	]);

	const followingSet = new Set(followingRows.map((r) => r.followingId));
	const followerSet = new Set(followerRows.map((r) => r.followerId));

	return users.map((u) => ({
		...u,
		isFollower: followerSet.has(u.id),
		isFollowing: followingSet.has(u.id),
	}));
}

export async function getMovieIdSet(
	ctx: { db: Database; session: { user: { id: string } } | null },
	table: typeof schema.watchlistEntries | typeof schema.watchedEntries,
	movieIds: number[],
): Promise<Set<number>> {
	if (!ctx.session?.user || movieIds.length === 0) {
		return new Set();
	}

	const entries = await ctx.db
		.select({ movieId: table.movieId })
		.from(table)
		.where(
			and(
				eq(table.userId, ctx.session.user.id),
				inArray(table.movieId, movieIds),
			),
		);

	return new Set(entries.map((e) => e.movieId));
}

export async function getMovieStatuses(
	ctx: { db: Database; session: { user: { id: string } } | null },
	movieIds: number[],
): Promise<{ watchlistSet: Set<number>; watchedSet: Set<number> }> {
	const [watchlistSet, watchedSet] = await Promise.all([
		getMovieIdSet(ctx, schema.watchlistEntries, movieIds),
		getMovieIdSet(ctx, schema.watchedEntries, movieIds),
	]);

	return { watchlistSet, watchedSet };
}

export function buildGenreMap(
	rows: { movieId: number; genreId: number }[],
): Map<number, number[]> {
	const map = new Map<number, number[]>();
	for (const row of rows) {
		const existing = map.get(row.movieId);
		if (existing) {
			existing.push(row.genreId);
		} else {
			map.set(row.movieId, [row.genreId]);
		}
	}
	return map;
}
