import { MoviesList } from 'components/MoviesList'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { gql, NetworkStatus, useQuery } from '@apollo/client'
import type { Genre, Movie, User } from '__generated__/resolvers-types'
import { FiSearch } from 'react-icons/fi'
import type { ChangeEvent, FC, FormEvent, PropsWithChildren } from 'react'
import { useState } from 'react'
import { Popcorn } from 'components/AsyncState'
import { ProfilePicture } from 'components/Avatar'
import Link from 'next/link'
import { PageHeader } from 'components/PageHeader'
import { PAGE_LIMIT, USER_INDEX } from 'config/constants'
import { useMobile } from 'hooks/useMobile'
import { Tabs } from 'components/Tabs'

const ExploreSkeleton: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const searchQuery = Array.isArray(router.query.q)
    ? router.query.q[0]
    : router.query.q

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    router.push({
      pathname: '/explore',
      query: {
        q: e.target.value,
      },
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    router.push({
      pathname: '/explore',
      query: {
        q: query,
      },
    })
  }
  return (
    <main>
      <PageHeader title='Explore'></PageHeader>
      <form onSubmit={onSubmit} className='relative mx-auto mb-8 w-full'>
        <input
          type='text'
          autoFocus
          required
          placeholder='Search for movies or Miru members...'
          className='h-12 w-full cursor-auto rounded-xl border border-neutral-300 bg-transparent pl-12 text-neutral-600 outline-none dark:text-neutral-300'
          defaultValue={searchQuery}
          onChange={onChange}
        />
        <FiSearch className='absolute inset-y-0 my-auto h-8 w-12 stroke-neutral-400 px-3.5' />
      </form>
      {children}
    </main>
  )
}

const SEARCH = gql`
  query SearchMovies($query: String!, $offset: Int, $limit: Int) {
    movies: search(query: $query, offset: $offset, limit: $limit) {
      id
      title
      posterUrl
      inWatchlist
    }
    users: searchUsers(nameQuery: $query) {
      id
      name
      email
      image
      matches {
        id
      }
    }
  }
`

const EMPTY_STATE = gql`
  query EmptyState {
    genres: genres {
      id
      name
    }
    popularMovies: popularMovies {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const Search: NextPage = () => {
  const router = useRouter()

  const [fullyLoaded, setFullyLoaded] = useState(false)
  const searchQuery = Array.isArray(router.query.q)
    ? router.query.q[0]
    : router.query.q

  const mobile = useMobile()

  const {
    data,
    fetchMore,
    variables = { offset: 0, limit: PAGE_LIMIT },
    networkStatus,
  } = useQuery<
  { movies: Movie[]; users: User[] },
  { query?: string; limit: number; offset: number }
  >(SEARCH, {
    variables: { query: searchQuery?.trim(), limit: PAGE_LIMIT, offset: 0 },
    notifyOnNetworkStatusChange: true,
    skip: !searchQuery?.trim(),
  })

  const { data: emptyStateData } = useQuery<{
    genres: Genre[];
    popularMovies: Movie[];
  }>(EMPTY_STATE)

  if (networkStatus === NetworkStatus.loading) {
    return (
      <ExploreSkeleton>
        <div className='flex items-center justify-center'>
          <Popcorn />
        </div>
      </ExploreSkeleton>
    )
  }

  if (!searchQuery) {
    return (
      <ExploreSkeleton>
        {emptyStateData?.genres && (
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
            {emptyStateData?.genres.map((genre) => (
              <Link
                className='rounded-lg bg-neutral-800 p-8 text-center'
                key={genre.id}
                href={`/genre/${genre.id}`}
              >
                {genre.name}
              </Link>
            ))}
          </div>
        )}

        {emptyStateData?.popularMovies && (
          <div className='mt-4'>
            <PageHeader title='Popular' />
            <MoviesList movies={emptyStateData.popularMovies} />
          </div>
        )}
      </ExploreSkeleton>
    )
  }

  if (data) {
    const noResults = data.movies.length === 0 && data.users.length === 0
    if (noResults) {
      return (
        <ExploreSkeleton>
          <div className='flex flex-col items-center '>
            <h1 className='text-3xl'>Nothing Found</h1>
            <span className='font-lg mt-8 font-thin text-neutral-600 dark:text-neutral-300'>
              We couldn&apos;t find anything that matches your search :(
            </span>
          </div>
        </ExploreSkeleton>
      )
    } else {
      const isFetchingMore = networkStatus === NetworkStatus.fetchMore
      const isFullPage = data.movies.length % variables.limit === 0
      const loadMore = async () => {
        if (!isFetchingMore && isFullPage && !fullyLoaded) {
          await fetchMore({
            variables: {
              limit: PAGE_LIMIT,
              offset: data.movies.length,
            },
          }).then((res) => setFullyLoaded(!res.data.movies.length))
        }
      }

      if (mobile) {
        const tabs = [
          {
            title: 'Movies',
            value: 'tab1',
            content: (
              <>
                {data.movies.length > 0 ? (
                  <MoviesList loadMore={loadMore} movies={data.movies} />
                ) : (
                  <div className='flex flex-col items-center '>
                    <h1 className='text-3xl'>Nothing Found</h1>
                    <span className='font-lg mt-8 font-thin text-neutral-600 dark:text-neutral-300'>
                      We couldn&apos;t find any movies that matches your search
                      :(
                    </span>
                  </div>
                )}
              </>
            ),
          },
          {
            title: 'Users',
            value: 'tab2',
            content: (
              <div className='grid grid-cols-1 gap-y-5 gap-x-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
                {data.users.length > 0 ? (
                  <>
                    {data.users.map((user) => (
                      <Link
                        href={`${USER_INDEX}/${user.id}`}
                        key={user.id}
                        className='inline-flex items-center rounded-lg p-2 hover:bg-neutral-300 hover:dark:bg-neutral-600'
                      >
                        <ProfilePicture size='md' user={user} />
                        <span className='ml-3 truncate'>{user.name}</span>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className='flex flex-col items-center '>
                    <h1 className='text-3xl'>Nothing Found</h1>
                    <span className='font-lg mt-8 font-thin text-neutral-600 dark:text-neutral-300'>
                      We couldn&apos;t find any users that matches your search
                      :(
                    </span>
                  </div>
                )}
              </div>
            ),
          },
        ]
        return (
          <ExploreSkeleton>
            <Tabs tabs={tabs} />
          </ExploreSkeleton>
        )
      }

      return (
        <ExploreSkeleton>
          {data?.users && data.users.length > 0 && (
            <div className='mb-8 dark:text-white'>
              <h1 className='mb-8 text-lg'>Users</h1>
              <div className='grid grid-cols-1 gap-y-5 gap-x-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
                {data.users.map((user) => (
                  <Link
                    href={`${USER_INDEX}/${user.id}`}
                    key={user.id}
                    className='inline-flex items-center rounded-lg p-2 hover:bg-neutral-300 hover:dark:bg-neutral-600'
                  >
                    <ProfilePicture size='md' user={user} />
                    <span className='ml-3 truncate'>{user.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {data?.movies && data.movies.length > 0 && (
            <div>
              <h1 className='mb-8  text-lg dark:text-white'>Movies</h1>
              <MoviesList loadMore={loadMore} movies={data?.movies} />
            </div>
          )}
        </ExploreSkeleton>
      )
    }
  }

  return <ExploreSkeleton />
}

export default Search
