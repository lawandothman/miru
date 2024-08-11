import type { Driver } from 'neo4j-driver'
import { readdirSync, readFileSync } from 'fs'
import { logger } from './utils/logger'

export class Migrator {
  constructor(private readonly driver: Driver) {}

  async up(): Promise<void> {
    logger.info('Running migrations')
    const migrations = readdirSync('./migrations')
    logger.info('Migrations found:', migrations)
    for (const migration of migrations) {
      if (await this.hasAppliedMigration(migration)) {
        logger.info(`${migration}- has already been applied, skipping`)
        continue
      }
      const cql = readFileSync(`./migrations/${migration}`).toString()
      const statements = cql
        .replaceAll('\n', ' ')
        .split(';')
        .filter((string) => string != '')
      logger.info(`${migration}- Applying`)
      await this.driver.session().executeWrite((tx) => {
        statements.forEach(async (statement) => {
          logger.info(`${migration}- Running statement: ${statement}`)
          await tx.run(statement)
        })
      })
      await this.persistMigration(migration)
    }
    logger.info('Migrations complete')

    return
  }

  private async persistMigration(id: string): Promise<void> {
    const session = this.driver.session()
    await session.run('CREATE (m:Migration {id: $id})', { id })
  }

  private async hasAppliedMigration(id: string): Promise<boolean> {
    const session = this.driver.session()
    const res = await session.run('MATCh (m:Migration {id: $id}) RETURN m', {
      id,
    })
    return res.records.length > 0
  }
}
