import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
import { createDb, schema } from "@miru/db";
import { env } from "@/env";

const db = createDb(env.DATABASE_URL);
const isDevelopment = process.env.NODE_ENV === "development";
const configuredHost = new URL(env.BETTER_AUTH_URL).host;

const sharedTrustedOrigins = [
	"https://watchmiru.app",
	"https://appleid.apple.com",
	"miru://",
];

const trustedOrigins = isDevelopment
	? [
			...sharedTrustedOrigins,
			"http://localhost:3000",
			"https://*.trycloudflare.com",
			"https://*.ngrok-free.app",
		]
	: [...sharedTrustedOrigins, "exp://"];

const allowedHosts = isDevelopment
	? [
			configuredHost,
			"localhost:3000",
			"127.0.0.1:3000",
			"*.vercel.app",
			"*.trycloudflare.com",
			"*.ngrok-free.app",
		]
	: [configuredHost, "*.vercel.app"];

export const auth = betterAuth({
	baseURL: {
		allowedHosts,
		fallback: env.BETTER_AUTH_URL,
		protocol: "auto",
	},
	trustedOrigins,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
		},
	}),
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // refresh daily
	},
	plugins: [nextCookies(), expo()],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
		},
		apple: {
			clientId: env.APPLE_CLIENT_ID ?? "",
			clientSecret: env.APPLE_CLIENT_SECRET ?? "",
			appBundleIdentifier: "com.miru.app",
		},
	},
	user: {
		additionalFields: {
			country: {
				type: "string",
				input: false,
			},
			onboardingCompletedAt: {
				type: "date",
				input: false,
			},
		},
		deleteUser: {
			enabled: true,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
