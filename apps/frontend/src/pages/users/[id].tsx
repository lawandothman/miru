import { gql, useMutation, useQuery } from '@apollo/client'
import { ProfilePicture } from 'components/Avatar'
import { MoviesList } from 'components/MoviesList'
import { Spinner } from 'components/Spinner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FiUserMinus, FiUserPlus } from 'react-icons/fi'
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
      }
      following {
        id
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
const UNFOLLOW = gql`
  mutation ($friendId: ID!) {
    unfollow(friendId: $friendId) {
      id
      isFollowing
      followers {
        id
      }
    }
  }
`

const FollowButton = ({ user, friendId }: { user: User; friendId: string }) => {
  const [follow, { loading: followLoading }] = useMutation<
  User,
  { friendId: string }
  >(FOLLOW, {
    variables: {
      friendId,
    },
  })
  const [unfollow, { loading: unfollowLoading }] = useMutation<
  User,
  { friendId: string }
  >(UNFOLLOW, {
    variables: {
      friendId,
    },
  })
  return (
    <button
      className='flex h-10 w-28 max-w-xl items-center justify-center gap-2 rounded-lg font-semibold dark:bg-neutral-100'
      onClick={() => {
        if (user.isFollowing) {
          unfollow()
        } else {
          follow()
        }
      }}
    >
      {followLoading || unfollowLoading ? (
        <Spinner />
      ) : user.isFollowing ? (
        <>
          <FiUserMinus />
          Unfollow
        </>
      ) : (
        <>
          <FiUserPlus /> Follow
        </>
      )}
    </button>
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
                  <span className='dark:text-neutral-300'>
                    {data.user.followers?.length} followers
                  </span>
                  <span className='dark:text-neutral-300'>
                    {data.user.following?.length} following
                  </span>
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
