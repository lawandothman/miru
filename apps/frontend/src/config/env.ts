import env from 'env-var'

export const config = {
  neo4j: {
    host: env.get('NEO4J_HOST').required().asString(),
    user: env.get('NEO4J_USER').required().asString(),
    pass: env.get('NEO4J_PASS').required().asString(),
  },
  nextAuth: {
    secret: env.get('NEXTAUTH_SECRET').required().asString(),
    // facebook: {
    //   clientId: env.get('FACEBOOK_CLIENT_ID').required().asString(),
    //   clientSecret: env.get('FACEBOOK_CLIENT_SECRET').required().asString(),
    // },
    google: {
      clientId: env.get('GOOGLE_CLIENT_ID').required().asString(),
      clientSecret: env.get('GOOGLE_CLIENT_SECRET').required().asString(),
    },
  },
  omni: {
    baseUrl: env.get('NEXT_PUBLIC_OMNI_URL').required().asString(),
  },
}
