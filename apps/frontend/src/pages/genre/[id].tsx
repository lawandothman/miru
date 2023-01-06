import { gql, NetworkStatus, useQuery } from '@apollo/client'
import { MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Genre } from '__generated__/resolvers-types'
import type { Movie } from '__generated__/resolvers-types'
import { FullPageLoader } from 'components/AsyncState'
import { useState } from 'react'
import { PAGE_LIMIT } from 'config/constants'

const GET_BY_GENRE = gql`
  query MoviesByGenre($genreId: ID!, $offset: Int, $limit: Int) {
    moviesByGenre(genreId: $genreId, offset: $offset, limit: $limit) {
      id
      title
      posterUrl
      inWatchlist
    }
    genre(genreId: $genreId) {
      name
    }
  }
`

const Genre: NextPage = () => {
  const { query } = useRouter()
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const genreId = Array.isArray(query.id) ? query.id[0] : query.id
  const {
    data,
    fetchMore,
    networkStatus,
    variables = { offset: 0, limit: PAGE_LIMIT },
  } = useQuery<
  { moviesByGenre: Movie[]; genre: Genre },
  { genreId?: string; offset: number; limit: number }
  >(GET_BY_GENRE, {
    variables: {
      genreId,
      offset: 0,
      limit: PAGE_LIMIT,
    },
    notifyOnNetworkStatusChange: true
  })

  if (networkStatus === NetworkStatus.loading) {
    return <FullPageLoader />
  }

  if (data) {
    const isFetchingMore = networkStatus === NetworkStatus.fetchMore
    const isFullPage = data.moviesByGenre.length % variables.limit === 0
    const loadMore = async () => {
      if (!isFetchingMore && isFullPage && !fullyLoaded) {
        await fetchMore({
          variables: {
            limit: PAGE_LIMIT,
            offset: data.moviesByGenre.length,
          },
        }).then((res) => setFullyLoaded(!res.data.moviesByGenre.length))
      }
    }
    return (
      <main>
        <PageHeader title={data.genre.name ?? ''} />
        <MoviesList loadMore={loadMore} movies={data.moviesByGenre} />
      </main>
    )
  }

  return null
}

export default Genre
