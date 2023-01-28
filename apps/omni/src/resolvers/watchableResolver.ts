import type {
  WatchableResolvers,
} from '../__generated__/resolvers-types'

const watchableResolvers: WatchableResolvers = {
  __resolveType: (_parent) => {
    return 'Movie'
  },
  genres: async (parent, _, { movieRepo }) => {
    return await movieRepo.getGenres(parent)
  },

  matches: async (parent, _, { user, movieMatchesLoader }) => {
    if (user == null) {
      return []
    }
    return movieMatchesLoader.load(parent.id)
  },
}

export default watchableResolvers