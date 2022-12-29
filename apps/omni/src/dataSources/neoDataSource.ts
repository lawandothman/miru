import { groupBy } from 'lodash'
import type { Driver} from 'neo4j-driver'
import { int } from 'neo4j-driver'
import type { Genre, Movie, User, WatchProvider } from '../__generated__/resolvers-types'
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

  async getMoviesForYou(user: User, offset: number, limit: number): Promise<Movie[]> {
    const email = user.email
    return await runAndMapMany<Movie>(this.driver, `
      MATCH (u:User {email: $email})-[:FOLLOWS]->(f:User)<-[:IN_WATCHLIST]-(m:Movie)
      RETURN m, count(*) as friendWatchlistRank
      ORDER BY friendWatchlistRank DESC
      SKIP $offset
      LIMIT $limit`,
    {email, offset: int(offset), limit: int(limit)},
    'm'
    )
  }

  async getPopularMovies(offset:number, limit: number): Promise<Movie[]> {
    return await runAndMapMany<Movie>(this.driver, `
      MATCH (m:Movie)-[:IN_WATCHLIST]->(u:User)
      RETURN m, count(u) as watchlists
      ORDER BY watchlists DESC
      SKIP $offset
      LIMIT $limit`,
    {offset: int(offset), limit: int(limit)},
    'm'
    )
  }

  async getGenresByIds(ids: readonly string[]): Promise<Genre[]> {
    return await runMany<Genre>(this.driver, `
      MATCH (g:Genre)
      WHERE g.id IN $ids
      RETURN g{
        .id,
        .name
      }
    `, {ids}, 'g')
  }

  async getStreamProviders(movieIds: readonly string[]): Promise<WatchProvider[][]> {
    const providers = await runMany<WatchProvider&{movieId:string}>(this.driver, `
      MATCH (w: WatchProvider)<-[r:STREAMS_FROM]-(m:Movie)
      WHERE m.id IN $movieIds
      RETURN w{
        .id,
        .displayPriority,
        .name,
        .logoPath,
        movieId: m.id
      }`, {movieIds} , 'w')
    const groupedByMovie = groupBy(providers, (p) => p.movieId)
    return movieIds.map(id => groupedByMovie[id])
  }

  async getBuyProviders(movieIds: readonly string[]): Promise<WatchProvider[][]> {
    const providers = await runMany<WatchProvider&{movieId:string}>(this.driver, `
      MATCH (w: WatchProvider)<-[r:BUYS_FROM]-(m:Movie)
      WHERE m.id IN $movieIds
      RETURN w{
        .id,
        .displayPriority,
        .name,
        .logoPath,
        movieId: m.id
      }`, {movieIds} , 'w')
    const groupedByMovie = groupBy(providers, (p) => p.movieId)
    return movieIds.map(id => groupedByMovie[id])
  }

  async getRentProviders(movieIds: readonly string[]): Promise<WatchProvider[][]> {
    const providers = await runMany<WatchProvider&{movieId:string}>(this.driver, `
      MATCH (w: WatchProvider)<-[r:RENTS_FROM]-(m:Movie)
      WHERE m.id IN $movieIds
      RETURN w{
        .id,
        .displayPriority,
        .name,
        .logoPath,
        movieId: m.id
      }`, {movieIds} , 'w')
    const groupedByMovie = groupBy(providers, (p) => p.movieId)
    return movieIds.map(id => groupedByMovie[id])
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

  getMovieMatches = (user: User | null) => async (movieIds: readonly string[]) => {
    const email = user?.email ?? ''
    const matches = await runMany<User&{movieId:string}>(
      this.driver,
      `MATCH (m:Movie)-[r1:IN_WATCHLIST]->(f:User)<-[r2:FOLLOWS]-(u:User {email: $email})
      WHERE m.id IN $movieIds
      RETURN f{
        .id,
        .email,
        .image,
        .name,
        isFollower: exists((f)-[:FOLLOWS]->(:User {email: $email})),
        isFollowing: exists((f)<-[:FOLLOWS]-(:User {email: $email})),
        movieId: m.id
      }`,
      { movieIds, email},
      'f'
    )
    const groupedByMovieId = groupBy(matches, (a) => a.movieId)
    return movieIds.map(id => groupedByMovieId[id] ?? [])
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

  async getWatchlist(user: User, offset: number, limit: number) {
    const movies = await runAndMapMany<Movie>(
      this.driver,
      `MATCH (m:Movie)-[r:IN_WATCHLIST]->(u:User {email: $email})
      RETURN m
      SKIP $offset
      LIMIT $limit`,
      { email: user.email, offset: int(offset), limit: int(limit) },
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

  async getWatchProviders(ids: readonly string[]): Promise<WatchProvider[]> {
    return await runMany<WatchProvider>(this.driver, 
      `MATCH (w:WatchProvider) WHERE w.id IN $ids RETURN
      w{
        .id,
        .displayPriority,
        .name,
        .logoPath
      }`, 
      { ids },
      'w',
    )
  }
}