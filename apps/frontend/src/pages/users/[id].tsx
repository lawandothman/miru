import { gql, useQuery } from '@apollo/client'
import { ProfilePicture } from 'components/Avatar'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from 'components/Dialog'
import { FollowButton } from 'components/FollowButton'
import { MoviesList } from 'components/MoviesList'
import { UserCard } from 'components/UserCard'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { User } from '__generated__/resolvers-types'

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
  }
`

const FollowersDialog = ({ user }: { user: User }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className='dark:text-neutral-300'>
          {user.followers?.length} followers
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className='mb-8 text-center text-lg font-semibold dark:text-neutral-300'>
          Followers
        </DialogTitle>
        {user.followers?.map((follower) => {
          if (follower) {
            return <UserCard user={follower} key={follower.id} />
          }
        })}
      </DialogContent>
    </Dialog>
  )
}

const FollowingDialog = ({ user }: { user: User }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className='dark:text-neutral-300'>
          {user.following?.length} following
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className='mb-8 text-center text-lg font-semibold dark:text-neutral-300'>
          Following
        </DialogTitle>
        {user.following?.map((following) => {
          if (following) {
            return <UserCard user={following} key={following.id} />
          }
        })}
      </DialogContent>
    </Dialog>
  )
}

const User = () => {
  const { query } = useRouter()
  const userId = Array.isArray(query.id) ? query.id[0] : query.id
  const { data: session } = useSession()
  const { data } = useQuery<{ user: User }, { userId?: string }>(SEARCH_USER, {
    variables: {
      userId,
    },
  })

  return (
    <div className='px-20 pt-20'>
      {data?.user && (
        <>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <ProfilePicture size='lg' user={data.user} />
              <div>
                <h1 className='text-3xl  dark:text-neutral-300'>
                  {data?.user.name}
                </h1>
                <div className='mt-1 flex gap-4'>
                  <span className='dark:text-neutral-300'>
                    {data.user.matches?.length} matches
                  </span>
                  <FollowersDialog user={data.user} />
                  <FollowingDialog user={data.user} />
                </div>
              </div>
            </div>
            {userId && session?.user?.id !== userId && (
              <FollowButton user={data.user} friendId={userId} />
            )}
          </div>

          {data?.user.matches && data.user.matches.length > 0 && (
            <>
              <h3 className='my-8 text-xl font-thin text-neutral-300'>
                Your matches with {data?.user.name}
              </h3>
              <MoviesList movies={data?.user.matches} />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default User
