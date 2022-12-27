import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { MoviePoster } from './MoviePoster'

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
                {match && (
                  <>
                    <MoviePoster movie={match} />
                    <p className='truncate'>{match?.title}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
