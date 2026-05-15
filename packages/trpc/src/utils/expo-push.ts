import { type Database, schema } from "@miru/db";
import type { TypedNotificationData } from "@miru/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushTicket {
	details?: {
		error?: string;
	};
	status: "error" | "ok";
}

interface ExpoPushResponse {
	data?: ExpoPushTicket[];
}

interface ExpoPushMessage {
	badge?: number;
	body: string;
	data?: Record<string, string>;
	priority?: "default" | "high" | "normal";
	sound?: "default" | null;
	to: string;
	title: string;
}

interface PushRecipient {
	token: string;
	userId: string;
}

interface WatchlistMatchPushInput {
	captureException?: (
		error: unknown,
		context?: Record<string, unknown>,
	) => void;
	db: Database;
	expoAccessToken?: string;
	movieId: number;
	userId: string;
	userName: string;
}

interface NewFollowerPushInput {
	captureException?: (
		error: unknown,
		context?: Record<string, unknown>,
	) => void;
	db: Database;
	expoAccessToken?: string;
	followerId: string;
	followerName: string;
	userId: string;
}

interface MovieRecommendationPushInput {
	captureException?: (
		error: unknown,
		context?: Record<string, unknown>,
	) => void;
	db: Database;
	expoAccessToken?: string;
	message: string | null;
	movieId: number;
	recipientId: string;
	recommendationId: string;
	senderId: string;
	senderName: string;
}

async function deletePushTokens(db: Database, tokens: string[]) {
	await Promise.all(
		tokens.map((token) =>
			db.delete(schema.pushTokens).where(eq(schema.pushTokens.token, token)),
		),
	);
}

async function sendExpoPushMessages(
	db: Database,
	messages: ExpoPushMessage[],
	expoAccessToken?: string,
) {
	if (messages.length === 0) {
		return;
	}

	const headers: { Authorization?: string; "Content-Type": string } = {
		"Content-Type": "application/json",
	};

	if (expoAccessToken) {
		headers.Authorization = `Bearer ${expoAccessToken}`;
	}

	const response = await fetch(EXPO_PUSH_API_URL, {
		method: "POST",
		headers,
		body: JSON.stringify(messages),
	});

	if (!response.ok) {
		throw new Error(`Expo push request failed with status ${response.status}`);
	}

	const body = (await response.json()) as ExpoPushResponse;
	const invalidTokens: string[] = [];
	for (const [index, ticket] of (body.data ?? []).entries()) {
		if (
			ticket.status === "error" &&
			ticket.details?.error === "DeviceNotRegistered" &&
			messages[index]
		) {
			invalidTokens.push(messages[index].to);
		}
	}

	if (invalidTokens.length > 0) {
		await deletePushTokens(db, invalidTokens);
	}
}

function normalizeBadgeCount(value: unknown) {
	const badgeCount =
		typeof value === "number" ? value : Number.parseInt(String(value), 10);

	if (!Number.isFinite(badgeCount) || badgeCount <= 0) {
		return undefined;
	}

	return badgeCount;
}

async function getUnreadBadgeCounts(db: Database, userIds: string[]) {
	const uniqueUserIds = [...new Set(userIds)];

	if (uniqueUserIds.length === 0) {
		return new Map<string, number>();
	}

	const unreadCounts = await db
		.select({
			unreadCount: count(),
			userId: schema.notifications.userId,
		})
		.from(schema.notifications)
		.where(
			and(
				inArray(schema.notifications.userId, uniqueUserIds),
				eq(schema.notifications.read, false),
			),
		)
		.groupBy(schema.notifications.userId);

	return new Map(
		unreadCounts.flatMap(({ unreadCount, userId }) => {
			const badgeCount = normalizeBadgeCount(unreadCount);

			if (badgeCount === undefined) {
				return [];
			}

			return [[userId, badgeCount] as const];
		}),
	);
}

