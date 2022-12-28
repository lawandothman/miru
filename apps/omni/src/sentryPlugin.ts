import type { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener, GraphQLServerContext, GraphQLServerListener } from '@apollo/server'
import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { ProfilingIntegration } from '@sentry/profiling-node'
import type { Context } from '.'
import { uuid4 } from '@sentry/utils'

Sentry.init({
  dsn: 'https://2d1d3b9436444bacb0c13fb850f59492@o4504404409581568.ingest.sentry.io/4504407781474304',
  environment: process.env.NODE_ENV ?? 'development',
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  integrations: [
    // add profiling integration
    new ProfilingIntegration()
  ],
  profilesSampleRate: 1.0,
})

export default class SentryPlugin implements ApolloServerPlugin {

  async requestDidStart?(requestContext: GraphQLRequestContext<Context>): Promise<GraphQLRequestListener<Context> | void> {
    console.log('start', requestContext.request.operationName)
    const transaction = Sentry.startTransaction({
      op: uuid4(),
      data: {
        query: requestContext.request.query,
      },
      name: requestContext.request.operationName ?? 'no-name'
    })
    console.log(transaction.toJSON())
    return {
      async didEncounterErrors(context) {
        for(const err of context.errors) {
          Sentry.captureException(err)
        }
      },
      async didResolveOperation(_context): Promise<void> {
        transaction.finish()
      }
    }


  }


}