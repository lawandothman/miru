import { gql, useMutation } from '@apollo/client'
import type { Session } from 'next-auth'
import { FiMinus, FiPlus } from 'react-icons/fi'
import type { Movie } from '__generated__/resolvers-types'
import { Button } from './Button'
import { Spinner } from './AsyncState/Spinner'
import { signIn } from 'next-auth/react'

const ADD_TO_WATCHLIST = gql`
  mutation AddMovieToWatchlist($movieId: ID!) {
    movie: addMovieToWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`

const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveMovieFromWatchlist($movieId: ID!) {
    movie: removeMovieFromWatchlist(movieId: $movieId) {
      id
      inWatchlist
    }
  }
`
export const WatchlistButton = ({
  session,
  movie,
  size = 'md',
}: {
  session: Session | null;
  movie: Movie;
  size?: 'sm' | 'md' | 'full-width';
}) => {
  const [addToWatchlist, { loading: addLoading }] = useMutation<
  { movie: Movie },
  { movieId?: string }
  >(ADD_TO_WATCHLIST, {
    variables: {
      movieId: movie.id,
    },
  })

  const [removeFromWatchlist, { loading: removeLoading }] = useMutation<
  { movie: Movie },
  { movieId?: string }
  >(REMOVE_FROM_WATCHLIST, {
    variables: {
      movieId: movie.id,
    },
  })

  const onClick = async () => {
    if (!session) {
      return await signIn()
    }
    if (movie.inWatchlist) {
      await removeFromWatchlist()
    } else {
      await addToWatchlist()
    }
  }

  const isLoading = addLoading || removeLoading

  return (
    <Button size={size} onClick={onClick}>
      {isLoading ? (
        <Spinner reverted />
      ) : (
        <>{movie?.inWatchlist ? <FiMinus /> : <FiPlus />}</>
      )}
      Watchlist
    </Button>
  )
}
