import { gql, useMutation, useQuery } from '@apollo/client'
import { FullPageLoader } from 'components/AsyncState'
import { PageHeader } from 'components/PageHeader'
import { UserSummary } from 'components/UserSummary'
import type { GetServerSidePropsContext } from 'next'
import { getSession, useSession } from 'next-auth/react'
import Image from 'next/image'
import HomeCinemaDark from '../../public/illustration/dark/home_cinema.svg'
import HomeCinemaLight from '../../public/illustration/light/home_cinema.svg'
import React, { useCallback, useEffect, useState } from 'react'
import type { User } from '__generated__/resolvers-types'
import { useTheme } from 'next-themes'
import { DateTime } from 'luxon'
import { deleteCookie, getCookie } from 'cookies-next'
import { InvitePrompt } from 'components/InvitePrompt'
import { Footer } from '@/components/footer'

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
const Dashboard = () => {
  const { data: session, status: sessionStatus } = useSession({ required: true })
  const { data, loading, refetch } = useQuery<{ user: User }>(GET_HOME, {
    variables: { userId: session?.user?.id },
    fetchPolicy: 'cache-and-network',
  })
  const [invitedBy, setInvitedBy] = useState<string | null>(null)
  const [follow, { loading: followLoading }] = useMutation<
  User,
  { friendId: string | null }
  >(FOLLOW, {
    refetchQueries: [{ query: GET_HOME }, 'GetHome'],
  })

  const getGreeting = useCallback(() => {
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
  }, [])


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
      {[...data?.user?.following ?? []]
        .sort((a, b) => (b?.matches?.length ?? 0) - (a?.matches?.length ?? 0))
        .map((following) => {
          if (following) {
            return <UserSummary key={following.id} user={following} />
          } else {
            return null
          }
        })}
      <Footer />
    </main>
  )
}

const Illustration = () => {
  const { systemTheme } = useTheme()
  return (
    <Image
      className='mx-auto'
      src={systemTheme === 'dark' ? HomeCinemaDark : HomeCinemaLight}
      alt='Illustration'
      width={390}
    />
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  } else {
    return {
      props: {},
    }
  }
}

export default Dashboard
