import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";
import { createDb, schema } from "@miru/db";
import { env } from "@/env";

const db = createDb(env.DATABASE_URL);

const isPreview = process.env["VERCEL_ENV"] === "preview";
const vercelUrl = isPreview
	? env.VERCEL_BRANCH_URL
		? `https://${env.VERCEL_BRANCH_URL}`
		: env.VERCEL_URL
			? `https://${env.VERCEL_URL}`
			: undefined
	: undefined;

export const auth = betterAuth({
	baseURL: vercelUrl ?? env.BETTER_AUTH_URL,
	trustedOrigins: ["https://*.vercel.app"],
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
	plugins: [
		nextCookies(),
		oAuthProxy({
			currentURL: vercelUrl ?? env.BETTER_AUTH_URL,
			productionURL: env.BETTER_AUTH_URL,
		}),
	],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
			redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
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
