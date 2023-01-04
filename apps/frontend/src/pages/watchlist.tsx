import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql, NetworkStatus } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import TalkImgDark from '../../public/illustration/dark/talk.png'
import TalkImgLight from '../../public/illustration/light/talk.png'
import { useTheme } from 'next-themes'
import { FullPageLoader } from 'components/FullPageLoader'
import { PAGE_LIMIT } from 'config/constants'

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
  const { theme } = useTheme()
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
      <main>
        <PageHeader title='Watchlist' />
        <p>Login to add movies to your watchlist and match with friends</p>
        {theme === 'dark' ? (
          <Image
            className='mx-auto'
            src={TalkImgDark}
            alt={'Illustration'}
          ></Image>
        ) : (
          <Image
            className='mx-auto'
            src={TalkImgLight}
            alt={'Illustration'}
          ></Image>
        )}
        <Link
          href='/auth/signin'
          className='mx-auto mt-12 block max-w-lg rounded-md bg-neutral-900 px-2 py-4 text-center text-lg font-semibold  text-white dark:bg-neutral-300 dark:text-black'
        >
          Login
        </Link>
      </main>
    )
  }

  if (data) {
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
      <main>
        <PageHeader title='Watchlist' />
        <MoviesList loadMore={loadMore} movies={data.watchlist} />
      </main>
    )
  }

  return null
}

export default Watchlist
