import { gql, useQuery } from '@apollo/client'
import { FullPageLoader } from 'components/FullPageLoader'
import { PageHeader } from 'components/PageHeader'
import { UserSummary } from 'components/UserSummary'
import { sortBy } from 'lodash'
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
          backdropUrl
          inWatchlist
          posterUrl
        }
      }
    }
  }
`

const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession()
  const { data, loading } = useQuery<{ user: User }>(GET_HOME, {
    variables: { userId: session?.user?.id },
    fetchPolicy: 'network-only'
  })
  if (sessionStatus === 'loading' || loading) {
    return <FullPageLoader />
  }
  if (!session) {
    return loggedOutPage()
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Welcome back!' subtitle='' />
      {sortBy(data?.user.following, [(u => -(u?.matches?.length ?? 0) )]).map((following) => {
        if (following) {
          return <UserSummary key={following.id} user={following} />
        } else {
          return null
        }
      })}
    </div>
  )
}

const loggedOutPage = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen max-w-xl gap-8 mx-auto text-center text-neutral-300'>
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
        className='flex items-center justify-center w-full px-8 mt-8 text-2xl text-white rounded-md h-14 bg-neutral-900 dark:bg-neutral-300 dark:text-neutral-900'
      >
        Login
      </Link>
    </div>
  )
}

export default Home
