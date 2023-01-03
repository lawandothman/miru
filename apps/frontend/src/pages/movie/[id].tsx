import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getImage } from 'utils/image'
import { getYear } from 'date-fns'
import { FullPageLoader } from 'components/FullPageLoader'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Movie } from '__generated__/resolvers-types'
import { FiArrowLeft, FiLink, FiMinus, FiPlus } from 'react-icons/fi'
import { FaImdb } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { Spinner } from 'components/Spinner'
import { ProfilePicture } from 'components/Avatar'
import { Tooltip } from 'components/Tooltip'

const GET_BY_ID = gql`
  query Movie($movieId: ID!) {
    movie(id: $movieId) {
      id
      imdbId
      posterUrl
      title
      releaseDate
      overview
      tagline
      runtime
      inWatchlist
      homepage
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
      streamProviders {
        name
        logoPath
      }
      trailer {
        key
      }
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
  const router = useRouter()
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
    <main className='flex flex-col'>
      <button
        onClick={() => router.back()}
        className='flex h-8 w-8  items-center justify-center  rounded-full border text-black hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
      >
        <FiArrowLeft className='h-5 w-5' />
      </button>
      <div className='mx-auto flex flex-col gap-10 pt-4 lg:flex-row'>
        <div className='flex flex-1 justify-center'>
          {data?.movie?.posterUrl && (
            <div className='aspect-w-20 aspect-h-34 overflow-hidden rounded-lg'>
              <Image
                src={getImage(data.movie.posterUrl)}
                alt={data.movie.title ?? ''}
                className='rounded-lg'
                width={500}
                height={1000}
              />
            </div>
          )}
        </div>
        <div className='flex flex-1 flex-col'>
          <h1 className='text-4xl font-thin tracking-wider'>
            {data?.movie.title}
          </h1>
          <p className='mt-2 text-xl font-thin'>{data?.movie.tagline}</p>
          <div className='mt-3 text-sm text-neutral-500 dark:text-neutral-400'>
            <div className='flex items-center justify-between'>
              <span>
                {data?.movie?.runtime ? data.movie.runtime + '  MIN • ' : null}
                {data?.movie.releaseDate &&
                  getYear(new Date(data?.movie.releaseDate))}
              </span>

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
                  className='flex h-10 w-28 max-w-xl items-center justify-center gap-2 rounded-lg bg-black text-base font-semibold text-white dark:bg-neutral-100 dark:text-black'
                >
                  {addToWatchlistLoading || removeFromWatchlistLoading ? (
                    <>
                      <Spinner reverted />
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
            <div className='mt-8 flex gap-3'>
              {data?.movie.genres?.map((genre) => (
                <Link
                  href={`/genre/${genre?.id}`}
                  className='h-fit rounded-lg bg-neutral-200 p-2 text-xs font-bold uppercase tracking-wide text-neutral-900'
                  key={genre?.id}
                >
                  {genre?.name}
                </Link>
              ))}
            </div>
            <p className='mt-8 max-w-xl text-neutral-600 dark:text-neutral-400'>
              {data?.movie.overview}
            </p>
            {data?.movie.trailer && (
              <iframe
                height='315'
                className='mt-8 w-full'
                src={`https://www.youtube.com/embed/${data.movie.trailer.key}`}
                title='YouTube video player'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            )}
            <div className=' mt-6 flex gap-3'>
              {data?.movie?.homepage && (
                <Link
                  target='_blank'
                  rel='noreferrer noopener'
                  href={data.movie.homepage}
                  className='inline-flex items-center gap-2'
                >
                  <FiLink size={20} />
                  Homepage
                </Link>
              )}
              {data?.movie?.imdbId && (
                <Link
                  target='_blank'
                  rel='noreferrer noopener'
                  href={`https://imdb.com/title/${data.movie.imdbId}`}
                  className='inline-flex items-center justify-center gap-2'
                >
                  <FaImdb size={20} />
                  IMDB
                </Link>
              )}
            </div>
          </div>
          {data?.movie.matches &&
            data.movie.matches.filter((match) => match?.isFollowing).length >
              0 && (
            <div className='mt-8'>
              <h3 className='mb-4'>Watch it with</h3>
              {data?.movie.matches
                ?.filter((match) => match?.isFollowing)
                .map((match) => {
                  if (match) {
                    return (
                      <Tooltip
                        content={
                          <span className='text-xs'>{match.name}</span>
                        }
                        key={match.id}
                      >
                        <Link
                          className='mr-2 inline-flex items-center gap-2'
                          href={`/users/${match.id}`}
                        >
                          <ProfilePicture size='sm' user={match} />
                        </Link>
                      </Tooltip>
                    )
                  } else {
                    return null
                  }
                })}
            </div>
          )}

          {data?.movie.streamProviders &&
            data.movie.streamProviders.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-4'>Stream</h3>
              <div className='flex gap-4'>
                {data.movie.streamProviders.map((provider, i) => (
                  <Tooltip
                    key={i}
                    content={<div className='text-xs '>{provider?.name}</div>}
                  >
                    <Image
                      src={getImage(provider?.logoPath ?? '')}
                      alt={provider?.name ?? ''}
                      width={40}
                      height={40}
                      className='rounded-lg'
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Movie
