import { requireUser } from "../utils";
import { MutationResolvers } from "../__generated__/resolvers-types";

const MutationResolver: MutationResolvers = {
  addMovieToWatchlist: async (_parent, { movieId }, { movieRepo, user }) => {
    const u = requireUser(user)
    return await movieRepo.addToWatchlist(movieId, u)
  },
  removeMovieFromWatchlist: async (
    _parent,
    { movieId },
    { movieRepo, user }
  ) => {
    const u = requireUser(user)
    return await movieRepo.removeFromWatchlist(movieId, u)
  },
  follow: async (_parent, { friendId }, { neoDataSource, user }) => {
    const u = requireUser(user)
    return await neoDataSource.follow(u, friendId)
  },
  unfollow: async (_parent, { friendId }, { neoDataSource, user }) => {
    const u = requireUser(user)
    return await neoDataSource.unfollow(u, friendId)
  },

}

export default MutationResolver