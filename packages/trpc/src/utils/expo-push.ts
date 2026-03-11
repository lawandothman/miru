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
