import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql, NetworkStatus } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import PhotoImgDark from '../../public/illustration/dark/photo.png'
import PhotoImgLight from '../../public/illustration/light/photo.png'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { FullPageLoader } from 'components/FullPageLoader'
import { PAGE_LIMIT } from 'config/constants'

const GET_FOR_YOU = gql`
  query ForYou($limit: Int, $offset: Int) {
    moviesForYou(limit: $limit, offset: $offset) {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const ForYou: NextPage = () => {
  const { theme } = useTheme()
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const { data: session, status } = useSession()
  const {
    data,
    networkStatus,
    variables = { offset: 0, limit: PAGE_LIMIT },
    fetchMore,
  } = useQuery<{ moviesForYou: Movie[] }, { limit: number; offset: number }>(
    GET_FOR_YOU,
    {
      variables: {
        limit: PAGE_LIMIT,
        offset: 0,
      },
      notifyOnNetworkStatusChange: true
    }
  )

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (!session) {
    return (
      <main>
        <PageHeader title='For you' />
        <p>Login so that we can recommend you movies</p>
        {theme === 'dark' ? (
          <Image
            className='mx-auto'
            src={PhotoImgDark}
            alt={'Illustration'}
          ></Image>
        ) : (
          <Image
            className='mx-auto'
            src={PhotoImgLight}
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

  if (networkStatus === NetworkStatus.loading) {
    return (
      <main>
        <PageHeader title='For you' />
        <LoadingSkeleton />
      </main>
    )
  }

  if (data) {
    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage = data.moviesForYou.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.moviesForYou.length,
          },
        }).then((res) => setFullyLoaded(!res.data.moviesForYou.length))
      }
    }
    return (
      <main>
        <PageHeader
          title='For you'
          subtitle='Movies to watch with the people you follow'
        />
        <MoviesList loadMore={loadMore} movies={data?.moviesForYou} />
      </main>
    )
  }

  return null
}

export default ForYou
