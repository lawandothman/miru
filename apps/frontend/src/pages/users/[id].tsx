import { gql, useMutation, useQuery } from '@apollo/client'
import { ProfilePicture } from 'components/Avatar'
import { MoviesList } from 'components/MoviesList'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FiUserPlus } from 'react-icons/fi'
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
      isFollowed
    }
  }
`

const FOLLOW = gql`
  mutation ($friendId: ID!) {
    follow(friendId: $friendId) {
      id
      isFollowing
    }
  }
`

const User = () => {
  const { query } = useRouter()
  const userId = Array.isArray(query.id) ? query.id[0] : query.id
  const [follow] = useMutation<User, { friendId: string }>(FOLLOW)
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
              <h1 className='text-3xl  dark:text-neutral-300'>
                {data?.user.name}
              </h1>
            </div>
            {session?.user?.id !== userId && (
              <button
                className='flex h-10 w-28 items-center justify-center gap-2 rounded-lg font-semibold dark:bg-neutral-100'
                onClick={() => {
                  follow()
                }}
              >
                <FiUserPlus /> Follow
              </button>
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
