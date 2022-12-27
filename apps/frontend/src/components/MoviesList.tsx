import { gql, useMutation } from '@apollo/client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { FC } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { Movie } from '__generated__/resolvers-types'
import { MoviePoster } from './MoviePoster'
import { Spinner } from './Spinner'

interface MoviesListProps {
  movies?: Array<Movie | null>;
}

const ADD_TO_WATCHLIST = gql`
  mutation AddMovieToWatchlist($movieId: ID!) {
    addMovieToWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`

const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveMovieFromWatchlist($movieId: ID!) {
    removeMovieFromWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`

export const LoadingSkeleton = () => {
  return (
    <div className='my-8'>
      <div className='grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-8'>
        {new Array(24).fill(true)?.map((item, idx) => {
          return (
            <div key={idx} className='h-full w-full'>
              <div className='h-[400px] min-h-full w-full min-w-full animate-pulse rounded-lg bg-neutral-700' />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const MoviesList: FC<MoviesListProps> = ({ movies }) => {
  return (
    <div>
      <div className='grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
        {movies?.map((movie) => {
          return <Movie key={movie?.id} movie={movie} />
        })}
      </div>
    </div>
  )
}

const Movie = ({ movie }: { movie: Movie | null }) => {
  const { data: session } = useSession()
  const [addToWatchlist, { loading: addToWatchlistLoading }] = useMutation<
  Movie,
  { movieId?: string }
  >(ADD_TO_WATCHLIST)
  const [removeFromWatchlist, { loading: removeFromWatchlistLoading }] =
    useMutation<Movie, { movieId?: string }>(REMOVE_FROM_WATCHLIST)

  return (
    <div className='h-full w-full'>
      {movie && (
        <Link href={`/movie/${movie?.id}`}>
          <MoviePoster movie={movie} />
        </Link>
      )}
      <h3 className='mt-4 text-center text-sm dark:text-neutral-300'>
        {movie?.title}
      </h3>
      {session && (
        <button
          onClick={() => {
            const movieId = movie?.id
            if (movie?.inWatchlist) {
              removeFromWatchlist({
                variables: {
                  movieId,
                },
              })
            } else {
              addToWatchlist({
                variables: {
                  movieId,
                },
              })
            }
          }}
          className='mx-auto mb-8 mt-4 flex h-8 w-32 items-center justify-center gap-1 rounded-md border border-neutral-500 dark:text-neutral-300'
        >
          {addToWatchlistLoading || removeFromWatchlistLoading ? (
            <>
              <Spinner />
              Watchlist
            </>
          ) : (
            <>
              {movie?.inWatchlist ? <FiMinus /> : <FiPlus />}
              Watchlist
            </>
          )}
        </button>
      )}
    </div>
  )
}