export function buildBadgeAwarePushMessages(
	recipients: PushRecipient[],
	unreadBadgeCounts: ReadonlyMap<string, number>,
	createMessage: (
		recipient: PushRecipient,
	) => Omit<ExpoPushMessage, "badge" | "to">,
) {
	return recipients.map((recipient) => {
		const badgeCount = normalizeBadgeCount(
			unreadBadgeCounts.get(recipient.userId),
		);

		return {
			to: recipient.token,
			...createMessage(recipient),
			...(badgeCount === undefined ? {} : { badge: badgeCount }),
		};
	});
}

export async function sendWatchlistMatchPushNotifications({
	captureException,
	db,
	expoAccessToken,
	movieId,
	userId,
	userName,
}: WatchlistMatchPushInput) {
	const [movie, matchingFollowerIds, pushRecipients] = await Promise.all([
		db.query.movies.findFirst({
			where: eq(schema.movies.id, movieId),
			columns: { title: true, posterPath: true },
		}),
		// All followers with this movie in their watchlist (for in-app notifications)
		db
			.selectDistinct({ userId: schema.follows.followerId })
			.from(schema.follows)
			.innerJoin(
				schema.watchlistEntries,
				and(
					eq(schema.watchlistEntries.userId, schema.follows.followerId),
					eq(schema.watchlistEntries.movieId, movieId),
				),
			)
			.where(eq(schema.follows.followingId, userId)),
		// Push-eligible subset (notifications enabled + has tokens)
		db
			.select({
				token: schema.pushTokens.token,
				userId: schema.follows.followerId,
			})
			.from(schema.follows)
			.innerJoin(
				schema.watchlistEntries,
				and(
					eq(schema.watchlistEntries.userId, schema.follows.followerId),
					eq(schema.watchlistEntries.movieId, movieId),
				),
			)
			.innerJoin(
				schema.users,
				and(
					eq(schema.users.id, schema.follows.followerId),
					eq(schema.users.pushNotificationsEnabled, true),
				),
			)
			.innerJoin(
				schema.pushTokens,
				eq(schema.pushTokens.userId, schema.follows.followerId),
			)
			.where(eq(schema.follows.followingId, userId)),
	]);

	if (!movie) {
		return;
	}

	if (matchingFollowerIds.length > 0) {
		const notification = {
			type: "watchlist-match",
			data: {
				movieId: String(movieId),
				movieTitle: movie.title,
				posterPath: movie.posterPath,
			},
		} satisfies TypedNotificationData;

		try {
			await db.insert(schema.notifications).values(
				matchingFollowerIds.map(({ userId: recipientId }) => ({
					userId: recipientId,
					actorId: userId,
					...notification,
				})),
			);
		} catch (error) {
			captureException?.(error, {
				context: "watchlist-match-notification-insert",
				movieId: String(movieId),
				userId,
			});
		}
	}

	if (pushRecipients.length === 0) {
		return;
	}

	let unreadBadgeCounts = new Map<string, number>();

	try {
		unreadBadgeCounts = await getUnreadBadgeCounts(
			db,
			pushRecipients.map(({ userId: recipientUserId }) => recipientUserId),
		);
	} catch (error) {
		captureException?.(error, {
			context: "watchlist-match-badge-count",
			movieId: String(movieId),
			userId,
		});
	}

	try {
		await sendExpoPushMessages(
			db,
			buildBadgeAwarePushMessages(pushRecipients, unreadBadgeCounts, () => ({
				title: "New match",
				body: `${userName} wants to watch ${movie.title} too!`,
				sound: "default",
				priority: "high",
				data: {
					type: "watchlist-match",
					movieId: String(movieId),
				},
			})),
			expoAccessToken,
		);
	} catch (error) {
		captureException?.(error, {
			context: "watchlist-match-push",
			movieId: String(movieId),
			userId,
		});
	}
}

