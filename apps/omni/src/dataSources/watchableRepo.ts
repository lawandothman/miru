import type { Driver } from 'neo4j-driver-core'
import neo4j from 'neo4j-driver'
import type { Movie, Genre, User, Watchable} from '../__generated__/resolvers-types'
import { WatchableType } from '../__generated__/resolvers-types'
import type { WriteRepository } from './utils'
import { mapTo } from './utils'

// We will slowly deprecate this for reading of data
export class WatchableRepo implements WriteRepository<Watchable> {
  constructor(private readonly driver: Driver) {}

  async get(id: string): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
      id,
    })

    session.close().catch(console.error)

    return mapTo<Watchable>(res.records[0].toObject(), 'm') ?? null
  }

  async upsert(watchable: Watchable): Promise<Watchable | null> {
    const session = this.driver.session()
    const res = await session.executeWrite(async (tx) => {
      const label = watchable.type === WatchableType.Movie ? 'Movie' : 'Series'
      const res = await tx.run(
        `merge (m:Watchable:${label} {
            id: $id
        })
        ${this.builtSetQuery(watchable, 'm')}
        return m`,
        { ...watchable }
      )
      await Promise.all(
        watchable.genres?.map((genre) => {
          return tx.run(
            `
          MATCH (m:Watchable:${label} {id: $movieId}), (g:Genre {id: $genreId})
          MERGE (m)-[r:IS_A]->(g)
          RETURN m,r,g`,
            { movieId: watchable.id, genreId: genre && genre.id.toString() }
          )
        }) ?? []
      )

      return res
    })

    return mapTo<Watchable>(res.records[0].toObject(), 'm')
  }

  async getMoviesByGenre(
    genreId: string,
    offset: number,
    limit: number
  ): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(
      // TODO: continue expanding this
      `
      MATCH (m:Watchable)-[r:IS_A]->(g:Genre {id: $id})
      WHERE m.tmdbVoteCount > 0
      RETURN m
      ORDER BY m.tmdbVoteCount DESC
      SKIP $offset
      LIMIT $limit
    `,
      { id: genreId, offset: neo4j.int(offset), limit: neo4j.int(limit) }
    )

    return res.records.map((record) =>
      mapTo<Movie>(record.toObject(), 'm')
    ) as Movie[]
  }

  async getGenres(movie: Watchable): Promise<Genre[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Watchable {id: $id})-[r:IS_A]->(g:Genre)
      RETURN g
    `,
      { id: movie.id }
    )

    return res.records.map((record) =>
      mapTo<Genre>(record.toObject(), 'g')
    ) as Genre[]
  }

  async search(query: string, offset: number, limit: number): Promise<Watchable[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Watchable) WHERE
      toLower(m.title) CONTAINS toLower($query)
      RETURN m SKIP $offset LIMIT $limit
    `,
      { query, limit: neo4j.int(limit), offset: neo4j.int(offset) }
    )

    session.close()
    return res.records.map((record) =>
      mapTo<Watchable>(record.toObject(), 'm')
    ) as Watchable[]
  }

  async addMovieToWatchlist(movieId: string, user: User): Promise<Movie> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (u:User {email: $email}), (m:Movie {id: $id})
      MERGE (u)<-[r:IN_WATCHLIST]-(m)
      RETURN m
    `,
      { email: user.email, id: movieId }
    )
    session.close()

    return mapTo<Movie>(res.records[0].toObject(), 'm') as Movie
  }

  async removeMovieFromWatchlist(movieId: string, user: User): Promise<Movie> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (u:User {email: $email})<-[r:IN_WATCHLIST]-(m:Movie {id: $id})
      DELETE r
      RETURN m
    `,
      { email: user.email, id: movieId }
    )
    session.close()

    return mapTo<Movie>(res.records[0].toObject(), 'm') as Movie
  }

  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => !Array.isArray(value))
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`)
      .join('\n')
  }
}
