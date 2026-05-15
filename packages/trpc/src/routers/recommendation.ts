import { schema } from "@miru/db";
import { MAX_RECOMMENDATION_MESSAGE_LENGTH } from "@miru/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, lt } from "drizzle-orm";
import { z } from "zod";
import { getBlockedUserIds } from "../helpers";
import { protectedProcedure, router } from "../trpc";
import { sendMovieRecommendationPushNotification } from "../utils/expo-push";
import { ensureMovieExists } from "./helpers";

const INBOX_PAGE_SIZE = 30;
const STATUSES = ["pending", "accepted", "dismissed"] as const;

export const recommendationRouter = router({
	send: protectedProcedure
		.input(
			z.object({
				message: z
					.string()
					.trim()
					.max(MAX_RECOMMENDATION_MESSAGE_LENGTH)
					.optional(),
				movieId: z.number().int().positive(),
				recipientId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const senderId = ctx.session.user.id;
			const message = input.message?.length ? input.message : null;

			if (input.recipientId === senderId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot recommend a movie to yourself",
				});
			}

			const [recipient, blockedIds, followRow] = await Promise.all([
				ctx.db.query.users.findFirst({
					where: eq(schema.users.id, input.recipientId),
					columns: { id: true, name: true },
				}),
				getBlockedUserIds(ctx.db, senderId),
				ctx.db
					.select({ followerId: schema.follows.followerId })
					.from(schema.follows)
					.where(
						and(
							eq(schema.follows.followerId, senderId),
							eq(schema.follows.followingId, input.recipientId),
						),
					)
					.limit(1),
			]);

			if (!recipient || blockedIds.has(input.recipientId)) {
				throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
			}

			if (followRow.length === 0) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only recommend movies to people you follow",
				});
			}

			await ensureMovieExists(ctx.db, ctx.tmdb, input.movieId);

			const existing = await ctx.db.query.movieRecommendations.findFirst({
				where: and(
					eq(schema.movieRecommendations.senderId, senderId),
					eq(schema.movieRecommendations.recipientId, input.recipientId),
					eq(schema.movieRecommendations.movieId, input.movieId),
					eq(schema.movieRecommendations.status, "pending"),
				),
				columns: { id: true },
			});

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: `You already recommended this to ${recipient.name ?? "this person"}. Wait for them to respond.`,
				});
			}

			const [inserted] = await ctx.db
				.insert(schema.movieRecommendations)
				.values({
					senderId,
					recipientId: input.recipientId,
					movieId: input.movieId,
					message,
				})
				.returning();

			if (!inserted) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send recommendation",
				});
			}

			sendMovieRecommendationPushNotification({
				...(ctx.captureException
					? { captureException: ctx.captureException }
					: {}),
				db: ctx.db,
				...(ctx.expoAccessToken
					? { expoAccessToken: ctx.expoAccessToken }
					: {}),
				message,
				movieId: input.movieId,
				recipientId: input.recipientId,
				recommendationId: inserted.id,
				senderId,
				senderName: ctx.session.user.name,
			}).catch(() => undefined);

			return { recommendationId: inserted.id };
		}),

	respond: protectedProcedure
		.input(
			z.object({
				action: z.enum(["accept", "dismiss"]),
				recommendationId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const recommendation = await ctx.db.query.movieRecommendations.findFirst({
				where: and(
					eq(schema.movieRecommendations.id, input.recommendationId),
					eq(schema.movieRecommendations.recipientId, userId),
				),
			});

			if (!recommendation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recommendation not found",
				});
			}

			if (recommendation.status !== "pending") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Recommendation already responded to",
				});
			}

			const nextStatus = input.action === "accept" ? "accepted" : "dismissed";

			await ctx.db
				.update(schema.movieRecommendations)
				.set({
					status: nextStatus,
					respondedAt: new Date(),
				})
				.where(eq(schema.movieRecommendations.id, input.recommendationId));

			if (input.action === "accept") {
				await ctx.db
					.insert(schema.watchlistEntries)
					.values({ userId, movieId: recommendation.movieId })
					.onConflictDoNothing();
			}

			return { status: nextStatus, movieId: recommendation.movieId };
		}),

	listIncoming: protectedProcedure
		.input(
			z
				.object({
					cursor: z.string().datetime().optional(),
					limit: z.number().int().min(1).max(50).default(INBOX_PAGE_SIZE),
					status: z.enum(STATUSES).optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const limit = input?.limit ?? INBOX_PAGE_SIZE;

			const conditions = [eq(schema.movieRecommendations.recipientId, userId)];
			if (input?.status) {
				conditions.push(eq(schema.movieRecommendations.status, input.status));
			}
			if (input?.cursor) {
				conditions.push(
					lt(schema.movieRecommendations.createdAt, new Date(input.cursor)),
				);
			}

			const [blockedIds, items] = await Promise.all([
				getBlockedUserIds(ctx.db, userId),
				ctx.db.query.movieRecommendations.findMany({
					where: and(...conditions),
					orderBy: desc(schema.movieRecommendations.createdAt),
					limit: limit + 1,
					with: {
						sender: { columns: { id: true, name: true, image: true } },
						movie: {
							columns: { id: true, title: true, posterPath: true },
						},
					},
				}),
			]);

			const filtered = items.filter((item) => !blockedIds.has(item.sender.id));
			const hasMore = filtered.length > limit;
			const recommendations = hasMore ? filtered.slice(0, limit) : filtered;
			const nextCursor = hasMore
				? recommendations[recommendations.length - 1]?.createdAt.toISOString()
				: undefined;

			return {
				recommendations: recommendations.map((r) => ({
					id: r.id,
					message: r.message,
					status: r.status,
					createdAt: r.createdAt,
					respondedAt: r.respondedAt,
					sender: r.sender,
					movie: r.movie,
				})),
				nextCursor,
			};
		}),

	getForMovie: protectedProcedure
		.input(z.object({ movieId: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const recommendation = await ctx.db.query.movieRecommendations.findFirst({
				where: and(
					eq(schema.movieRecommendations.recipientId, userId),
					eq(schema.movieRecommendations.movieId, input.movieId),
					eq(schema.movieRecommendations.status, "pending"),
				),
				orderBy: desc(schema.movieRecommendations.createdAt),
				with: {
					sender: { columns: { id: true, name: true, image: true } },
				},
			});

			if (!recommendation) {
				return null;
			}

			const blockedIds = await getBlockedUserIds(ctx.db, userId);
			if (blockedIds.has(recommendation.sender.id)) {
				return null;
			}

			return {
				id: recommendation.id,
				message: recommendation.message,
				createdAt: recommendation.createdAt,
				sender: recommendation.sender,
			};
		}),

	getRecipientCandidates: protectedProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(30),
				movieId: z.number().int().positive(),
				query: z.string().trim().max(100).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const conditions = [eq(schema.follows.followerId, userId)];
			if (input.query?.length) {
				const escaped = input.query.replace(/[%_\\]/g, "\\$&");
				conditions.push(ilike(schema.users.name, `%${escaped}%`));
			}

			const [blockedIds, candidates] = await Promise.all([
				getBlockedUserIds(ctx.db, userId),
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
					.where(and(...conditions))
					.orderBy(schema.users.name)
					.limit(input.limit),
			]);

			const visible = candidates.filter((c) => !blockedIds.has(c.id));
			if (visible.length === 0) {
				return [];
			}

			const candidateIds = visible.map((c) => c.id);

			const [watchlistRows, watchedRows, recentSendRows] = await Promise.all([
				ctx.db
					.select({ userId: schema.watchlistEntries.userId })
					.from(schema.watchlistEntries)
					.where(
						and(
							eq(schema.watchlistEntries.movieId, input.movieId),
							inArray(schema.watchlistEntries.userId, candidateIds),
						),
					),
				ctx.db
					.select({ userId: schema.watchedEntries.userId })
					.from(schema.watchedEntries)
					.where(
						and(
							eq(schema.watchedEntries.movieId, input.movieId),
							inArray(schema.watchedEntries.userId, candidateIds),
						),
					),
				ctx.db
					.select({
						recipientId: schema.movieRecommendations.recipientId,
						createdAt: schema.movieRecommendations.createdAt,
						status: schema.movieRecommendations.status,
					})
					.from(schema.movieRecommendations)
					.where(
						and(
							eq(schema.movieRecommendations.senderId, userId),
							eq(schema.movieRecommendations.movieId, input.movieId),
							inArray(
								schema.movieRecommendations.recipientId,
								candidateIds,
							),
						),
					)
					.orderBy(desc(schema.movieRecommendations.createdAt)),
			]);

			const watchlistSet = new Set(watchlistRows.map((r) => r.userId));
			const watchedSet = new Set(watchedRows.map((r) => r.userId));
			const recentSendMap = new Map<
				string,
				{ createdAt: Date; status: string }
			>();
			for (const row of recentSendRows) {
				if (!recentSendMap.has(row.recipientId)) {
					recentSendMap.set(row.recipientId, {
						createdAt: row.createdAt,
						status: row.status,
					});
				}
			}

			return visible.map((c) => {
				const recent = recentSendMap.get(c.id);
				return {
					id: c.id,
					name: c.name,
					image: c.image,
					inWatchlist: watchlistSet.has(c.id),
					isWatched: watchedSet.has(c.id),
					hasPendingSend: recent?.status === "pending",
					lastSentAt: recent?.createdAt ?? null,
				};
			});
		}),
});
