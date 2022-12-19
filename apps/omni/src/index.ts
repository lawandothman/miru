import dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import type { Movie, Resolvers } from './__generated__/resolvers-types';
import neo4j from 'neo4j-driver'
import { MovieRepo, NeoDataSource } from './repositories/movieRepo';
import { MovieDbService } from './services/movieDbService';
import { SyncService } from './services/syncService';
import { Migrator } from './migrator';
import { GenreRepo } from './repositories/genreRepo';
import DataLoader from 'dataloader';

dotenv.config()

const schema = (readFileSync('./schema.graphql')).toString()

export interface Context {
  movieRepo: MovieRepo
  genreRepo: GenreRepo
  movieLoader: DataLoader<string, Movie>
}

const resolvers: Resolvers = {
  Query: {
    movie: async (_parent, { id }, { movieLoader }) => {
      return await movieLoader.load(id)
    },
    search: async (_parent, { query }, { movieRepo }) => {
      return await movieRepo.search(query)
    },
    moviesByGenre: async (_parent, { genreId }, { movieRepo }) => {
      return await movieRepo.getMoviesByGenre(genreId)
    }
  },
  Movie: {
    genres: async (parent, _, { movieRepo }) => {
      return await movieRepo.getGenres(parent)
    }
  },
};

const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('', '')
)

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const movieDbService = new MovieDbService()

const syncService = new SyncService(
  new MovieRepo(driver),
  new GenreRepo(driver),
  movieDbService
)

const migrator = new Migrator(driver)

async function main() {
  await migrator.up()

  syncService.start()
    .catch(console.error)

  const port = +(process.env?.PORT ?? "4000")
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async () => {
      const neo = new NeoDataSource(driver)
      const context: Context = {
        movieRepo: new MovieRepo(driver),
        genreRepo: new GenreRepo(driver),
        movieLoader: new DataLoader(neo.getMovies.bind(neo))
      }
      return context
    }
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main()