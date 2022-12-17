import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { Movie, Resolvers } from './__generated__/resolvers-types';
import neo4j from 'neo4j-driver'
import { MovieRepo } from './movieRepo';
import { MovieDbService } from './movieDbService';

const schema = (readFileSync('./schema.graphql')).toString()

export interface Context {
  movieRepo: MovieRepo
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
};

const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic('', '')
)

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

async function main() {

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => {
      const context: Context = {
        movieRepo: new MovieRepo(driver, new MovieDbService())
      }
      return context
    }
  });

  console.log(`🚀  Server ready at: ${url}`);
}

main()