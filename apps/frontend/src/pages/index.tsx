import { gql, useMutation, useQuery } from '@apollo/client'
import { FullPageLoader } from 'components/AsyncState'
import { PageHeader } from 'components/PageHeader'
import { UserSummary } from 'components/UserSummary'
import { sortBy } from 'lodash'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import HomeCinemaDark from '../../public/illustration/dark/home_cinema.svg'
import HomeCinemaLight from '../../public/illustration/light/home_cinema.svg'
import React, { useEffect, useState } from 'react'
import type { User } from '__generated__/resolvers-types'
import { useTheme } from 'next-themes'
import { DateTime } from 'luxon'
import { SIGN_IN_INDEX } from 'config/constants'
import { deleteCookie, getCookie } from 'cookies-next'
import { InvitePrompt } from 'components/InvitePrompt'
import { Popcorn, Search, UserPlus, type LucideIcon } from 'lucide-react'

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
  mutation Follow($friendId: ID!) {
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
  const { data, loading, refetch } = useQuery<{ user: User }>(GET_HOME, {
    variables: { userId: session?.user?.id },
    fetchPolicy: 'network-only',
  })
  const [invitedBy, setInvitedBy] = useState<string | null>(null)
  const [follow, { loading: followLoading }] = useMutation<
  User,
  { friendId: string | null }
  >(FOLLOW, {
    refetchQueries: [{ query: GET_HOME }, 'GetHome'],
  })

  useEffect(() => {
    (async () => {
      const invitedBy = getCookie('invitedBy') as string
      setInvitedBy(invitedBy)
      if (session && invitedBy && invitedBy !== session.user?.id) {
        await follow({
          variables: {
            friendId: invitedBy,
          },
        }).then(async () => {
          await refetch()
          deleteCookie('invitedBy')
          setInvitedBy(null)
        })
      }
    })()
  }, [session, invitedBy, follow, refetch])

  if (sessionStatus === 'loading' || loading || followLoading) {
    return <FullPageLoader />
  }

  if (!session) {
    return <LoggedOutPage />
  }

  if (data && data.user?.following?.length === 0 && !invitedBy) {
    return (
      <InvitePrompt
        session={session}
        Illustration={Illustration}
        pageTitle={getGreeting()}
      />
    )
  }

  return (
    <main className='max-w-screen-2xl'>
      <PageHeader title={getGreeting()} />
      {sortBy(data?.user?.following, [(u) => -(u?.matches?.length ?? 0)]).map(
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
    <p className='mb-8'>
      Get started by making an account and adding movies to your watchlist
    </p>
    <Illustration />

    <h2 className='mt-4 text-xl'>How it works?</h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
      <Step
        Icon={UserPlus}
        text={'Find your friends'}
        description={
          'Follow your friends in Miru and we will recommend movies for you to watch together.'
        }
      />
      <Step
        Icon={Search}
        text={'Find your movies'}
        description={
          'Search for movies you want to watch, or just check your For you page for recommendations based on the people you follow.'
        }
      />
      <Step
        Icon={Popcorn}
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
  Icon,
  text,
  description,
}: {
  Icon: LucideIcon;
  text: string;
  description: string;
}) => {
  return (
    <div>
      <div className='flex w-full justify-center'>
        <div className='m-8 flex size-32 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black'>
          <Icon size={32} />
        </div>
      </div>
      <div className='w-full'>
        <p className='mb-4 text-center text-lg font-bold'>{text}</p>
        <p className='text-center'>{description}</p>
      </div>
    </div>
  )
}

const Footer = () => (
  <div className='mb-2 mt-12 flex w-full gap-2  text-sm text-neutral-500'>
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
      src={systemTheme === 'dark' ? HomeCinemaDark : HomeCinemaLight}
      alt='Illustration'
      width={500}
    />
  )
}

export default Home
