import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { gql, NetworkStatus, useQuery } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'
import { useState } from 'react'
import { PAGE_LIMIT } from 'config/constants'

const GET_POPULAR_MOVIES = gql`
  query PopularMovies($offset: Int, $limit: Int) {
    popularMovies(offset: $offset, limit: $limit) {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const PopularMovies: NextPage = () => {
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const {
    data,
    networkStatus,
    fetchMore,
    variables = { offset: 0, limit: PAGE_LIMIT },
  } = useQuery<{ popularMovies: Movie[] }, { limit: number; offset: number }>(
    GET_POPULAR_MOVIES,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        offset: 0,
        limit: PAGE_LIMIT,
      },
    }
  )

  if (networkStatus === NetworkStatus.loading) {
    return (
      <main>
        <PageHeader title='Popular' />
        <LoadingSkeleton />
      </main>
    )
  }

  if (data) {
    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage = data.popularMovies.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.popularMovies.length,
          },
        }).then((res) => setFullyLoaded(!res.data.popularMovies.length))
      }
    }

    return (
      <main>
        <PageHeader title='Popular' subtitle='The top of Miru' />
        <MoviesList loadMore={loadMore} movies={data?.popularMovies} />
      </main>
    )
  }

  return null
}

export default PopularMovies
