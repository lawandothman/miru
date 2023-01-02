import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import TalkImgDark from '../../public/illustration/dark/talk.png'
import TalkImgLight from '../../public/illustration/light/talk.png'
import { useTheme } from 'next-themes'
import { FullPageLoader } from 'components/FullPageLoader'

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
  const { data, loading, refetch, fetchMore } = useQuery<{
    watchlist: Movie[];
  }>(GET_WATCHLIST)

  useEffect(() => {
    refetch()
  }, [refetch])

  const loadMore = async () => {
    const currentLength = data?.watchlist.length ?? 20
    await fetchMore({
      variables: {
        limit: 20,
        offset: currentLength * 2,
      },
    })
  }

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (!session) {
    return (
      <div className='mx-auto max-w-4xl px-20 pt-20 text-white'>
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
      </div>
    )
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Watchlist' />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <MoviesList loadMore={loadMore} movies={data?.watchlist} />
      )}
    </div>
  )
}

export default Watchlist
