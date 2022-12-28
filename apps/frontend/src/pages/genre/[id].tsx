import { gql, useQuery } from '@apollo/client'
import { MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Genre } from '__generated__/resolvers-types'
import type { Movie } from '__generated__/resolvers-types'
import { FullPageLoader } from 'components/FullPageLoader'

const GET_BY_GENRE = gql`
  query MoviesByGenre($genreId: ID!) {
    moviesByGenre(genreId: $genreId) {
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
  const { data, loading } = useQuery<
  { moviesByGenre: Movie[]; genre: Genre },
  { genreId?: string }
  >(GET_BY_GENRE, {
    variables: {
      genreId,
    },
  })

  if (loading) {
    return <FullPageLoader />
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title={data?.genre.name ?? ''} />
      <MoviesList movies={data?.moviesByGenre} />
    </div>
  )
}

export default Genre
