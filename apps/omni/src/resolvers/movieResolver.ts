import type { TrailerKeys } from '../services/movieDbService'
import { requireUser } from '../utils'
import type {
  Movie,
  MovieResolvers,
  Trailer,
} from '../__generated__/resolvers-types'

const MovieResolver: MovieResolvers = {
  inWatchlist: async (parent, _, { user, neoDataSource }) => {
    if (user == null) {
      return false
    }
    // ⚠️ No data loader code, this is subject to N+1
    return await neoDataSource.isMovieInWatchlist(parent.id, requireUser(user))
  },
  streamProviders: async (parent, _, { streamLoader }) =>
    streamLoader.load(parent.id),
  buyProviders: async (parent, _, { buyLoader }) => buyLoader.load(parent.id),
  rentProviders: async (parent, _, { rentLoader }) =>
    rentLoader.load(parent.id),
  trailer: (parent, _, _ctx) => {
    const movie: Movie & TrailerKeys = parent
    if (movie.trailerProvider == undefined) {
      return null
    }
    return {
      key: movie.trailerKey,
      provider: movie.trailerProvider,
    } as Trailer
  },
}

export default MovieResolver
