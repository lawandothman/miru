import { gql, useMutation } from '@apollo/client'
import { FiUserMinus, FiUserPlus } from 'react-icons/fi'
import type { User } from '__generated__/resolvers-types'
import { Button } from './Button'
import { Spinner } from './Spinner'

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
  friendId,
}: {
  user: User;
  friendId: string;
}) => {
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
    <Button
      onClick={() => {
        if (user.isFollowing) {
          unfollow()
        } else {
          follow()
        }
      }}
    >
      {followLoading || unfollowLoading ? (
        <Spinner reverted />
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
    </Button>
  )
}
