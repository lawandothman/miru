import * as Sentry from "@sentry/nextjs";
import { and, type Database, eq, schema } from "@miru/db";
import { getAppleClientSecret } from "@/lib/apple-client-secret";
import { env } from "@/env";

const APPLE_REVOKE_URL = "https://appleid.apple.com/auth/revoke";

export async function revokeAppleTokenForUser(
	db: Database,
	userId: string,
): Promise<void> {
	if (!env.APPLE_CLIENT_ID) {
		return;
	}

	const clientSecret = await getAppleClientSecret();
	if (!clientSecret) {
		return;
	}

	const account = await db.query.accounts.findFirst({
		where: and(
			eq(schema.accounts.userId, userId),
			eq(schema.accounts.providerId, "apple"),
		),
		columns: { refreshToken: true, accessToken: true },
	});

	const token = account?.refreshToken ?? account?.accessToken;
	if (!token) {
		return;
	}

	const tokenTypeHint = account?.refreshToken
		? "refresh_token"
		: "access_token";

	try {
		const body = new URLSearchParams({
			client_id: env.APPLE_CLIENT_ID,
			client_secret: clientSecret,
			token,
			token_type_hint: tokenTypeHint,
		});

		const res = await fetch(APPLE_REVOKE_URL, {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body,
		});

		if (!res.ok) {
			Sentry.captureMessage("Apple token revoke failed", {
				level: "warning",
				tags: { flow: "delete-user", provider: "apple" },
				extra: {
					userId,
					status: res.status,
					body: await res.text().catch(() => "<unreadable>"),
				},
			});
		}
	} catch (error) {
		Sentry.captureException(error, {
			tags: { flow: "delete-user", provider: "apple" },
			extra: { userId },
		});
	}
}
