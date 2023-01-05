import { gql, NetworkStatus, useQuery } from '@apollo/client'
import { ProfilePicture } from 'components/Avatar'
import { Button } from 'components/Button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from 'components/Dialog'
import { FollowButton } from 'components/FollowButton'
import { FullPageLoader } from 'components/FullPageLoader'
import { MoviesList } from 'components/MoviesList'
import { UserCard } from 'components/UserCard'
import { PAGE_LIMIT } from 'config/constants'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import type { Movie } from '__generated__/resolvers-types'
import { User } from '__generated__/resolvers-types'

const SEARCH_USER = gql`
  query User($userId: ID!, $limit: Int, $offset: Int) {
    user(id: $userId) {
      id
      name
      image
      matches {
        id
        title
        posterUrl
        inWatchlist
      }
      isFollower
      isFollowing
      followers {
        id
        name
        image
        matches {
          id
        }
      }
      following {
        id
        name
        image
        matches {
          id
        }
      }
    }
    watchlist(limit: $limit, offset: $offset) {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const FollowersDialog = ({ user }: { user: User }) => {
  const [open, setIsOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <span className='dark:text-neutral-300'>
          {user.followers?.length} followers
        </span>
      </DialogTrigger>
      <DialogContent show={open}>
        <DialogTitle className='py-2 text-center text-lg font-semibold dark:text-neutral-300'>
          Following
        </DialogTitle>

        <div className='mt-1 max-h-[325px] overflow-y-auto'>
          {user.followers?.map((follower) => {
            if (follower) {
              return <UserCard user={follower} key={follower.id} />
            }
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const FollowingDialog = ({ user }: { user: User }) => {
  const [open, setIsOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <span className='dark:text-neutral-300'>
          {user.following?.length} following
        </span>
      </DialogTrigger>
      <DialogContent show={open}>
        <DialogTitle className='py-2 text-center text-lg font-semibold dark:text-neutral-300'>
          Following
        </DialogTitle>
        <div className='mt-1 max-h-[325px] overflow-y-auto'>
          {user.following?.map((following) => {
            if (following) {
              return <UserCard user={following} key={following.id} />
            }
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const User = () => {
  const { query } = useRouter()
  const userId = Array.isArray(query.id) ? query.id[0] : query.id
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const { data: session, status } = useSession({
    required: false,
  })

  const {
    data,
    networkStatus,
    fetchMore,
    variables = { offset: 0, limit: PAGE_LIMIT },
  } = useQuery<
  { user: User; watchlist?: Movie[] },
  { userId?: string; offset: number; limit: number }
  >(SEARCH_USER, {
    variables: {
      userId,
      offset: 0,
      limit: PAGE_LIMIT,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  })

  if (networkStatus === NetworkStatus.loading || status === 'loading') {
    return <FullPageLoader />
  }

  if (data) {
    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage =
      data.watchlist && data.watchlist.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.watchlist?.length,
          },
        }).then((res) => setFullyLoaded(!res.data.watchlist?.length))
      }
    }

    return (
      <main>
        {data.user && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-[9fr,1fr]'>
              <div className='flex items-center gap-4'>
                <ProfilePicture size='lg' user={data.user} />
                <div>
                  <h1 className='text-3xl dark:text-neutral-300'>
                    {data.user.name}
                  </h1>
                  <div className='mt-1 flex gap-4'>
                    {session?.user?.id !== userId && (
                      <span className='dark:text-neutral-300'>
                        {data.user.matches?.length} matches
                      </span>
                    )}
                    {data.user.followers && data.user.followers.length > 0 ? (
                      <FollowersDialog user={data.user} />
                    ) : (
                      <span className='dark:text-neutral-300'>
                        {data.user.followers?.length} followers
                      </span>
                    )}
                    {data.user.following && data.user.following.length > 0 ? (
                      <FollowingDialog user={data.user} />
                    ) : (
                      <span className='dark:text-neutral-300'>
                        {data.user.following?.length} following
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='mx-auto py-2 md:ml-auto'>
                {userId && session?.user?.id !== userId ? (
                  <FollowButton user={data.user} friendId={userId} />
                ) : (
                  <Button
                    intent='danger'
                    display='ghost'
                    onClick={() =>
                      signOut({
                        callbackUrl: '/',
                      })
                    }
                  >
                    <FiLogOut />
                    Sign out
                  </Button>
                )}
              </div>
            </div>

            {session?.user?.id === userId && (
              <>
                <h3 className='my-8 text-xl font-thin'>Your watchlist</h3>
                <MoviesList loadMore={loadMore} movies={data.watchlist} />
              </>
            )}

            {data.user.matches && data.user.matches.length > 0 && (
              <>
                <h3 className='my-8 text-xl font-thin'>
                  Your matches with {data.user.name}
                </h3>
                <MoviesList movies={data.user.matches} />
              </>
            )}
          </>
        )}
      </main>
    )
  }

  return null
}

export default User
