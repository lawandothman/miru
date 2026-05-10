import { SignJWT, importPKCS8 } from "jose";
import { env } from "@/env";

let cached: Promise<string> | null = null;

export function getAppleClientSecret(): Promise<string> {
	if (cached === null) {
		cached = generate();
	}
	return cached;
}

async function generate(): Promise<string> {
	if (
		!env.APPLE_CLIENT_ID ||
		!env.APPLE_TEAM_ID ||
		!env.APPLE_KEY_ID ||
		!env.APPLE_PRIVATE_KEY
	) {
		return "";
	}

	const privateKey = await importPKCS8(
		env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		"ES256",
	);

	const now = Math.floor(Date.now() / 1000);
	const sixMonths = 60 * 60 * 24 * 180;

	return await new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
		.setIssuer(env.APPLE_TEAM_ID)
		.setIssuedAt(now)
		.setExpirationTime(now + sixMonths - 60)
		.setAudience("https://appleid.apple.com")
		.setSubject(env.APPLE_CLIENT_ID)
		.sign(privateKey);
}
