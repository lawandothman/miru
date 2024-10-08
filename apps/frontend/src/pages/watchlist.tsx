import { MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql, NetworkStatus } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import HomeCinemaDark from '../../public/illustration/dark/home_cinema.svg'
import HomeCinemaLight from '../../public/illustration/light/home_cinema.svg'
import { useTheme } from 'next-themes'
import { FullPageLoader } from 'components/AsyncState'
import {
  EXPLORE_INDEX,
  PAGE_LIMIT,
  POPULAR_INDEX,
  SIGN_IN_INDEX,
  WATCHLIST_INDEX,
} from 'config/constants'
import { Page } from 'components/Page'
import { Button } from '@/components/ui/button'

export const GET_WATCHLIST = gql`
  query Watchlist($limit: Int, $offset: Int) {
    watchlist(limit: $limit, offset: $offset) {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const Watchlist: NextPage = () => {
  const { data: session, status } = useSession()
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const {
    data,
    networkStatus,
    fetchMore,
    variables = { offset: 0, limit: PAGE_LIMIT },
  } = useQuery<
  {
    watchlist: Movie[];
  },
  { offset: number; limit: number }
  >(GET_WATCHLIST, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    variables: {
      offset: 0,
      limit: PAGE_LIMIT,
    },
  })

  if (status === 'loading' || networkStatus === NetworkStatus.loading) {
    return <FullPageLoader />
  }

  if (!session) {
    return (
      <main className='max-w-screen-2xl'>
        <PageHeader
          title='Watchlist'
          subtitle='Login to add movies to your watchlist and match with friends'
        />
        <Illustration />
        <Link
          href={SIGN_IN_INDEX}
          className='mx-auto mt-12 block max-w-lg rounded-md bg-black px-2 py-4 text-center text-lg font-semibold  text-white dark:bg-white dark:text-black'
        >
          Login
        </Link>
      </main>
    )
  }

  if (data) {
    if (data.watchlist.length === 0) {
      return (
        <main className='max-w-screen-2xl'>
          <PageHeader
            title='Watchlist'
            subtitle="You don't have any movies in your watchlist"
          />
          <Illustration />

          <div className='mx-auto mt-8 flex max-w-xl flex-col items-center gap-4'>
            <Link className='w-full' href={EXPLORE_INDEX}>
              <Button className='w-full py-8 text-lg'>
                Find a movie to watch with friends
              </Button>
            </Link>
            <Link className='w-full' href={POPULAR_INDEX}>
              <Button className='w-full py-8 text-lg'>
                Miru&apos;s popular movies
              </Button>
            </Link>
          </div>
        </main>
      )
    }

    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage = data.watchlist.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.watchlist.length,
          },
        }).then((res) => setFullyLoaded(!res.data.watchlist.length))
      }
    }

    return (
      <Page name='Watchlist' index={WATCHLIST_INDEX}>
        <main className='max-w-screen-2xl'>
          <PageHeader title='Watchlist' />
          <MoviesList loadMore={loadMore} movies={data.watchlist} />
        </main>
      </Page>
    )
  }

  return null
}

const Illustration = () => {
  const { systemTheme } = useTheme()
  return (
    <Image
      className='mx-auto'
      src={systemTheme === 'dark' ? HomeCinemaDark : HomeCinemaLight}
      alt='Illustration'
      width={390}
    />
  )
}

export default Watchlist
