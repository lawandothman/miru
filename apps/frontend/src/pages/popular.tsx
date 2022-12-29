import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { gql, useQuery } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'

const GET_POPULAR_MOVIES = gql`
  query PopularMovies {
    popularMovies {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const PopularMovies: NextPage = () => {
  const { data, loading } = useQuery<{ popularMovies: Movie[] }>(GET_POPULAR_MOVIES)

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Popular' subtitle='The top of Miru' />
      {loading ? <LoadingSkeleton /> : <MoviesList movies={data?.popularMovies} />}
    </div>
  )
}

export default PopularMovies
