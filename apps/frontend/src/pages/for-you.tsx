import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql, NetworkStatus } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import PhotoImgDark from '../../public/illustration/dark/photo.png'
import PhotoImgLight from '../../public/illustration/light/photo.png'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { FullPageLoader } from 'components/AsyncState'
import {
  EXPLORE_INDEX,
  FOR_YOU_INDEX,
  PAGE_LIMIT,
  SIGN_IN_INDEX,
} from 'config/constants'
import { Page } from 'components/Page'
import { Button } from 'components/Button'
import { useInviteLink } from 'hooks/useInviteLink'

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
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const { data: session, status } = useSession()
  const { copy, isCopied } = useInviteLink(session?.user)
  const {
    data,
    networkStatus,
    variables = { offset: 0, limit: PAGE_LIMIT },
    fetchMore,
  } = useQuery<{ moviesForYou: Movie[] }, { limit: number; offset: number }>(
    GET_FOR_YOU,
    {
      variables: {
        limit: PAGE_LIMIT,
        offset: 0,
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (!session) {
    return (
      <main>
        <PageHeader title='For you' />
        <p>Login so that we can recommend you movies</p>
        <Illustration />
        <Link
          href={SIGN_IN_INDEX}
          className='mx-auto mt-12 block max-w-lg rounded-md bg-black px-2 py-4 text-center text-lg font-semibold  text-white dark:bg-white dark:text-black'
        >
          Login
        </Link>
      </main>
    )
  }

  if (networkStatus === NetworkStatus.loading) {
    return (
      <Page name='For You' index={FOR_YOU_INDEX}>
        <main>
          <PageHeader title='For you' />
          <LoadingSkeleton />
        </main>
      </Page>
    )
  }

  if (data) {
    console.log(data)
    if (data.moviesForYou.length === 0) {
      return (
        <Page name='For You' index={FOR_YOU_INDEX}>
          <main>
            <PageHeader title='For You' />
            <Illustration />
            <div className='mx-auto max-w-2xl text-center'>
              <p className='text-xl'>
                It&apos;s quiet here, find more friends to follow and we&apos;ll
                suggest you some movies for you to watch with them
              </p>
            </div>
            <div className='mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-4'>
              <Link className='block w-full' href={EXPLORE_INDEX}>
                <Button className='py-4' size='full-width'>
                  Search for your friends
                </Button>
              </Link>
              <Button className='py-4' size='full-width' onClick={() => copy()}>
                {isCopied ? 'Copied!' : 'Copy Invite Link'}
              </Button>
            </div>
          </main>
        </Page>
      )
    }

    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage = data.moviesForYou.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.moviesForYou.length,
          },
        }).then((res) => setFullyLoaded(!res.data.moviesForYou.length))
      }
    }
    return (
      <Page name='For You' index={FOR_YOU_INDEX}>
        <main>
          <PageHeader
            title='For you'
            subtitle='Movies to watch with the people you follow'
          />
          <MoviesList loadMore={loadMore} movies={data?.moviesForYou} />
        </main>
      </Page>
    )
  }

  return null
}

const Illustration = () => {
  const { systemTheme } = useTheme()
  return (
    <Image
      className='mx-auto'
      src={systemTheme === 'dark' ? PhotoImgDark : PhotoImgLight}
      alt='Illustration'
    />
  )
}

export default ForYou
