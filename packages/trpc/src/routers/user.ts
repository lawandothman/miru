import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { annotateFollowStatus } from "../helpers";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
	getBots: publicProcedure.query(async ({ ctx }) => {
		const bots = await ctx.db
			.select({
				id: schema.users.id,
				name: schema.users.name,
				image: schema.users.image,
				isBot: schema.users.isBot,
			})
			.from(schema.users)
			.where(eq(schema.users.isBot, true));

		return annotateFollowStatus(ctx, bots);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
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

			if (ctx.session?.user) {
				const [[followingRow], [followerRow]] = await Promise.all([
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
				]);
				isFollowing = Boolean(followingRow);
				isFollower = Boolean(followerRow);
			}

			return {
				id: user.id,
				name: user.name,
				image: user.image,
				isBot: user.isBot,
				followerCount: followerCount?.count ?? 0,
				followingCount: followingCount?.count ?? 0,
				isFollowing,
				isFollower,
			};
		}),
});
