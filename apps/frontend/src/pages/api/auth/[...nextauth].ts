import NextAuth, { type NextAuthOptions } from 'next-auth'
import jsonwebtoken from 'jsonwebtoken'
import FacebookProvider from 'next-auth/providers/facebook'

import neo4j from 'neo4j-driver'
import { Neo4jAdapter } from '@next-auth/neo4j-adapter'
import { config } from '../../../config/env'

const { host, user, pass } = config.neo4j
const driver = neo4j.driver(host, neo4j.auth.basic(user, pass))

const neo4jSession = driver.session()

export const authOptions: NextAuthOptions = {
  // Include user.id and jwt token on session
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }
        if (session.user.email) {
          const encodedToken = jsonwebtoken.sign(
            { id: token.sub, name: session.user.name, image: session.user.image, email: session.user.email },
            process.env.NEXTAUTH_SECRET as string,
            { algorithm: 'HS256' }
          )
          session.token = encodedToken
        }
      }
      return session
    },
  },
  // Configure one or more authentication providers
  adapter: Neo4jAdapter(neo4jSession),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export default NextAuth(authOptions)
