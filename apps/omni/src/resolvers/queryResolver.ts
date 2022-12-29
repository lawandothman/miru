import { requireUser } from '../utils'
import type { QueryResolvers } from '../__generated__/resolvers-types'

const QueryResolver: QueryResolvers = {
  movie: async (_parent, { id }, { movieLoader }) => {
    return await movieLoader.load(id)
  },
  search: async (_parent, { query, offset, limit }, { movieRepo }) => {
    return await movieRepo.search(query, offset ?? 0, limit ?? 20)
  },
  user: async (_parent, { id }, { userLoader }) => {
    return await userLoader.load(id)
  },
  searchUsers: async (_parent, { nameQuery }, { neoDataSource, user }) => {
    return await neoDataSource.searchUsers(nameQuery, user)
  },
  moviesByGenre: async (_parent, { genreId, offset, limit }, { movieRepo }) => {
    return await movieRepo.getMoviesByGenre(genreId, offset ?? 0, limit ?? 20)
  },
  genres: async (_parent, _args, { neoDataSource }) => {
    return await neoDataSource.getGenres()
  },
  genre: async (_parent, { genreId }, { genreLoader }) => {
    return await genreLoader.load(genreId)
  },
  watchlist: async (_parent, { offset, limit }, { neoDataSource, user }) => {
    return await neoDataSource.getWatchlist(requireUser(user), offset ?? 0, limit ?? 20)
  },
  moviesForYou: async (_parent, { offset, limit }, { neoDataSource, user }) => {
    return await neoDataSource.getMoviesForYou(requireUser(user), offset ?? 0, limit ?? 20)
  },
  popularMovies: async (_parent, { offset, limit }, { neoDataSource }) => {
    return await neoDataSource.getPopularMovies(offset ?? 0, limit ?? 20)
  }
}

export default QueryResolver