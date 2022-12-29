import { gql, useQuery } from '@apollo/client'
import { FullPageLoader } from 'components/FullPageLoader'
import { PageHeader } from 'components/PageHeader'
import { UserSummary } from 'components/UserSummary'
import { sortBy } from 'lodash'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import PhoneImg from '../../public/illustration/dark/phone.png'
import React from 'react'
import { FiSearch, FiShuffle, FiUserPlus } from 'react-icons/fi'
import { IconType } from 'react-icons/lib'
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
    <div className='px-20 pt-20 mx-auto max-w-4xl text-white'>
      <PageHeader title='Welcome to Miru' subtitle='The social movie watching platform'></PageHeader>
      <p className='text-neutral-300'>
        Remove the drama from movie night and find the movie that everyone wants
        to watch.
      </p>
      <p className='text-neutral-300'>
        Get started by making an account and adding movies to your watchlist
      </p>

      <Image className='mx-auto' src={PhoneImg} alt={'Illustration'}></Image>

      <h2 className='text-xl mt-4'>How it works?</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Step icon={FiUserPlus} text={'Find your friends'} description={'Follow your friends in Miru and we will recommend movies for you to watch together.'} />
        <Step icon={FiSearch} text={'Find your movies'} description={'Search for movies you want to watch, or just check your For you page for recommendations based on the people you follow.'} />
        <Step icon={FiShuffle} text={'Find your matches'} description={'Miru will match you and the people you follow to show what you should watch together'} />
      </div>

      <Link
        href='/auth/signin'
        className='block text-center mt-12 p-2 text-white rounded-md bg-neutral-900 dark:bg-neutral-300 text-black'
      >
        Login
      </Link>
    </div>
  )
}

function Step({ icon, text, description }: { icon: IconType, text: string, description: string }) {
  return (
    <div>
      <div className='w-full flex justify-center'>
        {React.createElement(icon, { className: 'h-24 w-24 text-4xl bg-neutral-900 border-full rounded-full p-8 m-4' })}
      </div>
      <div className='w-full'>
        <p className='text-l text-center font-bold'>{text}</p>
        <p className='text-neutral-300'>{description}</p>
      </div>
    </div>
  )
}

export default Home
