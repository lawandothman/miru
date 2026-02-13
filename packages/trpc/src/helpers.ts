import type { Database } from "@miru/db";
import { schema } from "@miru/db";
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
