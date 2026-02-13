import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createDb, schema } from "@miru/db";

const db = createDb(process.env["DATABASE_URL"] ?? "");

export const auth = betterAuth({
	baseURL: process.env["BETTER_AUTH_URL"],
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
			clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
			clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
		},
	},
	user: {
		additionalFields: {
			isBot: {
				type: "boolean",
				defaultValue: false,
				input: false,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
