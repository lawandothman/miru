import type { Driver } from 'neo4j-driver'
import type { Dict } from 'neo4j-driver-core/types/record'
import type { Genre } from '../__generated__/resolvers-types'

export interface Repository<T> {
  get(id: string): Promise<T | null>;
  upsert(obj: T): Promise<T | null>;
}

// We will slowly deprecate this for loading of data
export class GenreRepo implements Repository<Genre> {
  constructor(private readonly driver: Driver) {}

  async get(id: string): Promise<Genre | null> {
    const session = this.driver.session()
    const res = await session.run('MATCH (g:Genre) WHERE g.id = $id RETURN g', {
      id,
    })

    session
      .close()
      .then(() => void 0)
      .catch(console.error)

    return this.mapTo<Genre>(res.records[0].toObject(), 'g') ?? null
  }

  async upsert(genre: Genre): Promise<Genre | null> {
    const session = this.driver.session()
    const res = await session.run(
      `MERGE (g:Genre {
          id: $id
      })
      ${this.builtSetQuery(genre, 'g')}
      RETURN g`,
      { ...genre }
    )
    session.close()

    return this.mapTo<Genre>(res.records[0].toObject(), 'g')
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
