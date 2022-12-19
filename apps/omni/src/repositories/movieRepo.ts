import { Driver } from "neo4j-driver";
import { Dict } from "neo4j-driver-core/types/record";
import { MovieDbService } from "../services/movieDbService";
import { Movie } from "../__generated__/resolvers-types";

export interface Repository<T> {
  get(id: string): Promise<T | null>
  upsert(obj: T): Promise<T | null>
}

export class MovieRepo implements Repository<Movie> {
  constructor(
    private readonly driver: Driver,
    private readonly movieDbService: MovieDbService) {
  }

  async get(id: string): Promise<Movie| null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
      id, 
    })

    session.close()
      .then(() => { })
      .catch(console.error)

    return this.mapTo<Movie>(res.records[0].toObject(), 'm') ?? null
  }
  // CREATE CONSTRAINT FOR (m:Movie) REQUIRE m.id IS UNIQUE;

  async upsert(movie: Movie): Promise<Movie|null> {
    const session = this.driver.session()
    const res = await session.run(`MERGE (m:Movie {
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
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (m:Movie) WHERE 
      toLower(m.title) CONTAINS toLower($query) 
      RETURN m LIMIT 20
    `, { query })

    session.close()
    return res.records.map((record) => this.mapTo<Movie>(record.toObject(), 'm')) as Movie[]

  }
  
  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_,value]) => value != null)
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