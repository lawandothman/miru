import { schema } from "@miru/db";
import { and, count, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { unregisterPushTokenForUser } from "../utils/expo-push";

const registerPushTokenInput = z.object({
	platform: z.enum(["android", "ios"]),
	token: z.string().min(1),
});

const LIST_PAGE_SIZE = 30;

export const notificationRouter = router({
	list: protectedProcedure
		.input(
			z
				.object({
					cursor: z.string().datetime().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [eq(schema.notifications.userId, ctx.session.user.id)];

			if (input?.cursor) {
				conditions.push(
					lt(schema.notifications.createdAt, new Date(input.cursor)),
				);
			}

			const items = await ctx.db.query.notifications.findMany({
				where: and(...conditions),
				orderBy: desc(schema.notifications.createdAt),
				limit: LIST_PAGE_SIZE + 1,
				with: {
					actor: {
						columns: {
							id: true,
							name: true,
							image: true,
						},
					},
				},
			});

			const hasMore = items.length > LIST_PAGE_SIZE;
			const notifications = hasMore ? items.slice(0, LIST_PAGE_SIZE) : items;
			const nextCursor = hasMore
				? notifications[notifications.length - 1]?.createdAt.toISOString()
				: undefined;

			return { notifications, nextCursor };
		}),

	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const [result] = await ctx.db
			.select({ count: count() })
			.from(schema.notifications)
			.where(
				and(
					eq(schema.notifications.userId, ctx.session.user.id),
					eq(schema.notifications.read, false),
				),
			);

		return { count: result?.count ?? 0 };
	}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(schema.notifications)
			.set({ read: true })
			.where(
				and(
					eq(schema.notifications.userId, ctx.session.user.id),
					eq(schema.notifications.read, false),
				),
			);

		return { success: true };
	}),

	getPreferences: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.query.users.findFirst({
			where: eq(schema.users.id, ctx.session.user.id),
			columns: {
				pushNotificationsEnabled: true,
			},
		});

		return {
			enabled: user?.pushNotificationsEnabled ?? true,
		};
	}),

	registerPushToken: protectedProcedure
		.input(registerPushTokenInput)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.insert(schema.pushTokens)
				.values({
					platform: input.platform,
					token: input.token,
					userId: ctx.session.user.id,
				})
				.onConflictDoUpdate({
					target: schema.pushTokens.token,
					set: {
						platform: input.platform,
						updatedAt: new Date(),
						userId: ctx.session.user.id,
					},
				});

			return { success: true };
		}),

	setPreferences: protectedProcedure
		.input(
			z.object({
				enabled: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(schema.users)
				.set({
					pushNotificationsEnabled: input.enabled,
					updatedAt: new Date(),
				})
				.where(eq(schema.users.id, ctx.session.user.id));

			return { success: true };
		}),

	unregisterPushToken: protectedProcedure
		.input(
			z.object({
				token: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await unregisterPushTokenForUser(
				ctx.db,
				ctx.session.user.id,
				input.token,
			);
			return { success: true };
		}),
});
