import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getImage } from 'utils/image'
import { getYear } from 'date-fns'
import { FullPageLoader } from 'components/AsyncState'
import { gql, useQuery } from '@apollo/client'
import { Movie } from '__generated__/resolvers-types'
import { FiArrowLeft, FiLink } from 'react-icons/fi'
import { FaImdb } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { ProfilePicture } from 'components/Avatar'
import { Tooltip } from 'components/Tooltip'
import { WatchlistButton } from 'components/WatchlistButton'
import {
  GENRE_INDEX,
  IMDB_TITLE,
  USER_INDEX,
  YOUTUBE_EMBED,
} from 'config/constants'

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

const Movie: NextPage = () => {
  const router = useRouter()
  const movieId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id
  const { data: session } = useSession()

  const { data, loading } = useQuery<{ movie: Movie }, { movieId?: string }>(
    GET_BY_ID,
    {
      variables: {
        movieId,
      },
    }
  )

  if (loading) {
    return <FullPageLoader />
  }

  if (data) {
    return (
      <main>
        <button
          onClick={() => router.back()}
          className='flex h-8 w-8  items-center justify-center  rounded-full border text-black hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
        >
          <FiArrowLeft className='h-5 w-5' />
        </button>
        <div className='mx-auto flex flex-shrink flex-col gap-10 pt-2 lg:flex-row'>
          <div className='flex flex-1 items-center justify-center'>
            {data.movie?.posterUrl && (
              <div className='aspect-w-20 aspect-h-34 overflow-hidden rounded-lg'>
                <Image
                  src={getImage(data.movie.posterUrl)}
                  alt={data.movie.title ?? ''}
                  className='rounded-lg'
                  width={520}
                  height={1000}
                />
              </div>
            )}
          </div>
          <div className='flex flex-1 flex-col'>
            <h1 className='text-4xl font-thin tracking-wider'>
              {data.movie.title}
            </h1>
            <p className='mt-2 text-xl font-thin'>{data.movie.tagline}</p>
            <div className='mt-3 flex items-center justify-between'>
              <span>
                {data?.movie?.runtime ? data.movie.runtime + '  MIN • ' : null}
                {data?.movie.releaseDate &&
                  getYear(new Date(data?.movie.releaseDate))}
              </span>
              <WatchlistButton session={session} movie={data.movie} />
            </div>
            <div className='text-sm text-neutral-500 dark:text-neutral-400'>
              <div className='mt-8 flex flex-wrap gap-3'>
                {data?.movie.genres?.map((genre) => (
                  <Link
                    href={`${GENRE_INDEX}/${genre?.id}`}
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
                  src={`${YOUTUBE_EMBED}/${data.movie.trailer.key}`}
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
                    href={`${IMDB_TITLE}/${data.movie.imdbId}`}
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
                            href={`${USER_INDEX}/${match.id}`}
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
                      content={
                        <div className='text-xs '>{provider?.name}</div>
                      }
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

  return null
}

export default Movie
