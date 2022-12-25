import { gql, useLazyQuery } from '@apollo/client'
import { ProfilePicture } from 'components/Avatar'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import type { User } from '__generated__/resolvers-types'

const SEARCH_USERS = gql`
  query SearchUsers($nameQuery: String!) {
    searchUsers(nameQuery: $nameQuery) {
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

const Users = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchUsers, { data }] = useLazyQuery<
    { searchUsers: User[] },
    { nameQuery: string }
  >(SEARCH_USERS)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    searchUsers({
      variables: {
        nameQuery: query,
      },
    })
    router.push({
      pathname: '/users',
      query: {
        q: query,
      },
    })
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className='px-20 pt-20'>
      <form onSubmit={onSubmit} className='relative mx-auto mb-8 w-full'>
        <input
          type='text'
          required
          placeholder='Search users..'
          className='h-12 w-full cursor-auto rounded-xl border border-neutral-300 bg-transparent pl-12 text-neutral-300 outline-none'
          onChange={onChange}
        />
        <FiSearch className='absolute inset-y-0 my-auto h-8 w-12 stroke-neutral-400 px-3.5' />
      </form>

      {data?.searchUsers && (
        <>
          {data.searchUsers.length === 0 && (
            <span className='mb-4 block dark:text-neutral-300'>
              Found no results for {router.query.q}
            </span>
          )}
          <span className='mb-4 block dark:text-neutral-300'>
            Found {data.searchUsers.length} result
            {data.searchUsers.length > 1 && 's'} for {router.query.q}
          </span>
          {data?.searchUsers.map((user) => (
            <Link href={`/users/${user.id}`} key={user.id}>
              <div className='flex max-w-lg items-center gap-4 rounded-lg p-4 hover:bg-neutral-700'>
                <ProfilePicture size='md' user={user} />
                <div className='text-white'>
                  <h3 key={user.id}>{user.name}</h3>
                  <span className='text-sm'>
                    {user.matches?.length} matches
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  )
}

export default Users
