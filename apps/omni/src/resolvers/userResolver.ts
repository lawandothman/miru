import type { UserResolvers } from '../__generated__/resolvers-types'


const UserResolver: UserResolvers = {
  matches: async (parent, _, { matchesLoader }) => {
    return await matchesLoader.load(parent.id)
  },
  followers: async (parent, _, { followerLoader }) => {
    return await followerLoader.load(parent.id)
  },
  following: async (parent, _, { followingLoader }) => {
    return await followingLoader.load(parent.id)
  },
  email: () => {
    return 'REDACTED'
  }
}

export default UserResolver