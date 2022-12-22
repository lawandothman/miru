import dotenv from "dotenv";
import env from 'env-var'

dotenv.config()

export const config = {
  neo4j: {
    host: env.get('NEO4J_HOST').required().asString(),
    user: env.get('NEO4J_USER').required().asString(),
    pass: env.get('NEO4J_PASS').required().asString(),
  },
}
