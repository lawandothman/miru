import { gql, useQuery } from '@apollo/client'
import { MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Genre } from '__generated__/resolvers-types'
import type { Movie } from '__generated__/resolvers-types'
import { FullPageLoader } from 'components/FullPageLoader'

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
  const genreId = Array.isArray(query.id) ? query.id[0] : query.id
  const { data, loading, fetchMore } = useQuery<
  { moviesByGenre: Movie[]; genre: Genre },
  { genreId?: string; offset?: number; limit?: number }
  >(GET_BY_GENRE, {
    variables: {
      genreId,
    },
  })


  const loadMore = async () => {
    const currentLength = data?.moviesByGenre.length ?? 20
    console.log('next')
    await fetchMore({
      variables: {
        limit: 20,
        offset: currentLength * 2,
      },
    })
  }

  if (loading) {
    return <FullPageLoader />
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title={data?.genre.name ?? ''} />
      <MoviesList loadMore={loadMore} movies={data?.moviesByGenre} />
    </div>
  )
}

export default Genre
