import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { getBlockedUserIds } from "../helpers";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const blockedIds = ctx.session?.user
				? await getBlockedUserIds(ctx.db, ctx.session.user.id)
				: new Set<string>();

			if (blockedIds.has(input.id)) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}

			const user = await ctx.db.query.users.findFirst({
				where: eq(schema.users.id, input.id),
			});

			if (!user) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}

			const [[followerCount], [followingCount]] = await Promise.all([
				ctx.db
					.select({ count: count() })
					.from(schema.follows)
					.where(eq(schema.follows.followingId, input.id)),
				ctx.db
					.select({ count: count() })
					.from(schema.follows)
					.where(eq(schema.follows.followerId, input.id)),
			]);

			let isFollowing = false;
			let isFollower = false;
			let isBlocked = false;

			if (ctx.session?.user) {
				const [[followingRow], [followerRow], [blockRow]] = await Promise.all([
					ctx.db
						.select({ id: schema.follows.followingId })
						.from(schema.follows)
						.where(
							and(
								eq(schema.follows.followerId, ctx.session.user.id),
								eq(schema.follows.followingId, input.id),
							),
						),
					ctx.db
						.select({ id: schema.follows.followerId })
						.from(schema.follows)
						.where(
							and(
								eq(schema.follows.followerId, input.id),
								eq(schema.follows.followingId, ctx.session.user.id),
							),
						),
					ctx.db
						.select({ blockerId: schema.blockedUsers.blockerId })
						.from(schema.blockedUsers)
						.where(
							and(
								eq(schema.blockedUsers.blockerId, ctx.session.user.id),
								eq(schema.blockedUsers.blockedId, input.id),
							),
						),
				]);
				isFollowing = Boolean(followingRow);
				isFollower = Boolean(followerRow);
				isBlocked = Boolean(blockRow);
			}

			return {
				id: user.id,
				name: user.name,
				image: user.image,
				followerCount: followerCount?.count ?? 0,
				followingCount: followingCount?.count ?? 0,
				isFollowing,
				isFollower,
				isBlocked,
			};
		}),
});
