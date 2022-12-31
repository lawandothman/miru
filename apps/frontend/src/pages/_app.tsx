import type { AppContext, AppProps } from 'next/app'
import { getSession, SessionProvider } from 'next-auth/react'
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { DefaultSeo } from 'next-seo'
import SEO from 'config/next-seo.config'

import { Sidebar } from 'components/Sidebar'

import 'styles/globals.css'
import type { Genre } from '__generated__/resolvers-types'
import App from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { usePreserveScroll } from 'utils/usePreserveScroll'

const httpLinkt = createHttpLink({
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

const client = new ApolloClient({
  link: authLink.concat(httpLinkt),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          search: offsetLimitPagination(['query']),
          popularMovies: offsetLimitPagination(),
          moviesForYou: offsetLimitPagination(),
          moviesByGenre: offsetLimitPagination(['genreId']),
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

  usePreserveScroll()

  return (
    <>
      <NextNProgress
        color='#ef4444'
        options={{
          showSpinner: false,
        }}
      />
      <SessionProvider session={session}>
        <ApolloProvider client={client}>
          <DefaultSeo {...SEO} />
          <Sidebar genres={genres} />
          <main className='lg:pl-60'>
            <Component {...pageProps} />
          </main>
        </ApolloProvider>
      </SessionProvider>
    </>
  )
}
MyApp.getInitialProps = async (appContext: AppContext) => {
  const session = await getSession(appContext.ctx)
  const appProps = await App.getInitialProps(appContext)
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
}

export default MyApp
