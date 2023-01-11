import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getImage } from 'utils/image'
import { FullPageLoader } from 'components/AsyncState'
import { gql, useQuery } from '@apollo/client'
import type { Genre } from '__generated__/resolvers-types'
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
  MOVIE_INDEX,
  USER_INDEX,
  YOUTUBE_EMBED,
} from 'config/constants'
import { DateTime, Duration } from 'luxon'
import { Page } from 'components/Page'
import { useMobile } from 'hooks/useMobile'

const GET_BY_ID = gql`
  query Movie($movieId: ID!) {
    movie(id: $movieId) {
      id
      imdbId
      backdropUrl
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

const StreamProviders = ({ movie }: { movie: Movie }) => {
  if (!movie) {
    return null
  }
  return (
    <div className='mt-8'>
      <h3 className='mb-4'>Stream</h3>
      <div className='flex gap-4'>
        {movie.streamProviders?.map((provider, i) => (
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
  )
}

const GenrePill = ({ genre }: { genre?: Genre | null }) => {
  return (
    <Link
      href={`${GENRE_INDEX}/${genre?.id}`}
      className='h-fit rounded-lg bg-neutral-200 p-2 text-xs font-bold uppercase tracking-wide text-neutral-900'
      key={genre?.id}
    >
      {genre?.name}
    </Link>
  )
}

const Trailer = ({ movie }: { movie: Movie }) => {
  return (
    <iframe
      height='315'
      className='mt-8 w-full'
      src={`${YOUTUBE_EMBED}/${movie.trailer?.key}`}
      title='YouTube video player'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    />
  )
}

const Matches = ({ movie }: { movie: Movie }) => {
  return (
    <div className='mt-8 px-8'>
      <h3 className='mb-4'>Watch it with</h3>
      {movie.matches
        ?.filter((match) => match?.isFollowing)
        .map((match) => {
          if (match) {
            return (
              <Tooltip
                content={<span className='text-xs'>{match.name}</span>}
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
  )
}

const Movie: NextPage = () => {
  const router = useRouter()
  const movieId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id
  const { data: session } = useSession()
  const mobile = useMobile()

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
    if (mobile) {
      return (
        <Page name={data.movie.title} index={`${MOVIE_INDEX}/${data.movie.id}`}>
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
                    {data?.movie?.runtime
                      ? getRuntime(data.movie.runtime) + ' • '
                      : null}
                    {data?.movie.releaseDate &&
                      DateTime.fromISO(data.movie.releaseDate).year}
                  </span>
                  <WatchlistButton session={session} movie={data.movie} />
                </div>
                <div className='text-sm text-neutral-500 dark:text-neutral-400'>
                  <div className='mt-8 flex flex-wrap gap-3'>
                    {data?.movie.genres?.map((genre) => (
                      <GenrePill genre={genre} key={genre?.id} />
                    ))}
                  </div>
                  <p className='mt-8 max-w-xl text-neutral-600 dark:text-neutral-400'>
                    {data?.movie.overview}
                  </p>
                  {data?.movie.trailer && <Trailer movie={data.movie} />}
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
                  data.movie.matches.filter((match) => match?.isFollowing)
                    .length > 0 && <Matches movie={data.movie} />}

                {data?.movie.streamProviders &&
                  data.movie.streamProviders.length > 0 && (
                  <StreamProviders movie={data.movie} />
                )}
              </div>
            </div>
          </main>
        </Page>
      )
    }

    return (
      <>
        <div className='relative flex h-[750px] w-full items-end overflow-hidden'>
          <Image
            src={getImage(data.movie.backdropUrl ?? '', 'w1280')}
            alt=''
            fill
            loading='eager'
            className='absolute object-cover object-center'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-[200]' />
          <div className='absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-[200%]' />
          <div className='aspect-w-20 aspect-h-34 relative w-1/5 overflow-hidden rounded-lg pl-8'>
            <Image
              src={getImage(data.movie.posterUrl ?? '')}
              alt={data.movie.title ?? ''}
              className='rounded-lg'
              width={400}
              height={1000}
            />
          </div>
          <div className='relative ml-8 flex w-4/5 items-center justify-between pr-8'>
            <div>
              <h1 className=' text-4xl font-thin tracking-wider'>
                {data.movie.title}
              </h1>
              <p className='mt-2 text-xl font-thin'>{data.movie.tagline}</p>
              <div className='mt-3 flex items-center justify-between'>
                <span>
                  {data?.movie?.runtime
                    ? getRuntime(data.movie.runtime) + ' • '
                    : null}
                  {data?.movie.releaseDate &&
                    DateTime.fromISO(data.movie.releaseDate).year}
                </span>
              </div>
            </div>
            <WatchlistButton session={session} movie={data.movie} />
          </div>
        </div>
        {data?.movie.matches &&
          data.movie.matches.filter((match) => match?.isFollowing).length >
            0 && <Matches movie={data.movie} />}
        <div className='mt-8 flex flex-wrap gap-3 px-8'>
          {data?.movie.genres?.map((genre) => (
            <GenrePill key={genre?.id} genre={genre} />
          ))}
        </div>
        <div className='mt-16 mb-8 flex gap-16 px-8'>
          <div className='max-w-xl'>
            <p className='mt-8  text-justify text-neutral-600 dark:text-neutral-400'>
              {data?.movie.overview}
            </p>
            {data?.movie.streamProviders &&
              data.movie.streamProviders.length > 0 && (
              <StreamProviders movie={data.movie} />
            )}
          </div>
          {data?.movie.trailer && <Trailer movie={data.movie} />}
        </div>
      </>
    )
  }

  return null
}

const getRuntime = (minutes: number) => {
  const duration = Duration.fromObject({ minutes })
  if (duration.as('hour') < 1) {
    return duration.toFormat('m\'m\'')
  } else if (duration.minutes % 60 === 0) {
    return duration.toFormat('h\'h\'')
  } else {
    return duration.toFormat('h\'h\' m\'m\'')
  }
}

export default Movie
