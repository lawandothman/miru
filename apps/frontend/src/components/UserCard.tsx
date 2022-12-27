import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { getImage } from 'utils/image'
import Image from 'next/image'
import { cn } from 'utils/cn'

export const UserCard = ({
  user,
  extended,
}: {
  user: User;
  extended?: boolean;
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
        {extended && user.matches && user.matches.length > 0 && (
          <div className='grid grid-flow-col gap-2 overflow-x-auto p-4'>
            {user.matches?.map((match) => (
              <div className='w-40 text-center' key={match?.id}>
                {/* @law make this Next/image with a skeleton pls */}
                <div className='aspect-w-8 aspect-h-12 overflow-hidden rounded-lg'>
                  <Image
                    alt={match?.title ?? ''}
                    src={getImage(match?.posterUrl ?? '')}
                    fill
                    loading='lazy'
                    sizes='(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              25vw'
                    className={cn(
                      'absolute top-0 left-0 bottom-0 right-0 min-h-full min-w-full object-cover'
                    )}
                  />
                </div>
                <p className='truncate'>{match?.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
