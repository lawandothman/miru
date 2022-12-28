import { LoadingSkeleton, MoviesList } from 'components/MoviesList'
import { PageHeader } from 'components/PageHeader'
import type { NextPage } from 'next'
import { useQuery, gql } from '@apollo/client'
import type { Movie } from '__generated__/resolvers-types'

const GET_FOR_YOU = gql`
  query ForYou {
    moviesForYou {
      id
      title
      posterUrl
      inWatchlist
    }
  }
`

const ForYou: NextPage = () => {
  const { data, loading } = useQuery<{ moviesForYou: Movie[] }>(GET_FOR_YOU)

  return (
    <div className='px-20 pt-20'>
      <PageHeader title='For you' />
      {loading ? <LoadingSkeleton /> : <MoviesList movies={data?.moviesForYou} />}
    </div>
  )
}

export default ForYou
