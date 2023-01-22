import type { Driver } from 'neo4j-driver'
import type { Movie, User } from '../__generated__/resolvers-types'
import { difference } from 'lodash'
import { runMany, runOnce } from '../dataSources/utils'

interface Bot extends User {
  isBot: true;
  movieIds: string[];
}

function createBot(
  id: string,
  name: string,
  image: string | null,
  movieIds: string[]
): Bot {
  return {
    id,
    email: `${id}@miru.space`,
    name,
    image,
    isBot: true,
    movieIds,
  }
}

const bots: Bot[] = [
  createBot('superhero-guy', 'Superhero Sam', null, [
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
    '271110',
  ]),
  createBot('classics', 'Classic Claire', null, [
    '770',
    '278',
    '597',
    '238',
    '185',
    '103',
    '1366',
    '630',
    '252',
    '947',
  ]),
  createBot('indie-connoisseur', 'Indie Ian', null, [
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
    '185',
  ]),
  createBot('pixar-pete', 'Pixar Pete', null, [
    '862',
    '863',
    '301528',
    '10193',
    '9487',
    '585',
    '62211',
    '12',
    '920',
    '260514',
    '49013',
    '14160',
    '150540',
  ]),
  createBot('romcom-ron', 'RomCom Rebecca', null, [
    '41630',
    '18240',
    '9767',
    '37735',
    '38408',
    '24438',
    '13477',
    '4964',
    '2959',
  ]),
  createBot('soundtrack-sarah', 'Soundtrack Sarah', null, [
    '238',
    '475557',
    '103',
    '641',
    '22',
    '98',
  ]),
]

export class BotManager {
  constructor(private readonly driver: Driver) {}

  async up(): Promise<void> {
    console.log('Syncing bots')

    const existingBotIds = await this.getAllBotIds()
    const botsToBeDeleted = difference(
      existingBotIds,
      bots.map((b) => b.id)
    )
    console.log(`Bots to be deleted: ${botsToBeDeleted}`)
    await Promise.all(
      botsToBeDeleted.map((botId) => this.deleteBotUser(botId))
    )

    console.log(`Upserting ${bots.length} bots`)

    await Promise.all(bots.map((bot) => this.upsertBotUser(bot)))
  }

  private async deleteBotUser(botId: string): Promise<void> {
    await void runOnce<void>(
      this.driver,
      `
      MATCH (bot:User:Bot {id: $id})
      DETACH DELETE bot
    `,
      { id: botId },
      'bot'
    )
    console.log(`Bot: ${botId} deleted`)
  }

  private async upsertBotUser(bot: Bot): Promise<void> {
    void runOnce<Bot>(
      this.driver,
      `
      MERGE (bot:User:Bot {id: $id})
      SET bot.email = $email
      SET bot.image = $image
      SET bot.name = $name
      SET bot.isBot = $isBot
      RETURN bot{ .* }
    `,
      { ...bot },
      'bot'
    )
    this.upsertWatchlistItem(bot)
    console.log(`Bot: ${bot.id} upserted`)
  }

  private async upsertWatchlistItem(bot: Bot) {
    // Clearing old relationships before upserting
    void (await runMany<void>(
      this.driver,
      `
      MATCH (bot:User:Bot {id: $id})-[r:IN_WATCHLIST]-(mov: Movie)
      DELETE r
    `,
      { ...bot },
      'mov'
    ))

    const movies = await runMany<Movie>(
      this.driver,
      `
      MATCH (bot:User:Bot {id: $id}), (mov: Movie)
      WHERE mov.id IN $movieIds
      MERGE (mov)-[:IN_WATCHLIST]->(bot)
      RETURN mov{ .* }
    `,
      { ...bot },
      'mov'
    )
    console.log(`Bot: ${bot.id} upserted ${movies.length} movies`)
  }

  private async getAllBotIds(): Promise<string[]> {
    const botIds = await runMany<{ id: string }>(
      this.driver,
      `
      MATCH (bot:User:Bot) RETURN bot{.id}
    `,
      {},
      'bot'
    )
    return botIds.map((a) => a.id)
  }
}
