import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().url(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		TMDB_API_READ_ACCESS_TOKEN: z.string().min(1),
		BLOB_READ_WRITE_TOKEN: z.string().optional(),
		SENTRY_AUTH_TOKEN: z.string().optional(),
		CRON_SECRET: z.string().optional(),
		VERCEL_URL: z.string().optional(),
	},
	client: {
		NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
	},
});
