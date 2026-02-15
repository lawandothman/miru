import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

Sentry.init({
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	enabled: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
	sendDefaultPii: true,
	tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
	integrations: [Sentry.replayIntegration()],
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
