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
import { useColorMode } from 'utils/useColorMode'

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
  const colorMode = useColorMode()
  const { data: session } = useSession()
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

  if (!session) {
    return (
      <div className='mx-auto max-w-4xl px-20 pt-20 text-white'>
        <PageHeader title='Watchlist' />
        <p>Login to add movies to your watchlist and match with friends</p>
        {colorMode === 'dark' ? (
          <Image className='mx-auto' src={TalkImgDark} alt={'Illustration'}></Image>
        ) : (
          <Image className='mx-auto' src={TalkImgLight} alt={'Illustration'}></Image>
        )}
        <Link
          href='/auth/signin'
          className='mt-12 block rounded-md bg-neutral-900 p-2 text-center text-white  dark:bg-neutral-300 dark:text-white'
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
