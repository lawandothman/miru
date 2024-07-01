import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { FC } from 'react'
import { type Movie } from '__generated__/resolvers-types'
import { MoviePoster } from './MoviePoster'
import InfiniteScroll from 'react-infinite-scroller'
import { WatchlistButton } from './WatchlistButton'
import { MOVIE_INDEX } from 'config/constants'
import type { Maybe } from 'graphql/jsutils/Maybe'

interface MoviesListProps {
  movies?: Maybe<Movie>[];
  loadMore?: () => Promise<void>;
}

export const LoadingSkeleton = () => {
  return (
    <div className='my-8'>
      <div className='grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-8'>
        {new Array(24).fill(true)?.map((item, idx) => {
          return (
            <div key={idx} className='size-full'>
              <div className='h-[400px] min-h-full w-full min-w-full animate-pulse rounded-lg bg-neutral-300 dark:bg-neutral-700' />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const MoviesList: FC<MoviesListProps> = ({ movies, loadMore }) => {
  return (
    <div>
      {loadMore ? (
        <InfiniteScroll
          pageStart={0}
          className='grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'
          loadMore={async () => {
            await loadMore()
          }}
          hasMore={true}
        >
          {movies?.map((movie) => {
            return <Movie key={movie?.id} movie={movie} />
          })}
        </InfiniteScroll>
      ) : (
        <div className='grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
          {movies?.map((movie) => {
            return <Movie key={movie?.id} movie={movie} />
          })}
        </div>
      )}
    </div>
  )
}

const Movie = ({ movie }: { movie: Maybe<Movie> }) => {
  const { data: session } = useSession()

  if (!movie) {
    return null
  }

  return (
    <div className='flex size-full flex-col'>
      {movie && (
        <Link href={`${MOVIE_INDEX}/${movie?.id}`}>
          <MoviePoster movie={movie} />
        </Link>
      )}
      <h3 className='my-4 text-center text-sm dark:text-neutral-300'>
        {movie?.title}
      </h3>
      <div className='mt-auto flex items-center justify-center'>
        <WatchlistButton
          className='h-8 w-full py-5'
          movie={movie}
          session={session}
        />
      </div>
    </div>
  )
}
