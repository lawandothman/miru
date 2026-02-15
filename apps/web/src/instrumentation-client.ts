import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

Sentry.init({
	dsn: env.NEXT_PUBLIC_SENTRY_DSN,
	enabled: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
	integrations: [Sentry.replayIntegration()],
	replaysSessionSampleRate: 0,
	replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
