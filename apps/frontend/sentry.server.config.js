// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (process.env.NODE_ENV === 'production' && !!SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: 1.0,
    beforeSend(event, hint) {
      if (
        hint?.originalException instanceof Error &&
        hint?.originalException?.message === 'Network Error'
      ) {
        return null
      }
      return event
    },
  })
}
