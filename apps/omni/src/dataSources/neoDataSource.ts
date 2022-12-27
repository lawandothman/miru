import { groupBy } from 'lodash'
import type { Driver } from 'neo4j-driver'
import type { Genre, Movie, User } from '../__generated__/resolvers-types'
import { mapTo, runAndMap, runAndMapMany, runMany, runOnce } from './utils'

export interface Repository<T> {
  get(id: string): Promise<T | null>;
  upsert(obj: T): Promise<T | null>;
}

export class NeoDataSource {
  constructor(private readonly driver: Driver) {}

  async getMovies(ids: readonly string[]): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(
      'MATCH (m:Movie) WHERE m.id in $ids RETURN m',
      {
        ids,
      }
    )

    session.close().catch(console.error)

    return (
      (res.records.map((rec) =>
        mapTo<Movie>(rec.toObject(), 'm')
      ) as Movie[]) ?? []
    )
  }

  getUsers =
    (user: User | null) =>
    async (ids: readonly string[]): Promise<User[]> => {
      const email = user?.email ?? ''
      return await runMany<User>(
        this.driver,
        `MATCH (u:User) WHERE u.id in $ids
      RETURN u{
          .id,
          .email,
          .image,
          .name,
          isFollower: exists((u)-[:FOLLOWS]->(:User {email: $email})),
          isFollowing: exists((u)<-[:FOLLOWS]-(:User {email: $email}))
      }
      `,
        { ids, email },
        'u'
      )
    }

  getMatchesWith =
    (me: User | null) =>
    async (ids: readonly string[]): Promise<Movie[][]> => {
      if (me == null) {
        return []
      }

      console.log(ids)
      console.log(me.email)

      const res = await runMany<Movie & { friendId: string }>(
        this.driver,
        `MATCH (f:User)<-[r1:IN_WATCHLIST]-(m:Movie)-[r2:IN_WATCHLIST]->(me:User {email: $myEmail})
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
      }`,
        { ids, myEmail: me.email },
        'm'
      )
      const groupedByUser = groupBy(res, (a) => a.friendId)

      return ids.map((id) => {
        return groupedByUser[id] ?? []
      })
    }

  async searchUsers(query: string, user: User | null): Promise<User[]> {
    const email = user?.email ?? ''
    return await runMany<User>(
      this.driver,
      `MATCH (u:User) WHERE toLower(u.name) CONTAINS toLower($query)
      RETURN u{
          .id,
          .email,
          .image,
          .name,
          isFollower: exists((u)-[:FOLLOWS]->(:User {email: $email})),
          isFollowing: exists((u)<-[:FOLLOWS]-(:User {email: $email}))
      } LIMIT 20
      `,
      { query, email },
      'u'
    )
  }

  async getGenres(): Promise<Genre[]> {
    const session = this.driver.session()
    const res = await session.run('MATCH (g:Genre) RETURN g')
    session.close().catch(console.error)

    return (
      (res.records.map((rec) =>
        mapTo<Genre>(rec.toObject(), 'g')
      ) as Genre[]) ?? []
    )
  }

  async isMovieInWatchlist(movieId: string, user: User): Promise<boolean> {
    const rel = await runAndMap<object>(
      this.driver,
      `MATCH (m:Movie {id: $movieId})-[r:IN_WATCHLIST]->(u:User {email: $email})
      RETURN r`,
      { movieId, email: user.email },
      'r'
    )
    return rel != null
  }

  async getWatchlist(user: User) {
    const movies = await runAndMapMany<Movie>(
      this.driver,
      `MATCH (m:Movie)-[r:IN_WATCHLIST]->(u:User {email: $email})
      RETURN m`,
      { email: user.email },
      'm'
    )

    return movies
  }

  async follow(me: User, friendId: string): Promise<User | null> {
    return await runOnce<User>(
      this.driver,
      `
      MATCH (u:User {email: $email}), (f:User {id: $id})
      MERGE (u)-[r:FOLLOWS]->(f)
      RETURN f{
        .id,
        .email,
        .image,
        .name,
        isFollower: exists((f)-[:FOLLOWS]->(:User {email: $email})),
        isFollowing: exists((f)<-[:FOLLOWS]-(:User {email: $email})),
        followerId: u.id
      }`,
      { email: me.email, id: friendId },
      'f'
    )
  }

  async unfollow(me: User, friendId: string): Promise<User | null> {
    return await runOnce<User>(
      this.driver,
      `
      MATCH (u:User {email: $email})-[r:FOLLOWS]->(f:User {id: $id})
      DELETE r
      RETURN f{
        .id,
        .email,
        .image,
        .name,
        isFollower: exists((f)-[:FOLLOWS]->(:User {email: $email})),
        isFollowing: exists((f)<-[:FOLLOWS]-(:User {email: $email})),
        followerId: u.id
      }
      `,
      { email: me.email, id: friendId },
      'f'
    )
  }

  getFollowers =
    (user: User | null) =>
    async (userIds: readonly string[]): Promise<User[][]> => {
      const email = user?.email ?? ''
      const followers = await runMany<User & { followerId: string }>(
        this.driver,
        `MATCH (f:User)-[r:FOLLOWS]->(u:User)
      WHERE u.id IN $userIds
      RETURN f{
          .id,
          .email,
          .image,
          .name,
          isFollower: exists((f)-[:FOLLOWS]->(:User {email: $email})),
          isFollowing: exists((f)<-[:FOLLOWS]-(:User {email: $email})),
          followerId: u.id
      }`,
        { userIds, email },
        'f'
      )
      const groupedByFollowerId = groupBy(followers, (a) => a.followerId)

      return userIds.map((id) => {
        return groupedByFollowerId[id] ?? []
      })
    }

  getFollowing =
    (user: User | null) =>
    async (userIds: readonly string[]): Promise<User[][]> => {
      const email = user?.email ?? ''
      const followers = await runMany<User & { followingId: string }>(
        this.driver,
        `MATCH (f:User)<-[r:FOLLOWS]-(u:User)
      WHERE u.id IN $userIds
      RETURN f{
          .id,
          .email,
          .image,
          .name,
          isFollower: exists((f)-[:FOLLOWS]->(:User {email: $email})),
          isFollowing: exists((f)<-[:FOLLOWS]-(:User {email: $email})),
          followingId: u.id
      }`,
        { userIds, email },
        'f'
      )
      const groupedByFollowingId = groupBy(followers, (a) => a.followingId)

      return userIds.map((id) => {
        return groupedByFollowingId[id] ?? []
      })
    }

  async isFollowed(friendId: string, me: User | null): Promise<boolean> {
    const rel = await runAndMap<object>(
      this.driver,
      `MATCH (f:User {id: $friendId})<-[r:FOLLOWS]-(u:User {email: $email})
      RETURN r`,
      { friendId, email: me?.email },
      'r'
    )
    return rel != null
  }
}

