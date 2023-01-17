import NextAuth, { type NextAuthOptions } from 'next-auth'
import jsonwebtoken from 'jsonwebtoken'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

import neo4j from 'neo4j-driver'
import { Neo4jAdapter } from '@next-auth/neo4j-adapter'
import { config } from 'config/env'
import { SIGN_IN_INDEX } from 'config/constants'

const { host, user, pass } = config.neo4j
const driver = neo4j.driver(host, neo4j.auth.basic(user, pass))

const neo4jSession = driver.session()

const { secret, facebook, google } = config.nextAuth

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
            {
              id: token.sub,
              name: session.user.name,
              image: session.user.image,
              email: session.user.email,
            },
            secret,
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
      clientId: facebook.clientId,
      clientSecret: facebook.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: google.clientId,
      clientSecret: google.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    // ...add more providers here
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: SIGN_IN_INDEX,
  },
}

export default NextAuth(authOptions)
