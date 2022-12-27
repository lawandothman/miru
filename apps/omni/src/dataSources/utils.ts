import type { Driver } from 'neo4j-driver'
import type { Dict } from 'neo4j-driver-core/types/record'

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

/**
 * @deprecated use #runMany() instead
 * @param driver 
 * @param query 
 * @param args 
 * @param key 
 * @returns 
 */
export async function runAndMapMany<T>(
  driver: Driver,
  query: string,
  args: any,
  key: string
): Promise<T[]> {
  const session = driver.session()
  const res = await session.run(query, args)
  session.close().catch(console.error)

  return (res.records.map((rec) => mapTo<T>(rec.toObject(), key)) as T[]) ?? []
}
/**
 * @deprecated use #runOnce() instead
 * @param driver 
 * @param query 
 * @param args 
 * @param key 
 * @returns 
 */
export async function runAndMap<T>(
  driver: Driver,
  query: string,
  args: any,
  key: string
): Promise<T | null> {
  const session = driver.session()
  const res = await session.run(query, args)
  session.close().catch(console.error)

  return mapTo<T>(res.records[0]?.toObject() ?? null, key)
}

export function mapTo<T>(
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

export interface WriteRepository<T> {
  upsert(obj: T): Promise<T | null>;
}