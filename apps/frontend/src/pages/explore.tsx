import { MoviesList } from 'components/MoviesList'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { gql, useLazyQuery } from '@apollo/client'
import type { Movie, User } from '__generated__/resolvers-types'
import { FiSearch } from 'react-icons/fi'
import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Popcorn } from 'components/Popcorn'
import { ProfilePicture } from 'components/Avatar'
import Link from 'next/link'

const SEARCH = gql`
  query SearchMovies($query: String!) {
    movies: search(query: $query) {
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

const Search: NextPage = () => {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const searchQuery = Array.isArray(router.query.q)
    ? router.query.q[0]
    : router.query.q

  const [search, { data, loading }] = useLazyQuery<
  { movies: Movie[]; users: User[] },
  { query?: string }
  >(SEARCH, {
    variables: { query: searchQuery },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    search({
      variables: {
        query,
      },
    })
    router.push({
      pathname: '/explore',
      query: {
        q: query,
      },
    })
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const noResults = data?.movies.length === 0 && data.users.length === 0

  return (
    <div className='px-20 pt-20'>
      <form onSubmit={onSubmit} className='relative mx-auto mb-8 w-full'>
        <input
          type='text'
          required
          placeholder='Search movies or Miru members...'
          className='h-12 w-full cursor-auto rounded-xl border border-neutral-300 bg-transparent pl-12 text-neutral-300 outline-none'
          onChange={onChange}
        />
        <FiSearch className='absolute inset-y-0 my-auto h-8 w-12 stroke-neutral-400 px-3.5' />
      </form>
      {loading ? (
        <div className='flex items-center justify-center'>
          <Popcorn />
        </div>
      ) : noResults ? (
        <div className='flex flex-col items-center dark:text-white'>
          <h1 className='text-3xl'>Nothing Found</h1>
          <span className='font-lg mt-8 font-thin text-neutral-300'>
            We couldn&apos;t find anything that matches your search :(
          </span>
        </div>
      ) : (
        <>
          {data?.users && data.users.length > 0 && (
            <div className='dark:text-white mb-8'>
              <h1 className='mb-8 text-lg'>Users</h1>
              <div className='grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
                {data.users.map((user) => (
                  <Link href={`/users/${user.id}`} key={user.id} className='hover:dark:bg-neutral-600 p-2 rounded-lg'>
                    <ProfilePicture size='md' user={user} />
                    <span className='ml-2'>{user.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {data?.movies && data.movies.length > 0 && (
            <div>
              <h1 className='mb-8  text-lg dark:text-white'>Movies</h1>
              <MoviesList movies={data?.movies} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Search
