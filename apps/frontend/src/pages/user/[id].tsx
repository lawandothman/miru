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
import { FullPageLoader } from 'components/AsyncState'
import { MoviesList } from 'components/MoviesList'
import { UserCard } from 'components/UserCard'
import { USER_INDEX } from 'config/constants'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiLogOut } from 'react-icons/fi'
import { User } from '__generated__/resolvers-types'
import { Page } from 'components/Page'
import { Tooltip } from 'components/Tooltip'
import { BiBot } from 'react-icons/bi'

const SEARCH_USER = gql`
  query User($userId: ID!) {
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
      isBot
      followers {
        id
        name
        image
        matches {
          id
        }
        isFollowing
      }
      following {
        id
        name
        image
        matches {
          id
        }
        isFollowing
      }
      watchlist {
        id
        title
        posterUrl
        inWatchlist
      }
    }
  }
`

const FollowersDialog = ({
  user,
  onOpenChange,
}: {
  user: User;
  onOpenChange: () => void;
}) => {
  const [open, setIsOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setIsOpen(!open)
        onOpenChange()
      }}
    >
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
          {user.followers?.map((follower) => (
            <UserCard user={follower} key={follower?.id} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const FollowingDialog = ({
  user,
  onOpenChange,
}: {
  user: User;
  onOpenChange: () => void;
}) => {
  const [open, setIsOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setIsOpen(!open)
        onOpenChange()
      }}
    >
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
          {user.following?.map((following) => (
            <UserCard user={following} key={following?.id} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const User = () => {
  const { query } = useRouter()
  const userId = Array.isArray(query.id) ? query.id[0] : query.id
  const { data: session, status } = useSession({
    required: true,
  })

  const { data, networkStatus, refetch } = useQuery<
  { user: User },
  { userId?: string }
  >(SEARCH_USER, {
    variables: {
      userId,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  })

  if (networkStatus === NetworkStatus.loading || status === 'loading') {
    return <FullPageLoader />
  }

  if (data) {
    return (
      <Page
        name={data.user.name}
        index={`${USER_INDEX}/${data.user.id}`}
        nofollow
        noindex
      >
        <main>
          {data.user && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-[9fr,1fr]'>
                <div className='flex items-center gap-4'>
                  <ProfilePicture size='lg' user={data.user} />
                  <div>
                    <div className='flex items-center gap-2'>
                      <h1 className='text-lg dark:text-neutral-300 lg:text-3xl'>
                        {data.user.name}
                      </h1>
                      {data.user.isBot && (
                        <Tooltip
                          content={<div className='text-xs'>Miru Bot</div>}
                        >
                          <div>
                            <BiBot className='h-6 w-6 text-purple-600' />
                          </div>
                        </Tooltip>
                      )}
                    </div>
                    <div className='mt-1 flex gap-2 text-sm lg:gap-4 lg:text-base'>
                      {session?.user?.id !== userId && (
                        <span className='dark:text-neutral-300'>
                          {data.user.matches?.length} matches
                        </span>
                      )}
                      {data.user.followers && data.user.followers.length > 0 ? (
                        <FollowersDialog
                          user={data.user}
                          onOpenChange={refetch}
                        />
                      ) : (
                        <span className='dark:text-neutral-300'>
                          {data.user.followers?.length} followers
                        </span>
                      )}
                      {data.user.following && data.user.following.length > 0 ? (
                        <FollowingDialog
                          user={data.user}
                          onOpenChange={refetch}
                        />
                      ) : (
                        <span className='dark:text-neutral-300'>
                          {data.user.following?.length} following
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='mt-4 lg:ml-auto'>
                  {session?.user?.id !== userId ? (
                    <FollowButton
                      className='h-10 w-full md:w-36 '
                      size='md'
                      user={data.user}
                    />
                  ) : (
                    <Button
                      className='w-full border border-red-500'
                      intent='danger'
                      display='ghost'
                      onClick={() =>
                        signOut({
                          callbackUrl: '/',
                        })
                      }
                    >
                      <FiLogOut />
                      Log out
                    </Button>
                  )}
                </div>
              </div>
              {data.user.watchlist && data.user.watchlist.length > 0 && (
                <>
                  <h3 className='mb-4 mt-8 text-3xl font-thin'>Watchlist</h3>
                  <MoviesList movies={data.user.watchlist} />
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
      </Page>
    )
  }

  return null
}

export default User
