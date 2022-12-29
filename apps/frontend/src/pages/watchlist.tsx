import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import TalkImg from '../../public/illustration/dark/talk.png'

export const GET_WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const Watchlist: NextPage = () => {
  const { data: session } = useSession()
  const { data, loading, refetch } = useQuery<{ watchlist: Movie[] }>(
    GET_WATCHLIST
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  if (!session) {
    return (
      <div className='px-20 pt-20 mx-auto max-w-4xl text-white'>
        <PageHeader title='Watchlist' />
        <p>
          Login to add movies to your watchlist and match with friends
        </p>
        <Image className='mx-auto' src={TalkImg} alt={'Illustration'}></Image>
        <Link
          href='/auth/signin'
          className='block text-center mt-12 p-2 text-white rounded-md bg-neutral-900 dark:bg-neutral-300 text-black'
        >
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Watchlist' />
      {loading ? <LoadingSkeleton /> : <MoviesList movies={data?.watchlist} />}
    </div>
  )
}

export default Watchlist
