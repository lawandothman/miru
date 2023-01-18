import { gql, useMutation, useQuery } from '@apollo/client'
import { FullPageLoader } from 'components/AsyncState'
import { PageHeader } from 'components/PageHeader'
import { UserSummary } from 'components/UserSummary'
import { sortBy } from 'lodash'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import PhoneImgDark from '../../public/illustration/dark/phone.png'
import PhoneImgLight from '../../public/illustration/light/phone.png'
import React, { useEffect, useState } from 'react'
import { FiSearch, FiShuffle, FiUserPlus } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'
import type { User } from '__generated__/resolvers-types'
import { useTheme } from 'next-themes'
import { DateTime } from 'luxon'
import { EXPLORE_INDEX, SIGN_IN_INDEX } from 'config/constants'
import { Button } from 'components/Button'

const GET_HOME = gql`
  query GetHome($userId: ID!) {
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

const FOLLOW = gql`
  mutation ($friendId: ID!) {
    follow(friendId: $friendId) {
      id
      isFollowing
      followers {
        id
      }
    }
  }
`
const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession()
  const { data, loading } = useQuery<{ user: User }>(GET_HOME, {
    variables: { userId: session?.user?.id },
    fetchPolicy: 'network-only',
  })
  const [invitedBy, setInvitedBy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [follow, { loading: followLoading }] = useMutation<
  User,
  { friendId: string | null }
  >(FOLLOW, {
    variables: {
      friendId: invitedBy,
    },
    refetchQueries: [{ query: GET_HOME }, 'GetHome'],
  })

  useEffect(() => {
    const invitedBy = localStorage.getItem('invitedBy')
    setInvitedBy(invitedBy)
    if (session && invitedBy && invitedBy !== session?.user?.id) {
      follow()
      localStorage.removeItem('invitedBy')
      setInvitedBy(null)
    }
  }, [session, invitedBy, follow])

  if (sessionStatus === 'loading' || loading || followLoading) {
    return <FullPageLoader />
  }
  if (!session) {
    return <LoggedOutPage />
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${SIGN_IN_INDEX}?invitedBy=${session?.user?.id}`
      )
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (data?.user.following?.length === 0 && !invitedBy) {
    return (
      <main>
        <PageHeader title={getGreeting()} />
        <Illustration />
        <div className='mx-auto max-w-2xl text-center'>
          <p className='text-xl'>
            Looks like you&apos;re not following anyone yet
          </p>
          <p className='mt-2 text-sm'>Miru is better with friends</p>
        </div>
        <div className='mt-8 flex flex-row items-center justify-center gap-4'>
          <Link href={EXPLORE_INDEX}>
            <Button size='md'>Search for your friends</Button>
          </Link>
          <Button onClick={() => copyInviteLink()}>
            {copied ? 'Copied!' : 'Copy Invite Link'}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <PageHeader title={getGreeting()} />
      {sortBy(data?.user.following, [(u) => -(u?.matches?.length ?? 0)]).map(
        (following) => {
          if (following) {
            return <UserSummary key={following.id} user={following} />
          } else {
            return null
          }
        }
      )}
      <Footer />
    </main>
  )
}

const LoggedOutPage = () => (
  <main>
    <PageHeader
      title='Welcome to Miru'
      subtitle='The social movie watching platform'
    />
    <p>
      Remove the drama from movie night and find the movie that everyone wants
      to watch.
    </p>
    <p>Get started by making an account and adding movies to your watchlist</p>
    <Illustration />

    <h2 className='mt-4 text-xl'>How it works?</h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
      <Step
        icon={FiUserPlus}
        text={'Find your friends'}
        description={
          'Follow your friends in Miru and we will recommend movies for you to watch together.'
        }
      />
      <Step
        icon={FiSearch}
        text={'Find your movies'}
        description={
          'Search for movies you want to watch, or just check your For you page for recommendations based on the people you follow.'
        }
      />
      <Step
        icon={FiShuffle}
        text={'Find your matches'}
        description={
          'Miru will match you and the people you follow to show what you should watch together'
        }
      />
    </div>

    <Link
      href={SIGN_IN_INDEX}
      className='mx-auto mt-12 block max-w-lg rounded-md bg-black px-2 py-4 text-center text-lg font-semibold  text-white dark:bg-white dark:text-black'
    >
      Login
    </Link>
    <Footer />
  </main>
)

const getGreeting = () => {
  const now = DateTime.local()
  const hour = now.hour
  if (hour < 12 && hour >= 6) {
    return 'Good morning!'
  } else if (hour < 17 && hour > 12) {
    return 'Good afternoon!'
  } else if (hour <= 23 && hour > 17) {
    return 'Good evening!'
  } else {
    return 'Welcome back!'
  }
}

const Step = ({
  icon,
  text,
  description,
}: {
  icon: IconType;
  text: string;
  description: string;
}) => {
  return (
    <div>
      <div className='flex w-full justify-center'>
        {React.createElement(icon, {
          className:
            'h-24 w-24 text-4xl bg-black dark:bg-white text-white dark:text-black border-full rounded-full p-8 m-4',
        })}
      </div>
      <div className='w-full'>
        <p className='text-l mb-4 text-center font-bold'>{text}</p>
        <p className='text-center'>{description}</p>
      </div>
    </div>
  )
}

const Footer = () => (
  <div className='mt-12 mb-2 flex w-full gap-2  text-sm text-neutral-500'>
    <Link href='/about' className='hover:text-black dark:hover:text-white'>
      About
    </Link>
    <span>•</span>
    <Link
      href='/terms-and-conditions'
      className='hover:text-black dark:hover:text-white'
    >
      Terms & Conditions
    </Link>
    <span>•</span>
    <Link href='/privacy' className='hover:text-black dark:hover:text-white'>
      Privacy Policy
    </Link>
  </div>
)

const Illustration = () => {
  const { systemTheme } = useTheme()
  return (
    <Image
      className='mx-auto'
      src={systemTheme === 'dark' ? PhoneImgDark : PhoneImgLight}
      alt='Illustration'
    />
  )
}

export default Home