// We will slowly deprecate this for reading of data
export class MovieRepo implements Repository<Movie> {
  constructor(private readonly driver: Driver) {}

  async get(id: string): Promise<Movie | null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (m:Movie) WHERE m.id = $id RETURN m', {
      id,
    })

    session.close().catch(console.error)

    return mapTo<Movie>(res.records[0].toObject(), 'm') ?? null
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
            { movieId: movie.id, genreId: genre!.id }
          )
        }) ?? []
      )

      return res
    })

    return mapTo<Movie>(res.records[0].toObject(), 'm')
  }

  async getMoviesByGenre(genreId: string): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Movie)-[r:IS_A]->(g:Genre {id: $id})
      RETURN m LIMIT 20
    `,
      { id: genreId }
    )

    return res.records.map((record) =>
      mapTo<Movie>(record.toObject(), 'm')
    ) as Movie[]
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
      mapTo<Genre>(record.toObject(), 'g')
    ) as Genre[]
  }

  async search(query: string): Promise<Movie[]> {
    const session = this.driver.session()
    const res = await session.run(
      `
      MATCH (m:Movie) WHERE
      toLower(m.title) CONTAINS toLower($query)
      RETURN m LIMIT 20
    `,
      { query }
    )

    session.close()
    return res.records.map((record) =>
      mapTo<Movie>(record.toObject(), 'm')
    ) as Movie[]
  }

  async addToWatchlist(movieId: string, user: User): Promise<Movie> {
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

  async removeFromWatchlist(movieId: string, user: User): Promise<Movie> {
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
