import neo4j, { type Driver, type Session, type ManagedTransaction } from 'neo4j-driver'
import type { Movie, Genre, User } from '../__generated__/resolvers-types'
import type { WriteRepository } from './utils'
import { mapTo } from './utils'
import { createLogger } from '../utils/logger'

const logger = createLogger({ service: 'MovieRepo' })

// We will slowly deprecate this for reading of data
export class MovieRepo implements WriteRepository<Movie> {
  constructor(private readonly driver: Driver) {}

  private async runSession<T>(fn: (session: Session)=> Promise<T>): Promise<T> {
    const session = this.driver.session()
    try {
      return await fn(session)
    } catch (error) {
      logger.error('Error during Neo4j session:', error)
      throw error
    } finally {
      await session.close();
    }
  }

  async get(id: string): Promise<Movie | null> {
    return this.runSession(async (session) => {
      const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
        id,
      })
      return mapTo<Movie>(res.records[0].toObject(), 'm') ?? null
    })
  }

  private async upsertGenres(tx: ManagedTransaction, movie: Movie): Promise<void> {
    await Promise.all(
      movie.genres?.map((genre) =>
        tx.run(
          `MATCH (m:Movie {id: $movieId}), (g:Genre {id: $genreId})
          MERGE (m)-[r:IS_A]->(g)
          RETURN m, r, g`,
          { movieId: movie.id, genreId: genre?.id.toString() }
        )
      ) ?? []
    )
  }

  async upsert(movie: Movie): Promise<Movie | null> {
    return this.runSession(async (session) => {
      const res = await session.executeWrite(async (tx) => {
        const res = await tx.run(
          `MERGE (m:Movie { id: $id })
          ${this.buildSetQuery(movie, 'm')}
          RETURN m`,
          { ...movie }
        )
        await this.upsertGenres(tx, movie)
        return res
    })
      return mapTo<Movie>(res.records[0].toObject(), 'm')
    })
  }

  async getMoviesByGenre(
    genreId: string,
    offset: number,
    limit: number
  ): Promise<Movie[]> {
    return this.runSession(async (session) => {
      const res = await session.run(
        `MATCH (m:Movie)-[r:IS_A]->(g:Genre {id: $id})
         WHERE m.tmdbVoteCount > 0
         RETURN m
         ORDER BY m.tmdbVoteCount DESC
         SKIP $offset LIMIT $limit`,
        { id: genreId, offset: neo4j.int(offset), limit: neo4j.int(limit) }
      )
      return res.records.map((record) =>
        mapTo<Movie>(record.toObject(), 'm')
      ) as Movie[]

    })
  }

  async getGenres(movie: Movie): Promise<Genre[]> {
    return this.runSession(async (session) => {
      const res = await session.run(
        `MATCH (m:Movie {id: $id})-[r:IS_A]->(g:Genre)
         RETURN g`,
         { id: movie.id }
      )
      return res.records.map((record) => mapTo<Genre>(record.toObject(), 'g')) as Genre[]
    })
  }

  async search(query: string, offset: number, limit: number): Promise<Movie[]> {
    return this.runSession(async (session) => {
      const res = await session.run(
        `MATCH (m:Movie)
         WHERE toLower(m.title) CONTAINS toLower($query)
         RETURN m SKIP $offset LIMIT $limit`,
        { query, offset: neo4j.int(offset), limit: neo4j.int(limit) }
      )
      return res.records.map((record) => mapTo<Movie>(record.toObject(), 'm')) as Movie[]
    })
  }

  async addToWatchlist(movieId: string, user: User): Promise<Movie> {
    return this.runSession(async (session) => {
      const res = await session.run(
        `MATCH (u:User {email: $email}), (m:Movie {id: $id})
         MERGE (u)<-[r:IN_WATCHLIST]-(m)
         RETURN m`,
        { email: user.email, id: movieId }
      )
      return mapTo<Movie>(res.records[0]?.toObject(), 'm') as Movie
    })
  }

  async removeFromWatchlist(movieId: string, user: User): Promise<Movie> {
    return this.runSession(async (session) => {
      const res = await session.run(
        `MATCH (u:User {email: $email})<-[r:IN_WATCHLIST]-(m:Movie {id: $id})
         DELETE r
         RETURN m`,
        { email: user.email, id: movieId }
      )
      return mapTo<Movie>(res.records[0]?.toObject(), 'm') as Movie
    })
  }

  private buildSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => value != null && !Array.isArray(value))
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`)
      .join('\n')
  }
}
