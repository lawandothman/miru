import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { MoviePoster } from './MoviePoster'

export const UserCard = ({
  user,
}: {
  user: User;
}) => {
  return (
    <Link href={`/users/${user.id}`}>
      <div className='gap-4 rounded-lg p-4 text-white hover:bg-neutral-700'>
        <div className='flex items-center gap-3'>
          <ProfilePicture size='md' user={user} />
          <div>
            <h3 key={user.id}>{user.name}</h3>
            <span className='text-sm'>{user.matches?.length} matches</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
