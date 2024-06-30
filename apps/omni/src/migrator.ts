import type { Driver } from 'neo4j-driver'
import { readdirSync, readFileSync } from 'fs'

export class Migrator {
  constructor(private readonly driver: Driver) {}

  async up(): Promise<void> {
    console.log('Starting migrations')
    const migrations = readdirSync('./migrations')
    console.log(`Found ${migrations.length} migrations`)
    for (const migration of migrations) {
      if (await this.hasAppliedMigration(migration)) {
        console.log(migration, '- has already been applied, skipping')
        continue
      }
      const cql = readFileSync(`./migrations/${migration}`).toString()
      const statements = cql
        .replaceAll('\n', ' ')
        .split(';')
        .filter((string) => string != '')
      console.log(migration, '- Applying')
      await this.driver.session().executeWrite((tx) => {
        console.log(statements)
        statements.forEach(async (statement) => {
          console.log('Running - ', statement)
          await tx.run(statement)
        })
      })
      await this.persistMigration(migration)
    }

    console.log('Migrations finished')
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
