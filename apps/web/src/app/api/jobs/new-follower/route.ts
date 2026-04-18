import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sendNewFollowerPushNotification } from "@miru/trpc/jobs";
import { db } from "@/lib/server";
import { env } from "@/env";

async function handler(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}

	if (
		!payload ||
		typeof payload !== "object" ||
		(payload as { type?: unknown }).type !== "new-follower"
	) {
		return NextResponse.json({ error: "invalid payload" }, { status: 400 });
	}

	const { followerId, followerName, userId } = payload as {
		followerId: string;
		followerName: string;
		userId: string;
	};

	try {
		await sendNewFollowerPushNotification({
			captureException: (error, extra) => {
				Sentry.withScope((scope) => {
					if (extra) scope.setExtras(extra);
					Sentry.captureException(error);
				});
			},
			db,
			...(env.EXPO_ACCESS_TOKEN
				? { expoAccessToken: env.EXPO_ACCESS_TOKEN }
				: {}),
			followerId,
			followerName,
			userId,
		});
	} catch (error) {
		Sentry.captureException(error, {
			extra: { job: "new-follower", followerId, userId },
		});
		return NextResponse.json({ error: "job failed" }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}

export const POST = verifySignatureAppRouter(handler);
