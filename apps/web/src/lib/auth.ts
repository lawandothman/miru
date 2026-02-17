import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createDb, schema } from "@miru/db";
import { env } from "@/env";

const db = createDb(env.DATABASE_URL);

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
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
	plugins: [nextCookies()],
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
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
