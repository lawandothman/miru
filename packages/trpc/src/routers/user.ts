import { schema } from "@miru/db";
import { TRPCError } from "@trpc/server";
import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";
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

		if (!ctx.session?.user) {
			return bots.map((b) => ({ ...b, isFollowing: false, isFollower: false }));
		}

		const botIds = bots.map((b) => b.id);
		const myId = ctx.session.user.id;

		const followingRows = await ctx.db
			.select({ followingId: schema.follows.followingId })
			.from(schema.follows)
			.where(
				and(
					eq(schema.follows.followerId, myId),
					sql`${schema.follows.followingId} IN ${botIds}`,
				),
			);
		const followingSet = new Set(followingRows.map((r) => r.followingId));

		const followerRows = await ctx.db
			.select({ followerId: schema.follows.followerId })
			.from(schema.follows)
			.where(
				and(
					eq(schema.follows.followingId, myId),
					sql`${schema.follows.followerId} IN ${botIds}`,
				),
			);
		const followerSet = new Set(followerRows.map((r) => r.followerId));

		return bots.map((b) => ({
			...b,
			isFollowing: followingSet.has(b.id),
			isFollower: followerSet.has(b.id),
		}));
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

			const [followerCount] = await ctx.db
				.select({ count: count() })
				.from(schema.follows)
				.where(eq(schema.follows.followingId, input.id));

			const [followingCount] = await ctx.db
				.select({ count: count() })
				.from(schema.follows)
				.where(eq(schema.follows.followerId, input.id));

			let isFollowing = false;
			let isFollower = false;

			if (ctx.session?.user) {
				const [followingRow] = await ctx.db
					.select({ id: schema.follows.followingId })
					.from(schema.follows)
					.where(
						and(
							eq(schema.follows.followerId, ctx.session.user.id),
							eq(schema.follows.followingId, input.id),
						),
					);
				isFollowing = Boolean(followingRow);

				const [followerRow] = await ctx.db
					.select({ id: schema.follows.followerId })
					.from(schema.follows)
					.where(
						and(
							eq(schema.follows.followerId, input.id),
							eq(schema.follows.followingId, ctx.session.user.id),
						),
					);
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
