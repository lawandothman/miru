import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { MovieBackdrop } from './MovieBackdrop'

export const UserSummary = ({
  user,
}: {
  user: User;
}) => {
  return (
    <div className='mb-4 rounded-lg border bg-white p-4 text-black dark:text-white drop-shadow-sm dark:border-none dark:bg-neutral-900'>
      <Link href={`/users/${user.id}`} className='inline-flex'>
        <div className='gap-4 rounded-lg'>
          <div className='flex items-center gap-3'>
            <ProfilePicture size='md' user={user} />
            <div>
              <h3 key={user.id}>{user.name}</h3>
              <span className='text-sm'>{user.matches?.length} matches</span>
            </div>
          </div>
        </div>
      </Link>
      {user.matches && user.matches.length > 0 && (
        <div className='grid w-fit max-w-full grid-flow-col gap-8 overflow-x-auto p-4'>
          {user.matches?.map((match) => (
            <div className='w-60 text-center' key={match?.id}>
              {match && (
                <Link href={`/movie/${match.id}`}>
                  <MovieBackdrop movie={match} />
                  <p className='truncate'>{match?.title}</p>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
