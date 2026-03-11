import { schema } from "@miru/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { unregisterPushTokenForUser } from "../utils/expo-push";

const registerPushTokenInput = z.object({
	platform: z.enum(["android", "ios"]),
	token: z.string().min(1),
});

export const notificationRouter = router({
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
