import { gql, useQuery } from '@apollo/client'
import { Loader } from 'components/Loader'
import { PageHeader } from 'components/PageHeader'
import { UserCard } from 'components/UserCard'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'

export const GET_WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id
    }
  }
`

const GET_HOME = gql`
  query ($userId: ID!) {
    user(id: $userId) {
      following {
        id
        name
        image
        matches {
          id
          title
          inWatchlist
          posterUrl
        }
      }
    }
  }
`

const Home: NextPage = () => {
  const { data: session, status } = useSession()
  const { data } = useQuery<{ user: User }>(GET_HOME, {
    variables: { userId: session?.user?.id },
  })
  if (status === 'loading') {
    return <Loader />
  }
  if (!session) {
    return loggedOutPage()
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Welcome back!'></PageHeader>
      {data?.user.following?.map((follower) => {
        if (follower) {
          <UserCard key={follower.id} user={follower} extended />
        } else {
          return null
        }
      })}
    </div>
  )
}

const loggedOutPage = () => {
  return (
    <div className='mx-auto flex h-screen max-w-xl flex-col items-center justify-center gap-8 text-center text-neutral-300'>
      <h1 className='text-5xl'>Welcome to Miru</h1>
      <p className='text-lg'>
        Remove the drama from movie night and find the movie that everyone wants
        to watch.
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

export default Home
