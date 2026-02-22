import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
import { createDb, schema } from "@miru/db";
import { env } from "@/env";

const db = createDb(env.DATABASE_URL);

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [
		"https://miru-chi.vercel.app",
		"miru://",
		...(process.env.NODE_ENV === "development"
			? ["https://*.ngrok-free.app", "http://localhost:3000"]
			: []),
	],
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
	plugins: [nextCookies(), expo()],
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
