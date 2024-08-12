import type { Driver } from 'neo4j-driver'

export async function runMany<T>(
  driver: Driver,
  query: string,
  args: any,
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
  args: any,
  key: string
): Promise<T | null> {
  const session = driver.session()
  const res = await session.run(query, args)
  session.close().catch(console.error)

  return res.records[0]?.toObject()[key] as T
}

export function mapTo<T>(
  record: Record<string, any>| null,
  key: string
): T | null {
  if (record == null) {
    return null
  }
  return {
    ...record[key].properties,
  }
}

export interface WriteRepository<T> {
  upsert(obj: T): Promise<T | null>;
}
