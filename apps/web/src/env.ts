import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().url(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		APPLE_CLIENT_ID: z.string().optional(),
		APPLE_TEAM_ID: z.string().optional(),
		APPLE_KEY_ID: z.string().optional(),
		APPLE_PRIVATE_KEY: z.string().optional(),
		TMDB_API_READ_ACCESS_TOKEN: z.string().min(1),
		BLOB_READ_WRITE_TOKEN: z.string().optional(),
		EXPO_ACCESS_TOKEN: z.string().optional(),
		SENTRY_AUTH_TOKEN: z.string().optional(),
		CRON_SECRET: z.string().optional(),
		VERCEL_URL: z.string().optional(),
		UPSTASH_REDIS_REST_URL: z.string().url().optional(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
		QSTASH_URL: z.string().url().optional(),
		QSTASH_TOKEN: z.string().min(1).optional(),
		QSTASH_CURRENT_SIGNING_KEY: z.string().min(1).optional(),
		QSTASH_NEXT_SIGNING_KEY: z.string().min(1).optional(),
		RESEND_API_KEY: z.string().min(1),
		EMAIL_FROM: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
		NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
		NEXT_PUBLIC_POSTHOG_KEY: process.env["NEXT_PUBLIC_POSTHOG_KEY"],
	},
});
