import { Driver } from "neo4j-driver";
import { Dict } from "neo4j-driver-core/types/record";
import { MovieDbService } from "../services/movieDbService";
import { Genre, Movie } from "../__generated__/resolvers-types";

export interface Repository<T> {
  get(id: string): Promise<T | null>
  upsert(obj: T): Promise<T | null>
}

export class NeoDataSource {
  constructor(private readonly driver: Driver) {}

  async getMovies(ids: readonly string[]): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id in $ids RETURN m', {
      ids,
    })

    session.close()
      .then(() => { })
      .catch(console.error)

    return res.records.map(rec => mapTo<Movie>(rec.toObject(), 'm')) as Movie[] ?? []
  }

}

function mapTo<T>(record: Dict<PropertyKey, any> | null, key: string): T | null {
  if (record == null) {
    return null
  }
  return {
    ...record[key].properties
  }
}

export class MovieRepo implements Repository<Movie> {
  constructor(
    private readonly driver: Driver) {
  }

  async get(id: string): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
      id,
    })

    session.close()
      .then(() => { })
      .catch(console.error)

    return mapTo<Movie>(res.records[0].toObject(), 'm') ?? null
  }
  // CREATE CONSTRAINT FOR (m:Movie) REQUIRE m.id IS UNIQUE;

  async upsert(movie: Movie): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.executeWrite(async (tx) => {
      const res = await tx.run(`merge (m:Movie {
            id: $id
        })
        ${this.builtSetQuery(movie, 'm')}
        return m`,
        { ...movie }
      )
      await Promise.all(movie.genres?.map((genre) => {
        return tx.run(`
          MATCH (m:Movie {id: $movieId}), (g:Genre {id: $genreId}) 
          MERGE (m)-[r:IS_A]->(g) 
          RETURN m,r,g`,
          { movieId: movie.id, genreId: genre!.id })
      }) ?? [])

      return res
    })

    return mapTo<Movie>(res.records[0].toObject(), 'm')
  }

  async getMoviesByGenre(genreId: string): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (m:Movie)-[r:IS_A]->(g:Genre {id: $id})
      RETURN m LIMIT 20
    `, { id: genreId })

    return res.records.map(record => mapTo<Movie>(record.toObject(), 'm')) as Movie[]
  }

  async getGenres(movie: Movie): Promise<Genre[]> {
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (m:Movie {id: $id})-[r:IS_A]->(g:Genre)
      RETURN g
    `, { id: movie.id })

    return res.records.map(record => mapTo<Genre>(record.toObject(), 'g')) as Genre[]
  }

  async search(query: string): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (m:Movie) WHERE 
      toLower(m.title) CONTAINS toLower($query) 
      RETURN m LIMIT 20
    `, { query })

    session.close()
    return res.records.map((record) => mapTo<Movie>(record.toObject(), 'm')) as Movie[]

  }

  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => !Array.isArray(value))
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`).join('\n')
  }

}