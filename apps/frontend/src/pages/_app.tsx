import { type AppType } from "next/app"
import { type Session } from "next-auth"
import { getSession, SessionProvider } from "next-auth/react"
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { DefaultSeo } from "next-seo"
import SEO from "next-seo.config"

import { Sidebar } from "components/Sidebar"

import "styles/globals.css"

const httpLinkt = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_OMNI_URL}/graphql`,
})

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession()

  return {
    headers: {
      ...headers,
      Authorization: session?.token ? `Bearer ${session.token}` : "",
    },
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLinkt),
  cache: new InMemoryCache(),
})

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SessionProvider session={session}>
        <ApolloProvider client={client}>
          <DefaultSeo {...SEO} />
          <Sidebar />
          <main className="lg:pl-60">
            <Component {...pageProps} />
          </main>
        </ApolloProvider>
      </SessionProvider>
    </>
  )
}

export default MyApp
