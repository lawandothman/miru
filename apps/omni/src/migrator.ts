import type { Driver, Session } from 'neo4j-driver'
import { readdirSync, readFileSync } from 'fs'
import { logger } from './utils/logger'

export class Migrator {
  constructor(private readonly driver: Driver) {}

  async up(): Promise<void> {
    logger.info('Running migrations')

    const session = this.driver.session()

    try {
      const migrations = readdirSync('./migrations')
      logger.info(`Migrations found: ${migrations.join(', ')}`)

      for (const migration of migrations) {
        const alreadyApplied = await this.hasAppliedMigration(session, migration)
        if (alreadyApplied) {
          logger.info(`${migration}- has already been applied, skipping`)
          continue
        }

        const cql = readFileSync(`./migrations/${migration}`, 'utf8')
        const statements = cql
          .split(';')
          .map(statement => statement.trim())
          .filter((statement) => statement)
        logger.info(`Applying migration: ${migration}`)
        await this.applyMigration(session, statements)
        await this.persistMigration(session, migration)
        logger.info(`${migration} applied successfully`)
      }
      logger.info('All migrations complete')

    } catch(e) {
      logger.error(e, 'Error running migrations')
      throw e
    } finally {
      await session.close()
    }
  }

  private async applyMigration(session: Session, statements: string[]): Promise<void> {
    const tx = session.beginTransaction()
    try {
      for (const statement of statements) {
        logger.info(`Running statement: ${statement}`)
        await tx.run(statement)
      }
      await tx.commit()
    } catch (e) {
      await tx.rollback()
      logger.error(e, 'Failed to apply migration, transaction rolled back')
      throw e
    }
  }


  private async persistMigration(session: Session, id: string): Promise<void> {
    try {
      await session.run('CREATE (m:Migration {id: $id})', { id })
    } catch (e) {
      logger.error(e, `Failed to persist migration for record ${id}`)
      throw e
    }
  }

  private async hasAppliedMigration(session: Session, id: string): Promise<boolean> {
    try {
      const res = await session.run('MATCh (m:Migration {id: $id}) RETURN m', {
        id,
      })
      return res.records.length > 0

    } catch (e) {
      logger.error(e, `Failed to check migration record for ${id}`)
      throw e
    }
  }
}
