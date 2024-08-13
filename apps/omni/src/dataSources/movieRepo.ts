import neo4j, { type Driver } from 'neo4j-driver'
import type { Movie, Genre, User } from '../__generated__/resolvers-types'
import { runOnce, type WriteRepository } from './utils'
import { mapTo } from './utils'

// We will slowly deprecate this for reading of data
export class MovieRepo implements WriteRepository<Movie> {
  constructor(private readonly driver: Driver) {}

  async get(id: string): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
      id,
    })

    session.close().catch(console.error)

    return mapTo<Movie>(res.records[0], 'm') ?? null
  }

  async upsert(movie: Movie): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.executeWrite(async (tx) => {
      const res = await tx.run(
        `merge (m:Movie {
            id: $id
        })
        ${this.builtSetQuery(movie, 'm')}
        return m`,
        { ...movie }
      )
      await Promise.all(
        movie.genres?.map((genre) => {
          return tx.run(
            `
          MATCH (m:Movie {id: $movieId}), (g:Genre {id: $genreId})
          MERGE (m)-[r:IS_A]->(g)
          RETURN m,r,g`,
            { movieId: movie.id, genreId: genre && genre.id.toString() }
          )
        }) ?? []
      )

      return res
    })

    return mapTo<Movie>(res.records[0], 'm')
  }

  getMoviesByGenre = (user: User | null) => async (genreId: string, offset: number, limit: number) => {
    const email = user?.email ?? ''
    const session = this.driver.session()
    try {
      const res = await session.run(
        `
        MATCH (m:Movie)-[r:IS_A]->(g:Genre {id: $id})
        WHERE m.tmdbVoteCount > 0
        RETURN m{
          id: m.id,
          title: m.title,
          posterUrl: m.posterUrl,
          inWatchlist: exists((m)-[:IN_WATCHLIST]->(:User {email: $email}))
        }
        ORDER BY m.tmdbVoteCount DESC
        SKIP $offset
        LIMIT $limit
      `,
        { id: genreId, offset: neo4j.int(offset), limit: neo4j.int(limit), email }
      )
      return res.records.map((record) => record.toObject().m)
    } finally {
      await session.close()
    }
  }


  async getGenres(movie: Movie): Promise<Genre[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Movie {id: $id})-[r:IS_A]->(g:Genre)
      RETURN g
    `,
      { id: movie.id }
    )

    return res.records.map((record) =>
      mapTo<Genre>(record, 'g')
    ) as Genre[]
  }

  async search(query: string, offset: number, limit: number): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Movie) WHERE
      toLower(m.title) CONTAINS toLower($query)
      RETURN m SKIP $offset LIMIT $limit
    `,
      { query, limit: neo4j.int(limit), offset: neo4j.int(offset) }
    )

    session.close()
    return res.records.map((record) =>
      mapTo<Movie>(record, 'm')
    ) as Movie[]
  }

  async addToWatchlist(movieId: string, user: User): Promise<Movie> {
    const movie = await runOnce<Movie>(this.driver, `
      MATCH (u:User {email: $email}), (m:Movie {id: $id})
      MERGE (u)<-[r:IN_WATCHLIST]-(m)
        RETURN m{
          .*,
          inWatchlist: exists((m)-[:IN_WATCHLIST]->(u))
        }
      `, { email: user.email, id: movieId }, 'm'
    )

    return movie!
  }

  async removeFromWatchlist(movieId: string, user: User): Promise<Movie> {
    const movie = await runOnce<Movie>(this.driver, `
        MATCH (u:User {email: $email})<-[r:IN_WATCHLIST]-(m:Movie {id: $id})
        DELETE r
        RETURN m{
          .*,
          inWatchlist: exists((m)-[:IN_WATCHLIST]->(u))
        }
      `, { email: user.email, id: movieId }, 'm'
    )

    return movie!
  }

  private builtSetQuery<T extends object>(obj: Partial<T>, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => !Array.isArray(value))
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`)
      .join('\n')
  }
}
