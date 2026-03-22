import { and, eq } from "drizzle-orm";
import { type Database, schema } from "@miru/db";

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
	body: string;
	data?: Record<string, string>;
	priority?: "default" | "high" | "normal";
	sound?: "default" | null;
	to: string;
	title: string;
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

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (expoAccessToken) {
		headers["Authorization"] = `Bearer ${expoAccessToken}`;
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
	const invalidTokens = (body.data ?? []).flatMap((ticket, index) => {
		if (ticket.status !== "error") {
			return [];
		}

		if (ticket.details?.error !== "DeviceNotRegistered") {
			return [];
		}

		return [messages[index]?.to].filter((token): token is string =>
			Boolean(token),
		);
	});

	if (invalidTokens.length > 0) {
		await deletePushTokens(db, invalidTokens);
	}
}

export async function sendWatchlistMatchPushNotifications({
	captureException,
	db,
	expoAccessToken,
	movieId,
	userId,
	userName,
}: WatchlistMatchPushInput) {
	const [movie, recipients] = await Promise.all([
		db.query.movies.findFirst({
			where: eq(schema.movies.id, movieId),
			columns: { title: true },
		}),
		db
			.select({ token: schema.pushTokens.token })
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

	if (!movie || recipients.length === 0) {
		return;
	}

	try {
		await sendExpoPushMessages(
			db,
			recipients.map(({ token }) => ({
				to: token,
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

	try {
		await sendExpoPushMessages(
			db,
			recipient.pushTokens.map(({ token }) => ({
				to: token,
				title: "New follower",
				body: `${followerName} started following you.`,
				sound: "default",
				priority: "high",
				data: {
					type: "new-follower",
					userId: followerId,
				},
			})),
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
