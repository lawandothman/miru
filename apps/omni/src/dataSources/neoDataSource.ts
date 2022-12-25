import { groupBy } from 'lodash'
import type { Driver } from 'neo4j-driver'
import type { Dict } from 'neo4j-driver-core/types/record'
import type { Genre, Movie, User } from '../__generated__/resolvers-types'

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
      .catch(console.error)

    return res.records.map(rec => mapTo<Movie>(rec.toObject(), 'm')) as Movie[] ?? []
  }

  async getUsers(ids: readonly string[]): Promise<User[]> {
    return await runAndMapMany<User>(
      this.driver,
      'MATCH (u:User) WHERE u.id in $ids RETURN u',
      { ids },
      'u'
    )
  }

  getMatchesWith = (me: User | null) => async (ids: readonly string[]): Promise<Movie[][]> => {
    if(me == null) {
      return []
    }

    console.log(ids)
    console.log(me.email)

    const res = await runMany<Movie & { friendId: string }>(
      this.driver,
      `MATCH (f:User)<-[r1:IN_WATCHLIST]-(m:Movie)-[r2]->(me:User {email: $myEmail})
      WHERE f.id IN $ids
      RETURN m{
          .overview,
          .posterUrl,
          .releaseDate,
          .backdropUrl,
          .originalTitle,
          .id,
          .popularity,
          .title,
          .adult,
          friendId: f.id
      }`, {ids, myEmail: me.email},
      'm'
    )
    const groupedByUser = groupBy(res, (a) => a.friendId)

    return ids.map((id) => {
      return groupedByUser[id] ?? []
    })
  }

  async searchUsers(query: string): Promise<User[]> {
    return await runAndMapMany<User>(
      this.driver,
      'MATCH (u:User) WHERE toLower(u.name) CONTAINS toLower($query) RETURN u LIMIT 20',
      { query },
      'u'
    )
  }

  async getGenres(): Promise<Genre[]> {
    const session = this.driver.session()
    const res = await session.run('MATCH (g:Genre) RETURN g')
    session.close()
      .catch(console.error)

    return res.records.map(rec => mapTo<Genre>(rec.toObject(), 'g')) as Genre[] ?? []
  }

  async isMovieInWatchlist(movieId: string, user: User): Promise<boolean> {
    const rel = await runAndMap<object>(
      this.driver,
      `MATCH (m:Movie {id: $movieId})-[r:IN_WATCHLIST]->(u:User {email: $email})
      RETURN r`,
      {movieId, email:user.email}, 'r')
    return rel != null
  }

  async getWatchlist(user: User) {
    const movies = await runAndMapMany<Movie>(
      this.driver,
      `MATCH (m:Movie)-[r:IN_WATCHLIST]->(u:User {email: $email})
      RETURN m`,
      {email:user.email}, 'm')

    return movies
  }
}

async function runMany<T>(driver: Driver, query: string, args: any, key: string): Promise<T[]> {
    const session = driver.session()
    const res = await session.run(query, args)
    session.close().catch(console.error)

    return res.records.map(rec => rec.toObject()[key]) as T[] ?? []
}

async function runAndMapMany<T>(driver: Driver, query: string, args: any, key: string): Promise<T[]> {
    const session = driver.session()
    const res = await session.run(query, args)
    session.close().catch(console.error)

    return res.records.map(rec => mapTo<T>(rec.toObject(), key)) as T[] ?? []
}

async function runAndMap<T>(driver: Driver, query: string, args: any, key: string): Promise<T | null> {
    const session = driver.session()
    const res = await session.run(query, args)
    session.close().catch(console.error)

    return mapTo<T>(res.records[0]?.toObject() ?? null, key)
}

function mapTo<T>(record: Dict<PropertyKey, any> | null, key: string): T | null {
  if (record == null) {
    return null
  }
  return {
    ...record[key].properties
  }
}

// We will slowly deprecate this for reading of data 
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

  async addToWatchlist(movieId: string, user: User): Promise<Movie> {
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (u:User {email: $email}), (m:Movie {id: $id})
      MERGE (u)<-[r:IN_WATCHLIST]-(m)
      RETURN m
    `, { email: user.email, id: movieId })
    session.close()

    return mapTo<Movie>(res.records[0].toObject(), 'm') as Movie
  }

  async removeFromWatchlist(movieId: string, user: User): Promise<Movie> {
    const session = this.driver.session()
    const res = await session.run(`
      MATCH (u:User {email: $email})<-[r:IN_WATCHLIST]-(m:Movie {id: $id})
      DELETE r
      RETURN m
    `, { email: user.email, id: movieId })
    session.close()

    return mapTo<Movie>(res.records[0].toObject(), 'm') as Movie
  }

  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => !Array.isArray(value))
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`).join('\n')
  }

}