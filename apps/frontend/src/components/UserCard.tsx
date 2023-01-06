import { USER_INDEX } from 'config/constants'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'

export const UserCard = ({ user }: { user: User }) => {
  const { data: session } = useSession()
  return (
    <Link href={`${USER_INDEX}/${user.id}`}>
      <div className='gap-4 rounded-lg p-4 hover:bg-neutral-200  dark:hover:bg-neutral-700'>
        <div className='flex items-center gap-3'>
          <ProfilePicture size='md' user={user} />
          <div>
            <h3 key={user.id}>{user.name}</h3>
            {session?.user?.id === user.id ? (
              <span className='text-sm dark:text-white'>You</span>
            ) : (
              <span className='text-sm dark:text-white'>
                {user.matches?.length} matches
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
