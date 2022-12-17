import { Driver } from "neo4j-driver";
import { Dict } from "neo4j-driver-core/types/record";
import { MovieDbService } from "./movieDbService";
import { Movie } from "./__generated__/resolvers-types";

export interface Repository<T> {
  get<T>(id: string): Promise<T>
}

export class MovieRepo implements Repository<Movie> {
  constructor(
    private readonly driver: Driver,
    private readonly movieDbService: MovieDbService) {
  }

  async get<Movie>(id: string): Promise<Movie| null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:MOVIE) WHERE m.id = $id RETURN m', {
      id, 
    })

    session.close()
      .then(() => { })
      .catch(console.error)

    return this.mapTo<Movie>(res.records[0].toObject(), 'm') ?? null
  }
  // CREATE CONSTRAINT FOR (m:MOVIE) REQUIRE m.id IS UNIQUE;

  async upsert(movie: Movie): Promise<Movie> {
    const session = this.driver.session()
    const res = await session.run(`MERGE (m:MOVIE {
          id: $id
      })
      ${this.builtSetQuery(movie, 'm')}
      RETURN m`,
      { ...movie }
    )
    session.close()

    return this.mapTo<Movie>(res.records[0].toObject(), 'm')
  }

  async search(query: string): Promise<Movie[]> {
    const movies = await this.movieDbService.search(query)
    movies.forEach((mov) => {
      this.upsert(mov)
        .catch(console.error)
    })

    return movies
  }
  
  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .map(([key,_]) => `SET ${entryKey}.${key} = $${key}`).join('\n')

  }

  private mapTo<T>(record: Dict<PropertyKey, any> | null, key: string): T | null {
    if(record == null) {
      return null
    }
    return {
      ...record[key].properties
    }
  }

}