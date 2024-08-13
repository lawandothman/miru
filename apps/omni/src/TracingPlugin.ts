import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
} from '@apollo/server'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { ProfilingIntegration } from '@sentry/profiling-node'
import type { Context } from '.'
import { uuid4 } from '@sentry/utils'
import { config } from './config'
import Mixpanel from 'mixpanel'

Sentry.init({
  dsn: config.sentryUrl,
  environment: process.env.NODE_ENV ?? 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV == 'production' ? 1.0 : 1.0,
  integrations: [
    // add profiling integration
    new ProfilingIntegration(),
  ],
  profilesSampleRate: process.env.NODE_ENV == 'production' ? 1.0 : 1.0,
})

const mixpanel = Mixpanel.init(config.mixpanelKey, {
  host: 'api-eu.mixpanel.com',
})

export default class TracingPlugin implements ApolloServerPlugin {
  async requestDidStart?(
    requestContext: GraphQLRequestContext<Context>
  ): Promise<GraphQLRequestListener<Context> | void> {
    const startTime = Date.now()
    const transaction = Sentry.startTransaction({
      op: uuid4(),
      data: {
        query: requestContext.request.query,
      },
      name: requestContext.request.operationName ?? 'no-name',
    })
    Sentry.setUser({
      email: requestContext.contextValue.user?.email,
    })
    return {
      async didEncounterErrors(context) {
        for (const err of context.errors) {
          Sentry.captureException(err)
        }
      },
      async executionDidStart() {
        return {
          async executionDidEnd() {
            const user = requestContext.contextValue.user
            if (user) {
              mixpanel.people.set(user.id, {
                $email: user.email,
                $name: user.name,
              })
            }
            mixpanel.track('query', {
              distinct_id: requestContext.contextValue.user?.id,
              query: requestContext.source,
              executionTime: Date.now() - startTime,
              name: requestContext.request.operationName,
              variables: requestContext.request.variables,
            })
            transaction.finish()
          },
        }
      },
    }
  }
}
