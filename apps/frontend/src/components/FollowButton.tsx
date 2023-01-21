import { gql, useMutation } from '@apollo/client'
import { FiUserMinus, FiUserPlus } from 'react-icons/fi'
import type { User } from '__generated__/resolvers-types'
import { Button } from './Button'
import { Spinner } from './AsyncState/Spinner'
import type { Maybe } from 'graphql/jsutils/Maybe'
import type { ButtonHTMLAttributes } from 'react'

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

type FollowButtonProps = {
  user: Maybe<User>;
  size: 'sm' | 'md' | 'full-width';
} & ButtonHTMLAttributes<HTMLButtonElement>

export const FollowButton = ({
  user,
  size = 'md',
  ...props
}: FollowButtonProps) => {
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

  const loading = followLoading || unfollowLoading

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
      {...props}
    >
      {loading ? (
        <Spinner reverted />
      ) : user?.isFollowing ? (
        <>
          <FiUserMinus />
          {size != 'sm' && 'Unfollow'}
        </>
      ) : (
        <>
          <FiUserPlus />
          {size != 'sm' && 'Follow'}
        </>
      )}
    </Button>
  )
}
