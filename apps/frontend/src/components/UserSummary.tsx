import Link from 'next/link'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from './Avatar'
import { MovieBackdrop } from './MovieBackdrop'

export const UserSummary = ({ user }: { user: User }) => {
  return (
    <div className='mb-4 rounded-lg border bg-white p-4 text-black drop-shadow-sm dark:border-none dark:bg-neutral-900 dark:text-white'>
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
        <div className='grid w-full max-w-full grid-flow-row gap-8 overflow-x-auto p-4 md:w-fit md:grid-flow-col'>
          {user.matches?.map((match) => (
            <div className='w-full text-center md:w-60' key={match?.id}>
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
