import { gql, useMutation } from '@apollo/client'
import { FiUserMinus, FiUserPlus } from 'react-icons/fi'
import type { User } from '__generated__/resolvers-types'
import { Button } from './Button'
import { Spinner } from './AsyncState/Spinner'
import type { Maybe } from 'graphql/jsutils/Maybe'

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
export const FollowButton = ({
  user,
  size = 'md',
}: {
  user: Maybe<User>;
  size?: 'sm' | 'md';
}) => {
  const [follow, { loading: followLoading }] = useMutation<
  User,
  { friendId?: string }
  >(FOLLOW, {
    variables: {
      friendId: user?.id,
    },
  })
  const [unfollow, { loading: unfollowLoading }] = useMutation<
  User,
  { friendId?: string }
  >(UNFOLLOW, {
    variables: {
      friendId: user?.id,
    },
  })

  return (
    <Button
      size={size}
      onClick={() => {
        if (user?.isFollowing) {
          unfollow()
        } else {
          follow()
        }
      }}
    >
      {followLoading || unfollowLoading ? (
        <Spinner reverted />
      ) : user?.isFollowing ? (
        <>
          <FiUserMinus />
          Unfollow
        </>
      ) : (
        <>
          <FiUserPlus /> Follow
        </>
      )}
    </Button>
  )
}
