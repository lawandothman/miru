import { and, eq } from "drizzle-orm";
import { type Database, schema } from "@miru/db";

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
	body: string;
	data?: Record<string, string>;
	priority?: "default" | "high" | "normal";
	sound?: "default" | null;
	to: string;
	title: string;
}

interface NewFollowerPushInput {
	db: Database;
	followerId: string;
	followerName: string;
	userId: string;
}

async function sendExpoPushMessages(messages: ExpoPushMessage[]) {
	if (messages.length === 0) {
		return;
	}

	const response = await fetch(EXPO_PUSH_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(messages),
	});

	if (!response.ok) {
		throw new Error(`Expo push request failed with status ${response.status}`);
	}
}

export async function sendNewFollowerPushNotification({
	db,
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
		);
	} catch {
		// Ignore push delivery failures so following still succeeds.
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