export async function sendNewFollowerPushNotification({
	captureException,
	db,
	expoAccessToken,
	followerId,
	followerName,
	userId,
}: NewFollowerPushInput) {
	const notification = {
		type: "new-follower",
		data: null,
	} satisfies TypedNotificationData;

	try {
		await db.insert(schema.notifications).values({
			userId,
			actorId: followerId,
			...notification,
		});
	} catch (error) {
		captureException?.(error, {
			context: "new-follower-notification-insert",
			followerId,
			userId,
		});
	}

	const recipient = await db.query.users.findFirst({
		where: eq(schema.users.id, userId),
		columns: {
			pushNotificationsEnabled: true,
		},
		with: {
			pushTokens: {
				columns: {
					token: true,
				},
			},
		},
	});

	if (
		!recipient?.pushNotificationsEnabled ||
		recipient.pushTokens.length === 0
	) {
		return;
	}

	let unreadBadgeCounts = new Map<string, number>();

	try {
		unreadBadgeCounts = await getUnreadBadgeCounts(db, [userId]);
	} catch (error) {
		captureException?.(error, {
			context: "new-follower-badge-count",
			followerId,
			userId,
		});
	}

	try {
		await sendExpoPushMessages(
			db,
			buildBadgeAwarePushMessages(
				recipient.pushTokens.map(({ token }) => ({ token, userId })),
				unreadBadgeCounts,
				() => ({
					title: "New follower",
					body: `${followerName} started following you.`,
					sound: "default",
					priority: "high",
					data: {
						type: "new-follower",
						userId: followerId,
					},
				}),
			),
			expoAccessToken,
		);
	} catch (error) {
		captureException?.(error, {
			context: "new-follower-push",
			followerId,
			userId,
		});
	}
}

export async function sendMovieRecommendationPushNotification({
	captureException,
	db,
	expoAccessToken,
	message,
	movieId,
	recipientId,
	recommendationId,
	senderId,
	senderName,
}: MovieRecommendationPushInput) {
	const [movie, recipient] = await Promise.all([
		db.query.movies.findFirst({
			where: eq(schema.movies.id, movieId),
			columns: { title: true, posterPath: true },
		}),
		db.query.users.findFirst({
			where: eq(schema.users.id, recipientId),
			columns: { pushNotificationsEnabled: true },
			with: { pushTokens: { columns: { token: true } } },
		}),
	]);

	if (!movie) {
		return;
	}

	const notification = {
		type: "movie-recommendation",
		data: {
			recommendationId,
			movieId: String(movieId),
			movieTitle: movie.title,
			posterPath: movie.posterPath,
			message,
		},
	} satisfies TypedNotificationData;

	try {
		await db.insert(schema.notifications).values({
			userId: recipientId,
			actorId: senderId,
			...notification,
		});
	} catch (error) {
		captureException?.(error, {
			context: "movie-recommendation-notification-insert",
			recommendationId,
			recipientId,
		});
	}

	if (
		!recipient?.pushNotificationsEnabled ||
		recipient.pushTokens.length === 0
	) {
		return;
	}

	let unreadBadgeCounts = new Map<string, number>();

	try {
		unreadBadgeCounts = await getUnreadBadgeCounts(db, [recipientId]);
	} catch (error) {
		captureException?.(error, {
			context: "movie-recommendation-badge-count",
			recommendationId,
			recipientId,
		});
	}

	try {
		await sendExpoPushMessages(
			db,
			buildBadgeAwarePushMessages(
				recipient.pushTokens.map(({ token }) => ({
					token,
					userId: recipientId,
				})),
				unreadBadgeCounts,
				() => ({
					title: `${senderName} recommended a movie`,
					body: message?.trim()
						? `"${message.trim()}" — ${movie.title}`
						: `Check out ${movie.title}`,
					sound: "default",
					priority: "high",
					data: {
						type: "movie-recommendation",
						movieId: String(movieId),
					},
				}),
			),
			expoAccessToken,
		);
	} catch (error) {
		captureException?.(error, {
			context: "movie-recommendation-push",
			recommendationId,
			recipientId,
		});
	}
}

export async function unregisterPushTokenForUser(
	db: Database,
	userId: string,
	token: string,
) {
	await db
		.delete(schema.pushTokens)
		.where(
			and(
				eq(schema.pushTokens.userId, userId),
				eq(schema.pushTokens.token, token),
			),
		);
}
