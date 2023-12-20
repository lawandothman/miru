import NextAuth, { type NextAuthOptions } from 'next-auth'
import jsonwebtoken from 'jsonwebtoken'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

import neo4j from 'neo4j-driver'
import { Neo4jAdapter } from '@auth/neo4j-adapter'
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
              // image: session.user.image,
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
    signIn({profile, user}) {
      console.log(profile)
      user.image = profile?.image
      return true
    },
  },
  // Configure one or more authentication providers
  adapter: Neo4jAdapter(neo4jSession),
  providers: [
    FacebookProvider({
      clientId: facebook.clientId,
      clientSecret: facebook.clientSecret,
      allowDangerousEmailAccountLinking: true,
      authorization: 'https://www.facebook.com/v11.0/dialog/oauth?scope=email,public_profile',
      token: 'https://graph.facebook.com/oauth/access_token',
      userinfo: {
        url: 'https://graph.facebook.com/me',
        // https://developers.facebook.com/docs/graph-api/reference/user/#fields
        params: { fields: 'id,name,email,picture,first_name' },
        async request({ tokens, client, provider }) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return await client.userinfo(tokens.access_token!, {
            //@ts-expect-error "something"
            params: provider.userinfo?.params,
          })
        },
      },
      profile(profile) {
        console.log(profile)
        return {
          id: profile.id,
          firstName: profile.first_name,
          name: profile.name,
          email: profile.email,
          image: profile.picture.data.url,
        }
      },
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
