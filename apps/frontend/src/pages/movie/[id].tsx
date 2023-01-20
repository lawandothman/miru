import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getBackdrop, getLogo, getPoster } from 'utils/image'
import { FullPageLoader } from 'components/AsyncState'
import { gql, useQuery } from '@apollo/client'
import type { Genre, User, WatchProvider } from '__generated__/resolvers-types'
import { Movie, Trailer } from '__generated__/resolvers-types'
import { FiArrowLeft, FiLink, FiShare } from 'react-icons/fi'
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
import type { Maybe } from 'graphql/jsutils/Maybe'

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

const StreamProviders = ({
  providers,
}: {
  providers: Maybe<WatchProvider>[];
}) => {
  return (
    <div className='mt-8'>
      <h3 className='mb-4'>Stream</h3>
      <div className='flex gap-4'>
        {providers?.map((provider, i) => (
          <Tooltip
            key={i}
            content={<div className='text-xs '>{provider?.name}</div>}
          >
            <Image
              src={getLogo(provider?.logoPath ?? '')}
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

const GenrePill = ({ genre }: { genre: Maybe<Genre> }) => {
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

const Trailer = ({ trailer, height }: { trailer: Trailer; height: string }) => {
  return (
    <iframe
      height={height}
      className='mt-8 w-full rounded-lg'
      src={`${YOUTUBE_EMBED}/${trailer.key}`}
      title='YouTube video player'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    />
  )
}

const Matches = ({ matches }: { matches: Maybe<User>[] }) => {
  return (
    <div className='mt-8'>
      <h3 className='mb-4'>Watch it with</h3>
      {matches
        .filter((match) => match?.isFollowing)
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
                  <ProfilePicture size='md' user={match} />
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

  const shareMovie = async () => {
    if (!navigator.canShare()) {
      return
    }
    try {
      await navigator.share({
        title: `Watch ${data?.movie.title} with me!`,
        text: 'Check out this movie I found on Miru, we should watch it together!',
        url: window.location.href
      })
    } catch (e) {
      console.error(e)
    }
  }

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
            <div className='mx-auto flex shrink flex-col gap-10 pt-2 lg:flex-row'>
              <div className='flex flex-1 items-center justify-center'>
                {data.movie?.posterUrl && (
                  <div className='aspect-w-20 aspect-h-34 overflow-hidden rounded-lg'>
                    <Image
                      src={getPoster(data.movie.posterUrl)}
                      alt={data.movie.title ?? ''}
                      className='rounded-lg'
                      width={520}
                      height={1000}
                    />
                  </div>
                )}
              </div>
              <div className='flex flex-1 flex-col'>
                <div className='flex flex-row items-center justify-between'>
                  <div>
                    <h1 className='text-4xl font-thin tracking-wider'>
                      {data.movie.title}
                    </h1>
                    <p className='mt-2 text-xl font-thin'>
                      {data.movie.tagline}
                    </p>
                  </div>
                  {navigator.canShare() && (
                    <button
                      onClick={shareMovie}
                      className='flex h-fit items-center gap-2'
                    >
                      <FiShare />
                      Share
                    </button>
                  )}
                </div>
                <div className='mt-3 flex items-center justify-between'>
                  <span>
                    {data.movie.runtime
                      ? getRuntime(data.movie.runtime) + ' • '
                      : null}
                    {data.movie.releaseDate &&
                      DateTime.fromISO(data.movie.releaseDate).year}
                  </span>
                  <WatchlistButton session={session} movie={data.movie} />
                </div>
                <div className='text-sm text-neutral-500 dark:text-neutral-400'>
                  <div className='mt-8 flex flex-wrap gap-3'>
                    {data.movie.genres?.map((genre) => (
                      <GenrePill genre={genre} key={genre?.id} />
                    ))}
                  </div>
                  <p className='mt-8 max-w-xl text-neutral-600 dark:text-neutral-400'>
                    {data.movie.overview}
                  </p>
                  {data.movie.trailer && (
                    <Trailer height='315' trailer={data.movie.trailer} />
                  )}
                  <div className=' mt-6 flex gap-3'>
                    {data.movie?.homepage && (
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
                    {data.movie?.imdbId && (
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
                {data.movie.matches &&
                  data.movie.matches.filter((match) => match?.isFollowing)
                    .length > 0 && <Matches matches={data.movie.matches} />}

                {data.movie.streamProviders &&
                  data.movie.streamProviders.length > 0 && (
                  <StreamProviders providers={data.movie.streamProviders} />
                )}
              </div>
            </div>
          </main>
        </Page>
      )
    }

    return (
      <Page name={data.movie.title} index={`${MOVIE_INDEX}/${data.movie.id}`}>
        <div className='relative flex h-[500px] w-full items-end overflow-hidden'>
          <Image
            src={getBackdrop(data.movie.backdropUrl ?? '', 'w1280')}
            alt=''
            fill
            loading='eager'
            className='absolute object-cover object-center'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-100 dark:from-black' />
          <div className='absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-100 dark:from-black' />
          <div className='aspect-w-20 aspect-h-34 relative w-1/5 overflow-hidden rounded-lg pl-8'>
            <Image
              src={getPoster(data.movie.posterUrl ?? '', 'w342')}
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
                  {data.movie?.runtime
                    ? getRuntime(data.movie.runtime) + ' • '
                    : null}
                  {data.movie.releaseDate &&
                    DateTime.fromISO(data.movie.releaseDate).year}
                </span>
              </div>
            </div>
            <WatchlistButton session={session} movie={data.movie} />
          </div>
        </div>
        <main className='px-8'>
          {data.movie.matches &&
            data.movie.matches.filter((match) => match?.isFollowing).length >
              0 && <Matches matches={data.movie.matches} />}
          <div className='mt-8 flex flex-wrap gap-3'>
            {data.movie.genres?.map((genre) => (
              <GenrePill key={genre?.id} genre={genre} />
            ))}
          </div>
          <div className='mt-16 mb-8 flex gap-16'>
            <div className='max-w-xl flex-1'>
              <p className='mt-8 text-neutral-600 dark:text-neutral-400'>
                {data?.movie.overview}
              </p>
              <div className=' mt-6 flex gap-3 text-sm text-neutral-500 dark:text-neutral-400'>
                {data.movie?.homepage && (
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
                {data.movie?.imdbId && (
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
              {data.movie.streamProviders &&
                data.movie.streamProviders.length > 0 && (
                <StreamProviders providers={data.movie.streamProviders} />
              )}
            </div>
            {data.movie.trailer && (
              <div className='flex-1'>
                <Trailer height='413' trailer={data.movie.trailer} />
              </div>
            )}
          </div>
        </main>
      </Page>
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
