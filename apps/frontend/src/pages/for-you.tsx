import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import PhotoImgDark from '../../public/illustration/dark/photo.png'
import PhotoImgLight from '../../public/illustration/light/photo.png'
import { useColorMode } from 'utils/useColorMode'

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
  const colorMode = useColorMode()
  const { data: session } = useSession()
  const { data, loading, fetchMore } = useQuery<
  { moviesForYou: Movie[] },
  { limit?: number; offset?: number }
  >(GET_FOR_YOU)


  const loadMore = async () => {
    const currentLength = data?.moviesForYou.length ?? 20
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
        <PageHeader title='For you' />
        <p>Login so that we can recommend you movies</p>
        {colorMode === 'dark' ? (
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
          className='mt-12 block rounded-md bg-neutral-900 p-2 text-center text-white dark:bg-neutral-300 dark:text-white'
        >
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='For you' subtitle='Movies to watch with the people you follow' />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <MoviesList loadMore={loadMore} movies={data?.moviesForYou} />
      )}
    </div>
  )
}

export default ForYou
