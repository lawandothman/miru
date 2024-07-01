import { USER_INDEX } from 'config/constants'
import type { Maybe } from 'graphql/jsutils/Maybe'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './ProfilePicture'
import { FollowButton } from './FollowButton'

export const UserCard = ({ user }: { user: Maybe<User> }) => {
  const { data: session } = useSession()
  return (
    <div className='flex w-full flex-row items-center justify-between p-4'>
      <div className='flex items-center gap-4'>
        <Link href={`${USER_INDEX}/${user?.id}`}>
          <ProfilePicture size='md' user={user} />
        </Link>
        <div>
          <Link className='block' href={`${USER_INDEX}/${user?.id}`}>
            {user?.name}
          </Link>
          {session?.user?.id === user?.id ? (
            <span className='text-sm dark:text-white'>You</span>
          ) : (
            <span className='text-sm dark:text-white'>
              {user?.matches?.length} matches
            </span>
          )}
        </div>
      </div>
      {session?.user?.id !== user?.id && <FollowButton size='sm' user={user} />}
    </div>
  )
}
