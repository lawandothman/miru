import dotenv from 'dotenv'
import env from 'env-var'

dotenv.config()

export const config = {
  neo4j: {
    host: env.get('NEO4J_HOST').required().asString(),
    user: env.get('NEO4J_USER').required().asString(),
    pass: env.get('NEO4J_PASS').required().asString(),
  },
  jwtSecret: env.get('OMNI_SECRET').required().asString(),
  tmdb: {
    readToken: env.get('TMDB_API_READ_ACCESS_TOKEN').required().asString(),
    baseUrl: env.get('TMDB_API_BASE_URL').required().asString(),
  },
  sentryUrl: env.get('SENTRY_URL').default('https://test').asString(),
  mixpanelKey: env.get('MIXPANEL_KEY').default('').asString()
}
