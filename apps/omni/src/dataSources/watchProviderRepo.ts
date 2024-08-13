import type { Driver } from 'neo4j-driver'
import type { WatchProvider } from '../__generated__/resolvers-types'
import type { WriteRepository } from './utils'
import { mapTo, runOnce } from './utils'

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

    return mapTo<WatchProvider>(res.records[0], 'w')
  }

  async upsertStream(watchProviderId: string, movieId: string) {
    return runOnce<{ id: string }>(
      this.driver,
      `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:STREAMS_FROM]->(w)
      SET r.updatedAt = dateTime()
      RETURN m{.id}`,
      { movieId, watchProviderId },
      'm'
    )
  }

  async upsertBuy(watchProviderId: string, movieId: string) {
    return runOnce<{ id: string }>(
      this.driver,
      `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:BUYS_FROM]->(w)
      SET r.updatedAt = dateTime()
      RETURN m{.id}`,
      { movieId, watchProviderId },
      'm'
    )
  }

  async upsertRent(watchProviderId: string, movieId: string) {
    return runOnce<{ id: string }>(
      this.driver,
      `
      MATCH (m:Movie {id: $movieId}), (w:WatchProvider {id: $watchProviderId})
      MERGE (m)-[r:RENTS_FROM]->(w)
      SET r.updatedAt = dateTime()
      RETURN m{.id}`,
      { movieId, watchProviderId },
      'm'
    )
  }

  private builtSetQuery<T extends object>(obj: Partial<T>, entryKey: string): string {
    return Object.entries(obj)
      .filter(([_, value]) => value != null)
      .map(([key, _]) => `SET ${entryKey}.${key} = $${key}`)
      .join('\n')
  }
}
