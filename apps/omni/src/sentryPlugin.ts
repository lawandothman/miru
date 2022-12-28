import type { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener, GraphQLServerContext, GraphQLServerListener } from '@apollo/server'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { ProfilingIntegration } from '@sentry/profiling-node'
import type { Context } from '.'
import { uuid4 } from '@sentry/utils'
import { config } from './config'

Sentry.init({
  dsn: config.sentryUrl,
  environment: process.env.NODE_ENV ?? 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV == 'production' ? 0.2 : 1.0,
  integrations: [
    // add profiling integration
    new ProfilingIntegration()
  ],
  profilesSampleRate: process.env.NODE_ENV == 'production' ? 0.2 : 1.0,
})

export default class SentryPlugin implements ApolloServerPlugin {

  async requestDidStart?(requestContext: GraphQLRequestContext<Context>): Promise<GraphQLRequestListener<Context> | void> {
    const transaction = Sentry.startTransaction({
      op: uuid4(),
      data: {
        query: requestContext.request.query,
      },
      name: requestContext.request.operationName ?? 'no-name'
    })
    return {
      async didEncounterErrors(context) {
        for(const err of context.errors) {
          Sentry.captureException(err)
        }
      },
      async executionDidStart() {
        return {
          async executionDidEnd() {
            transaction.finish()
          }
        }
      }
    }
  }
}