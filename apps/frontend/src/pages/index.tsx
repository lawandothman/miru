import { gql, useQuery } from '@apollo/client'
import { Loader } from 'components/Loader'
import { type NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Movie } from '__generated__/resolvers-types'

export const GET_WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id
    }
  }
`

const Home: NextPage = () => {
  const { data: session, status } = useSession()
  const { data } = useQuery<{ watchlist: Movie[] }>(GET_WATCHLIST)
  if (status === 'loading') {
    return <Loader />
  }
  if (!session) {
    return (
      <div className='mx-auto flex h-screen max-w-xl flex-col items-center justify-center gap-8 text-center text-neutral-300'>
        <h1 className='text-5xl'>Welcome to Miru</h1>
        <p className='text-lg'>
          Remove the drama from movie night and find the movie that everyone
          wants to watch.
        </p>
        <p className='text-lg'>
          Get started by making an account and adding movies to your watchlist
        </p>
        <Link
          href='/auth/signin'
          className='mt-8  flex h-14 w-full items-center  justify-center rounded-md bg-neutral-900 px-8 text-2xl text-white dark:bg-neutral-300 dark:text-neutral-900'
        >
          Login
        </Link>
      </div>
    )
  }
  return (
    <div className='mx-auto flex h-screen max-w-lg flex-col items-center justify-center gap-8 text-center text-neutral-300'>
      <h1 className='text-5xl'>Welcome back!</h1>
      <p className='text-lg'>
        You have {data?.watchlist.length} movies in your watchlist
      </p>
      <Link
        href='/users'
        className='mt-8 flex h-14 w-full items-center  justify-center rounded-md bg-neutral-900 px-8 text-xl text-white dark:bg-neutral-300 dark:text-neutral-900'
      >
        Find a movie to watch with friends
      </Link>
    </div>
  )
}

export default Home
