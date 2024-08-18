import type { AppContext, AppProps } from 'next/app'
import { getSession, SessionProvider } from 'next-auth/react'
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { setContext } from '@apollo/client/link/context'
import { Analytics } from '@vercel/analytics/react'
import { DefaultSeo } from 'next-seo'
import SEO from 'config/next-seo.config'

import { ThemeProvider } from 'next-themes'
import 'styles/globals.css'
import type { Genre } from '__generated__/resolvers-types'
import App from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { Navigation } from 'components/Navigation'
import Head from 'next/head'
import { CookieConsent } from 'components/CookiesConsent'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_OMNI_URL}/graphql`,
})

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession()

  return {
    headers: {
      ...headers,
      Authorization: session?.token ? `Bearer ${session.token}` : '',
    },
  }
})

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error,
  },
})

const client = new ApolloClient({
  link: retryLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          search: offsetLimitPagination(['query']),
          popularMovies: offsetLimitPagination(),
          moviesForYou: offsetLimitPagination(),
          moviesByGenre: offsetLimitPagination(['genreId']),
          watchlist: offsetLimitPagination(),
          genres: {
            read(existing) {
              return existing || undefined
            }
          }
        },
      },
    },
  }),
})

const MyApp = (props: AppProps & { genres: Genre[] }) => {
  const {
    Component,
    genres,
    pageProps: { session, ...pageProps },
  } = props

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <NextNProgress
        color='#ef4444'
        options={{
          showSpinner: false,
        }}
      />
      <SessionProvider session={session}>
        <ApolloProvider client={client}>
          <DefaultSeo {...SEO} />
          <Analytics />
          <ThemeProvider attribute='class' enableSystem>
            <Navigation genres={genres} />
            <div className='lg:pl-60'>
              <Component {...pageProps} />
            </div>
            <CookieConsent />
          </ThemeProvider>
        </ApolloProvider>
      </SessionProvider>
    </>
  )
}
MyApp.getInitialProps = async (appContext: AppContext) => {
  const [session, appProps] = await Promise.all([
    getSession(appContext.ctx),
    App.getInitialProps(appContext),
  ])

  try {
    const res = await client.query<{ genres: Genre[] }>({
      query: gql`
        query Genres {
          genres {
            id
            name
          }
        }
      `,
    })
    return { ...appProps, session, genres: res.data.genres }
  } catch (error) {
    console.error(error)
    return { ...appProps, session, genres: [] }
  }
}

export default MyApp
