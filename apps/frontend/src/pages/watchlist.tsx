import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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
      <div className='flex h-screen flex-col items-center justify-center gap-8 text-neutral-300'>
        <h1 className='max-w-lg text-center text-3xl'>
          Login to add movies to your watchlist and match with friends
        </h1>
        <Link
          href='/auth/signin'
          className='flex  h-10 items-center  rounded-md bg-neutral-900 px-8 text-white dark:bg-white dark:text-neutral-900'
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
