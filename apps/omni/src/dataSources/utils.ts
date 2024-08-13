import type { Driver, Record as Neo4jRecord } from 'neo4j-driver'

export async function runMany<T>(
  driver: Driver,
  query: string,
  args: Record<string, unknown>,
  key: string
): Promise<T[]> {
  const session = driver.session()
  const res = await session.run(query, args)
  session.close().catch(console.error)

  return (res.records.map((rec) => rec.toObject()[key]) as T[]) ?? []
}

export async function runOnce<T>(
  driver: Driver,
  query: string,
  args: Record<string, unknown>,
  key: string
): Promise<T | null> {
  const session = driver.session()
  const res = await session.run(query, args)
  session.close().catch(console.error)

  return res.records[0]?.toObject()[key] as T
}

export function mapTo<T>(
  record: Neo4jRecord | null,
  key: string
): T | null {
  if (record == null) {
    return null
  }
  const node = record.get(key)

  if (node && typeof node === 'object' && 'properties' in node) {
    return {
      ...node.properties,
    } as T
  }

  return null
}

export interface WriteRepository<T> {
  upsert(obj: T): Promise<T | null>;
}
