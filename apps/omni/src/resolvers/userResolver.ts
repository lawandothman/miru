import type { ResolversTypes, UserResolvers } from '../__generated__/resolvers-types'


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
    return 'REDACTED' as unknown as ResolversTypes['String']
  },
  watchlist: async (parent, _, { watchlistLoader }) => {
    return watchlistLoader.load(parent.id)
  },
  isBot: (parent) => {
    return !!parent.isBot as unknown as ResolversTypes['Boolean']
  },
}

export default UserResolver
