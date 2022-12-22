import env from 'env-var'

export const config = {
  neo4j: {
    host: env.get('NEO4J_HOST').required().asString(),
    user: env.get('NEO4J_USER').required().asString(),
    pass: env.get('NEO4J_PASS').required().asString(),
  },
  omni: {
    baseUrl: env.get('NEXT_PUBLIC_OMNI_UR').required().asString()
  }
}
