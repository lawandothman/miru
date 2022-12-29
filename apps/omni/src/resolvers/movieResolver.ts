import { requireUser } from "../utils"
import { MovieResolvers } from "../__generated__/resolvers-types"

const MovieResolver: MovieResolvers = {
  genres: async (parent, _, { movieRepo }) => {
    return await movieRepo.getGenres(parent)
  },
  inWatchlist: async (parent, _, { user, neoDataSource }) => {
    if (user == null) {
      return false
    }
    // ⚠️ No data loader code, this is subject to N+1
    return await neoDataSource.isMovieInWatchlist(
      parent.id,
      requireUser(user)
    )
  },
  matches: async (parent, _, { user, movieMatchesLoader }) => {
    if (user == null) {
      return []
    }
    return movieMatchesLoader.load(parent.id)
  },
  streamProviders: async (parent, _, { streamLoader }) => streamLoader.load(parent.id),
  buyProviders: async (parent, _, { buyLoader }) => buyLoader.load(parent.id),
  rentProviders: async (parent, _, { rentLoader }) => rentLoader.load(parent.id)

}

export default MovieResolver