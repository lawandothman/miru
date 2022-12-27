import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getImage } from 'utils/image'
import { getYear } from 'date-fns'
import { FullPageLoader } from 'components/FullPageLoader'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Movie } from '__generated__/resolvers-types'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import { Spinner } from 'components/Spinner'
import { ProfilePicture } from 'components/Avatar'

const GET_BY_ID = gql`
  query Movie($movieId: ID!) {
    movie(id: $movieId) {
      id
      posterUrl
      title
      releaseDate
      overview
      genres {
        name
        id
      }
      matches {
        id
        name
        image
        isFollowing
      }
      inWatchlist
    }
  }
`

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

const Movie: NextPage = () => {
  const { query } = useRouter()
  const movieId = Array.isArray(query.id) ? query.id[0] : query.id
  const { data: session } = useSession()

  const { data, loading } = useQuery<{ movie: Movie }, { movieId?: string }>(
    GET_BY_ID,
    {
      variables: {
        movieId,
      },
    }
  )

  const [addToWatchlist, { loading: addToWatchlistLoading }] = useMutation<
  Movie,
  { movieId?: string }
  >(ADD_TO_WATCHLIST)
  const [removeFromWatchlist, { loading: removeFromWatchlistLoading }] =
    useMutation<Movie, { movieId?: string }>(REMOVE_FROM_WATCHLIST)

  if (loading) {
    return <FullPageLoader />
  }
  return (
    <div className='flex flex-col px-8 pt-10'>
      <div className='mx-auto flex flex-col gap-24 pt-10 md:flex-row'>
        {data?.movie?.posterUrl && (
          <Image
            src={getImage(data.movie.posterUrl)}
            alt={data.movie.title ?? 'movie'}
            width={450}
            height={1000}
          />
        )}
        <div className='flex max-w-xl flex-col dark:text-white'>
          <h1 className='text-4xl font-thin uppercase tracking-widest '>
            {data?.movie.title}
          </h1>
          {/* <p className="mt-2 text-xl font-thin">{movie?.tagline}</p> */}
          <div className='mt-6 text-sm text-neutral-400'>
            {/* {movie?.spoken_languages?.map((lang) => (
              <span key={lang.iso_639_1}>{lang.name} / </span>
            ))} */}
            <span>
              {/* {movie?.runtime && movie.runtime + " MIN / "} */}
              {data?.movie.releaseDate &&
                getYear(new Date(data?.movie.releaseDate))}
            </span>
            <div className='mt-8 flex gap-3'>
              {data?.movie.genres?.map((genre) => (
                <Link
                  href={`/genre/${genre?.id}`}
                  className='rounded border border-neutral-400 p-2 text-xs tracking-wide'
                  key={genre?.id}
                >
                  {genre?.name}
                </Link>
              ))}
            </div>
            <p className='mt-8 max-w-xl text-neutral-400'>
              {data?.movie.overview}
            </p>
            {/* <div className=" mt-6 flex gap-3">
              {movie?.homepage && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={movie?.homepage}
                  className="inline-flex items-center gap-2"
                >
                  <FiLink size={20} />
                  Homepage
                </Link>
              )}
              {movie?.imdb_id && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`https://imdb.com/title/${movie.imdb_id}`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <FaImdb size={20} />
                  IMDB
                </Link>
              )}
              {trailer && (
                <Link
                  target="_blank"
                  rel="noreferrer noopener"
                  href={`https://youtube.com/watch?v=${trailer.key}`}
                  className="inline-flex items-center justify-center gap-2"
                >
                  <FiYoutube size={20} />
                  Trailer
                </Link>
              )}
            </div> */}
          </div>
          {data?.movie.matches &&
            data.movie.matches.filter((match) => match?.isFollowing).length >
              0 && (
            <div className='mt-8'>
              <h3 className='mb-4'>Added To Watchlist By</h3>
              {data?.movie.matches
                ?.filter((match) => match?.isFollowing)
                .map((match) => {
                  if (match) {
                    return (
                      <Link
                        className='inline-flex items-center gap-2'
                        href={`/users/${match.id}`}
                        key={match.id}
                      >
                        <ProfilePicture size='sm' user={match} />
                        <span>{match?.name}</span>
                      </Link>
                    )
                  } else {
                    return null
                  }
                })}
            </div>
          )}
          {session && (
            <button
              onClick={() => {
                if (data?.movie.inWatchlist) {
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
              className='mt-8 mr-auto flex items-center justify-center gap-2 rounded border border-white px-4 py-1 dark:text-white'
            >
              {addToWatchlistLoading || removeFromWatchlistLoading ? (
                <>
                  <Spinner />
                  Watchlist
                </>
              ) : (
                <>
                  {data?.movie?.inWatchlist ? <FiMinus /> : <FiPlus />}
                  Watchlist
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Movie
