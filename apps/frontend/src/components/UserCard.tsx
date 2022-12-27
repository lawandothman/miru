import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { getImage } from 'utils/image'

export default function UserCard({ user, extended }: { user: User, extended?: boolean }) {
  return (
    <Link href={`/users/${user.id}`} key={user.id}>
      <div className='hover:bg-neutral-700 rounded-lg p-4 gap-4 text-white'>
        <div className='flex items-center'>
          <ProfilePicture size='md' user={user} />
          <div className='ml-2'>
            <h3 key={user.id}>{user.name}</h3>
            <span className='text-sm'>
              {user.matches?.length} matches
            </span>
          </div>
        </div>
        {extended && (
          <div className='grid grid-flow-col overflow-x-auto p-4 gap-2'>
            {user.matches?.map((match) => (
              <div className='w-40' key={match?.id}>
                {/* @law make this Next/image with a skeleton pls */}
                <img width='100%' className='rounded-lg' height={'auto'} loading='lazy' src={getImage(match?.posterUrl)}/>
                <p className='truncate'>{match?.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
