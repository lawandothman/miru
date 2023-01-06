import { gql, useMutation } from '@apollo/client'
import type { Session } from 'next-auth'
import { FiMinus, FiPlus } from 'react-icons/fi'
import type { Movie } from '__generated__/resolvers-types'
import { Button } from './Button'
import { Spinner } from './AsyncState/Spinner'

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
export const WatchlistButton = ({
  session,
  movie,
  size = 'md'
}: {
  session: Session | null;
  movie: Movie;
  size?: 'sm' | 'md'
}) => {
  const [addToWatchlist, { loading: addToWatchlistLoading }] = useMutation<
  Movie,
  { movieId?: string }
  >(ADD_TO_WATCHLIST)
  const [removeFromWatchlist, { loading: removeFromWatchlistLoading }] =
    useMutation<Movie, { movieId?: string }>(REMOVE_FROM_WATCHLIST)

  if (!session) {
    return null
  }

  return (
    <Button
      size={size}
      onClick={() => {
        if (movie.inWatchlist) {
          removeFromWatchlist({
            variables: {
              movieId: movie.id,
            },
          })
        } else {
          addToWatchlist({
            variables: {
              movieId: movie.id,
            },
          })
        }
      }}
    >
      {addToWatchlistLoading || removeFromWatchlistLoading ? (
        <>
          <Spinner reverted />
          Watchlist
        </>
      ) : (
        <>
          {movie?.inWatchlist ? <FiMinus /> : <FiPlus />}
          Watchlist
        </>
      )}
    </Button>
  )
}
