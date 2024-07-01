import { gql, useMutation } from '@apollo/client'
import type { Session } from 'next-auth'
import type { Movie } from '__generated__/resolvers-types'
import { Button } from './ui/button'
import { Spinner } from './AsyncState/Spinner'
import { signIn } from 'next-auth/react'
import type { ButtonHTMLAttributes } from 'react'
import { Minus, Plus } from 'lucide-react'

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

type WatchlistButtonProps = {
  session: Session | null;
  movie: Movie;
} & ButtonHTMLAttributes<HTMLButtonElement>
export const WatchlistButton = ({
  session,
  movie,
  ...props
}: WatchlistButtonProps) => {
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
    <Button disabled={isLoading} onClick={onClick} {...props}>
      {isLoading ? (
        <Spinner reverted  />
      ) : (
        <>{movie?.inWatchlist ? <Minus size={16} className='mr-2' /> : <Plus size={16} className='mr-2' />}</>
      )}
      Watchlist
    </Button>
  )
}
