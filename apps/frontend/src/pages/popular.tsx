import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { gql, useQuery } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'

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
  const { data, loading, fetchMore } = useQuery<
  { popularMovies: Movie[] },
  { limit?: number; offset?: number }
  >(GET_POPULAR_MOVIES)

  const loadMore = async () => {
    const currentLength = data?.popularMovies.length ?? 20
    console.log('calling next')
    await fetchMore({
      variables: {
        limit: currentLength,
        offset: currentLength * 2,
      },
    })
  }

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='Popular' subtitle='The top of Miru' />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <MoviesList loadMore={loadMore} movies={data?.popularMovies} />
      )}
    </div>
  )
}

export default PopularMovies
