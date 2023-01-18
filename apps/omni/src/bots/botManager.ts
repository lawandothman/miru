import type { Driver } from 'neo4j-driver'
import type { Movie, User } from '../__generated__/resolvers-types'
import { runMany } from '../dataSources/utils'

interface Bot extends User {
  isBot: true
  movieIds: string[]
}

function createBot(id: string, name: string, image: string | null, movieIds: string[]): Bot {
  return {
    id,
    email: `${id}@miru.space`,
    name,
    image,
    isBot: true,
    movieIds
  }

}


const bots: Bot[] = [
  createBot('avengers-guy', 'Avengers guy', null, [
    '299536',
    '24428',
    '299534',
    '99861',
    '634649',
    '315635',
    '284054',
    '102899',
    '44912',
    '1726',
    '271110'
  ]),
  createBot('classics', 'I like the classics', null, [
    '770',
    '278',
    '597',
    '238',
    '185',
    '103',
    '1366',
    '630',
    '252',
    '947'
  ]),
  createBot('a24-guy', 'Indie man', null, [
    '798286',
    '376867',
    '493922',
    '530385',
    '264660',
    '558582',
    '615643',
    '503919',
    '429200',
    '141',
    '103',
    '152601',
    '502033',
    '641',
    '185'
  ]),
]

export class BotManager {
  constructor(private readonly driver: Driver) {}

  async up(): Promise<void> {
    console.log('Syncing bots')

    console.log(`Upserting ${bots.length} bots`)

    await Promise.all(bots.map((bot) => this.upsertBotUser(bot)))
  }

  private async upsertBotUser(bot: Bot): Promise<void> {
    const session = this.driver.session()
    await session.run(`
      MERGE (bot:User:Bot {id: $id})
      SET bot.email = $email
      SET bot.image = $image
      SET bot.name = $name
      SET bot.isBot = $isBot
      RETURN bot{ .* }
    `, {
      ...bot
    })
    this.upsertWatchlistItem(bot)
    console.log(`Upserted ${bot.id}`)
  }

  private async upsertWatchlistItem(bot: Bot) {
    const movies = await runMany<Movie>(this.driver, `
      MATCH (bot:User:Bot {id: $id}), (mov: Movie)
      WHERE mov.id IN $movieIds
      MERGE (mov)-[:IN_WATCHLIST]->(bot)
      RETURN mov{ .* }
    `, { ...bot }, 'mov')
    console.log(`${bot.id} movies upserted ${movies.length}`)
  }

}
