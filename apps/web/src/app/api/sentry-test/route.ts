import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
	const type = request.nextUrl.searchParams.get("type");

	if (type === "capture") {
		Sentry.captureException(
			new Error("Sentry Test: Edge API captureException"),
		);
		return NextResponse.json({
			message: "Error captured via Sentry.captureException()",
		});
	}

	throw new Error("Sentry Test: Edge API unhandled error");
}
