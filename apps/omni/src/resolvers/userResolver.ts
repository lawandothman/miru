import type { UserResolvers } from '../__generated__/resolvers-types'


const UserResolver: UserResolvers = {
  matches: async (parent, _, { matchesLoader }) => {
    const res = await matchesLoader.load(parent.id)
    return res
  },
  followers: async (parent, _, { followerLoader }) => {
    return await followerLoader.load(parent.id)
  },
  following: async (parent, _, { followingLoader }) => {
    return await followingLoader.load(parent.id)
  },
  email: () => {
    return 'REDACTED'
  },
  watchlist: async (parent, _, { watchlistLoader }) => {
    return watchlistLoader.load(parent.id)
  },
  isBot: async (parent) => {
    return !!parent.isBot
  },
}

export default UserResolver
