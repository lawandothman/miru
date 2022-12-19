import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { Genre, Movie, Resolvers } from './__generated__/resolvers-types';
import neo4j from 'neo4j-driver'
import { MovieRepo } from './repositories/movieRepo';
import { MovieDbService } from './services/movieDbService';
import { SyncService } from './services/syncService';
import { Migrator } from './migrator';
import { GenreRepo } from './repositories/genreRepo';

const schema = (readFileSync('./schema.graphql')).toString()

export interface Context {
  movieRepo: MovieRepo
  genreRepo: GenreRepo
}

const resolvers: Resolvers = {
  Query: {
    movie: async (_parent, { id }, { movieRepo }) => {
      return await movieRepo.get(id)
    },
    search: async (_parent, { query }, { movieRepo }) => {
      return await movieRepo.search(query)
    },
  },
  Movie: {
    genres: async (parent, _, { movieRepo }) => {
      return await movieRepo.getGenres(parent)
    }
  },
  Genre: { 
    movies: async (parent, _, { movieRepo }) => {
      return await movieRepo.getMoviesByGenre(parent)
    }
  }
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
  new MovieRepo(driver, movieDbService),
  new GenreRepo(driver),
  movieDbService
)

const migrator = new Migrator(driver)

async function main() {
  await migrator.up()

  syncService.start()
    .catch(console.error)

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => {
      const context: Context = {
        movieRepo: new MovieRepo(driver, movieDbService),
        genreRepo: new GenreRepo(driver)
      }
      return context
    }
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main()