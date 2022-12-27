import type { Driver} from 'neo4j-driver'
import type { Dict } from 'neo4j-driver-core/types/record'
import type { WatchProvider } from '../__generated__/resolvers-types'
import type { WriteRepository } from './utils'
import { runOnce } from './utils'

export class WatchProviderRepo implements WriteRepository<WatchProvider> {
  constructor(private readonly driver: Driver) {}

  async upsert(watchProvider: WatchProvider): Promise<WatchProvider | null> {
    const session = this.driver.session()
    const res = await session.run(
      `MERGE (w:WatchProvider {
          id: $id
      })
      ${this.builtSetQuery(watchProvider, 'w')}
      RETURN w`,
      { ...watchProvider }
    )
    session.close()

    return this.mapTo<WatchProvider>(res.records[0].toObject(), 'w')
  }

  async upsertStream(watchProviderId: string, movieId: string) {
    return runOnce<{id: string}>(this.driver, `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:STREAMS_FROM {updatedAt: datetime()}]->(w)
      RETURN m{.id}`, {movieId, watchProviderId}, 'm')
  }
  
  async upsertBuy(watchProviderId: string, movieId: string) {
    return runOnce<{id: string}>(this.driver, `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:BUYS_FROM {updatedAt: datetime()}]->(w)
      RETURN m{.id}`, {movieId, watchProviderId}, 'm')
  }

  async upsertRent(watchProviderId: string, movieId: string) {
    return runOnce<{id: string}>(this.driver, `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:RENTS_FROM {updatedAt: datetime()}]->(w)
      RETURN m{.id}`, {movieId, watchProviderId}, 'm')
  }

  private builtSetQuery(obj: any, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`)
      .join('\n')
  }

  private mapTo<T>(
    record: Dict<PropertyKey, any> | null,
    key: string
  ): T | null {
    if (record == null) {
      return null
    }
    return {
      ...record[key].properties,
    }
  }
}
