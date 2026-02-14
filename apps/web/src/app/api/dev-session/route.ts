import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDb, schema, eq } from "@miru/db";

const DEV_EMAIL = "dev@localhost.test";
const DEV_PASSWORD = "dev-password-local-only";
const DEV_NAME = "Dev User";

function forwardCookies(from: Response, to: NextResponse) {
	for (const cookie of from.headers.getSetCookie()) {
		to.headers.append("Set-Cookie", cookie);
	}
	return to;
}

export async function GET(request: Request) {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Not available" }, { status: 404 });
	}

	const redirectUrl = new URL("/settings", request.url);

	try {
		const signInRes = await auth.api.signInEmail({
			body: { email: DEV_EMAIL, password: DEV_PASSWORD },
			asResponse: true,
		});
		if (signInRes.ok) {
			return forwardCookies(signInRes, NextResponse.redirect(redirectUrl));
		}
	} catch {
		// Sign-in failed
	}

	const db = createDb(process.env["DATABASE_URL"] ?? "");
	const existing = await db.query.users.findFirst({
		where: eq(schema.users.email, DEV_EMAIL),
	});
	if (existing) {
		await db.delete(schema.users).where(eq(schema.users.id, existing.id));
	}

	try {
		const signUpRes = await auth.api.signUpEmail({
			body: { email: DEV_EMAIL, name: DEV_NAME, password: DEV_PASSWORD },
			asResponse: true,
		});
		if (signUpRes.ok) {
			return forwardCookies(signUpRes, NextResponse.redirect(redirectUrl));
		}
		const body = await signUpRes.text();
		return NextResponse.json(
			{ error: "Sign-up failed", body },
			{ status: 500 },
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
