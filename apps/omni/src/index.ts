import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { readFileSync } from 'fs'
import { verify } from 'jsonwebtoken'
import type { Genre, Movie, Resolvers, User, WatchProvider } from './__generated__/resolvers-types'
import neo4j from 'neo4j-driver'
import { MovieDbService } from './services/movieDbService'
import { SyncService } from './services/syncService'
import { Migrator } from './migrator'
import DataLoader from 'dataloader'
import { config } from './config'
import { NeoDataSource } from './dataSources/neoDataSource'
import { GenreRepo } from './dataSources/genreRepo'
import { WatchProviderRepo } from './dataSources/watchProviderRepo'
import { MovieRepo } from './dataSources/movieRepo'
import TracingPlugin from './TracingPlugin'
import UserResolver from './resolvers/userResolver'
import MovieResolver from './resolvers/movieResolver'
import MutationResolver from './resolvers/mutationResolver'
import QueryResolver from './resolvers/queryResolver'
import { BotManager } from './bots/botManager'
import { logger } from './utils/logger'

const schema = readFileSync('./schema.graphql').toString()

export interface Context {
  movieRepo: MovieRepo
  genreRepo: GenreRepo
  movieLoader: DataLoader<string, Movie>
  userLoader: DataLoader<string, User>
  matchesLoader: DataLoader<string, Movie[]>
  watchlistLoader: DataLoader<string, Movie[]>
  movieMatchesLoader: DataLoader<string, User[]>
  followerLoader: DataLoader<string, User[]>
  followingLoader: DataLoader<string, User[]>
  streamLoader: DataLoader<string, WatchProvider[]>
  buyLoader: DataLoader<string, WatchProvider[]>
  rentLoader: DataLoader<string, WatchProvider[]>
  genreLoader: DataLoader<string, Genre>
  neoDataSource: NeoDataSource
  user: User | null
}

const resolvers: Resolvers = {
  Query: QueryResolver,
  Mutation: MutationResolver,
  Movie: MovieResolver,
  User: UserResolver,
}

const { host, user, pass } = config.neo4j
const driver = neo4j.driver(host, neo4j.auth.basic(user, pass))

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  plugins: [
    new TracingPlugin()
  ]
})

const movieDbService = new MovieDbService()

const syncService = new SyncService(
  new MovieRepo(driver),
  new GenreRepo(driver),
  new WatchProviderRepo(driver),
  movieDbService
)

const migrator = new Migrator(driver)
const botManager = new BotManager(driver)

async function main() {
  try {
    await migrator.up()
    await botManager.up()
  } catch(e) {
    logger.error('Failed to start DB tasks. Exiting', e)
    process.exit(1)
  }

  syncService.start().catch(console.error)

  const port = +(process.env?.PORT ?? '4000')
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const neo = new NeoDataSource(driver)
      const user = getUser(req.headers.authorization?.toString())
      const context: Context = {
        movieRepo: new MovieRepo(driver),
        genreRepo: new GenreRepo(driver),
        movieLoader: new DataLoader(neo.getMovies.bind(neo)),
        userLoader: new DataLoader(neo.getUsers(user).bind(neo)),
        matchesLoader: new DataLoader(neo.getMatchesWith(user).bind(neo)),
        watchlistLoader: new DataLoader(neo.getWatchlists.bind(neo)),
        movieMatchesLoader: new DataLoader(neo.getMovieMatches(user).bind(neo)),
        followerLoader: new DataLoader(neo.getFollowers(user).bind(neo)),
        followingLoader: new DataLoader(neo.getFollowing(user).bind(neo)),
        streamLoader: new DataLoader(neo.getStreamProviders.bind(neo)),
        buyLoader: new DataLoader(neo.getBuyProviders.bind(neo)),
        rentLoader: new DataLoader(neo.getRentProviders.bind(neo)),
        genreLoader: new DataLoader(neo.getGenresByIds.bind(neo)),
        neoDataSource: neo,
        user,
      }
      return context
    },
  })

  logger.info(`🚀  Server ready at: ${url}`)
}

function getUser(authHeader: string | undefined): User | null {
  if (authHeader == null) {
    return null
  }

  const [, token] = authHeader.split(' ')

  try {
    return verify(token, process.env.OMNI_SECRET as string) as unknown as User
  } catch (e) {
    return null
  }
}

main()
