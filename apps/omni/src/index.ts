import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import { verify } from "jsonwebtoken";
import type { Movie, Resolvers } from "./__generated__/resolvers-types";
import neo4j from "neo4j-driver";
import { MovieRepo, NeoDataSource } from "./repositories/movieRepo";
import { MovieDbService } from "./services/movieDbService";
import { SyncService } from "./services/syncService";
import { Migrator } from "./migrator";
import { GenreRepo } from "./repositories/genreRepo";
import DataLoader from "dataloader";
import { requireUser } from "./utils";
import { config } from './config'


const schema = readFileSync("./schema.graphql").toString();

export interface Context {
  movieRepo: MovieRepo;
  genreRepo: GenreRepo;
  movieLoader: DataLoader<string, Movie>;
  neoDataSource: NeoDataSource;
  user: User | null;
}

const resolvers: Resolvers = {
  Query: {
    movie: async (_parent, { id }, { movieLoader }) => {
      return await movieLoader.load(id);
    },
    search: async (_parent, { query }, { movieRepo }) => {
      return await movieRepo.search(query);
    },
    moviesByGenre: async (_parent, { genreId }, { movieRepo }) => {
      return await movieRepo.getMoviesByGenre(genreId);
    },
    genres: async (_parent, _args, { neoDataSource }) => {
      return await neoDataSource.getGenres();
    },
    watchlist: async (_parent, _args, { neoDataSource, user }) => {
      return await neoDataSource.getWatchlist(requireUser(user));
    },
  },
  Mutation: {
    addMovieToWatchlist: async (_parent, { movieId }, { movieRepo, user }) => {
      const u = requireUser(user);
      return await movieRepo.addToWatchlist(movieId, u);
    },
    removeMovieFromWatchlist: async (
      _parent,
      { movieId },
      { movieRepo, user }
    ) => {
      const u = requireUser(user);
      return await movieRepo.removeFromWatchlist(movieId, u);
    },
  },
  Movie: {
    genres: async (parent, _, { movieRepo }) => {
      return await movieRepo.getGenres(parent);
    },
    inWatchlist: async (parent, _, { user, neoDataSource }) => {
      if(user == null) {
        return false
      }
      // ⚠️ No data loader code, this is subject to N+1
      return await neoDataSource.isMovieInWatchlist(
        parent.id,
        requireUser(user)
      );
    },
  },
};

const { host, user, pass } = config.neo4j
const driver = neo4j.driver(host, neo4j.auth.basic(user, pass));

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const movieDbService = new MovieDbService();

const syncService = new SyncService(
  new MovieRepo(driver),
  new GenreRepo(driver),
  movieDbService
);

const migrator = new Migrator(driver);

async function main() {
  await migrator.up();

  syncService.start().catch(console.error);

  const port = +(process.env?.PORT ?? "4000");
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      const neo = new NeoDataSource(driver);
      const context: Context = {
        movieRepo: new MovieRepo(driver),
        genreRepo: new GenreRepo(driver),
        movieLoader: new DataLoader(neo.getMovies.bind(neo)),
        neoDataSource: neo,
        user: getUser(req.headers.authorization?.toString()),
      };
      return context;
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

export interface User {
  email: string;
}

function getUser(authHeader: string | undefined): User | null {
  if (authHeader == null) {
    return null;
  }

  const [, token] = authHeader.split(" ");
  console.log(token);

  try {
    return verify(
      token,
      process.env.OMNI_SECRET as string
    ) as unknown as User;
  } catch (e) {
    console.error(e);
    return null;
  }
}

main();
