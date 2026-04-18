import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { findJob, type JobContext } from "@miru/trpc/jobs";
import { db } from "@/lib/server";
import { env } from "@/env";

async function handler(
	request: Request,
	context: { params: Promise<{ name: string }> },
) {
	const { name } = await context.params;
	const job = findJob(name);
	if (!job) {
		return NextResponse.json({ error: "unknown job" }, { status: 404 });
	}

	let rawPayload: unknown;
	try {
		rawPayload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}

	const jobContext: JobContext = {
		db,
		...(env.EXPO_ACCESS_TOKEN
			? { expoAccessToken: env.EXPO_ACCESS_TOKEN }
			: {}),
		captureException: (error, extra) => {
			Sentry.withScope((scope) => {
				if (extra) scope.setExtras(extra);
				Sentry.captureException(error);
			});
		},
	};

	let result;
	try {
		result = await job.parseAndHandle(rawPayload, jobContext);
	} catch (error) {
		Sentry.captureException(error, { extra: { job: name } });
		return NextResponse.json({ error: "job failed" }, { status: 500 });
	}

	if (!result.success) {
		return NextResponse.json(
			{ error: "invalid payload", issues: result.error.issues },
			{ status: 400 },
		);
	}

	return NextResponse.json({ ok: true });
}

export const POST = verifySignatureAppRouter(handler);
