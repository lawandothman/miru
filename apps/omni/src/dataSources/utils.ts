import type { Driver } from 'neo4j-driver'
import { logger } from '../utils/logger'

async function executeQuery<T>(
  driver: Driver,
  query: string,
  args: Record<string, any>,
  resultHandler: (records: any[]) => T
): Promise<T> {
  const session = driver.session()
  try {
    const res = await session.run(query, args)
    return resultHandler(res.records)
  } catch (error) {
    logger.error('Neo4j Query Execution Error:', error)
    throw error
  } finally {
    await session.close()
  }
}

export async function runMany<T>(
  driver: Driver,
  query: string,
  args: Record<string, any>,
  key: string
): Promise<T[]> {
  return executeQuery(driver, query, args, (records) => {
    return records.map(rec => rec.toObject()[key] as T)
  })
}

export async function runOnce<T>(
  driver: Driver,
  query: string,
  args: Record<string, any>,
  key: string
): Promise<T | null> {
  return executeQuery(driver, query, args, (records) => {
    return records.length > 0 ? (records[0].toObject()[key] as T) : null
  })
}

export function mapTo<T>(
  record: Record<string, any>| null,
  key: string
): T | null {
  return record ? (record[key].properties as T) : null
}

export interface WriteRepository<T> {
  upsert(obj: T): Promise<T | null>;
}
