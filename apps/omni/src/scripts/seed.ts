import env from 'env-var'
import { fill, findLastKey, times } from 'lodash'
import neo4j, { integer, Integer } from 'neo4j-driver'
import { config } from '../config'
import { runAndMap, runAndMapMany, runMany, runOnce } from '../dataSources/utils'
import { faker } from '@faker-js/faker'
import { User } from '../__generated__/resolvers-types'
import { MovieRepo } from '../dataSources/neoDataSource'

const scriptConfig = {
    userCount: env.get('USER_COUNT').default(10).asInt(),
    likes: env.get('LIKES').default(30).asInt(),
}

const { host, user, pass } = config.neo4j
const driver = neo4j.driver(host, neo4j.auth.basic(user, pass))

async function seed() {
    console.log(`Creating group of ${scriptConfig.userCount} test users`)
    const users: User[] = fill(Array(scriptConfig.userCount), null).map((): User => {
        const user: User = {
            id: faker.datatype.uuid(),
            email: faker.internet.email(),
            name: faker.name.fullName(),
            image: 'https://picsum.photos/50'
        } 
        return user
    })


    const moviesToLike = await runMany<{id: string, title: string}>(driver, `
        MATCH (m:Movie) RETURN m{.id, .title} LIMIT $limit`, { limit: neo4j.int(scriptConfig.likes) }, 'm'
    )
    console.log('Found movies', moviesToLike)

    for(const user of users) {
        const uObj = await runOnce<{ id: string, email: string, name: string }>(driver, `
        CREATE (u:User {
            id: $id,
            email: $email,
            name: $name,
            image: $image
        }) RETURN u{.id, .email, .name}`, {...user}, 'u')
        if(uObj == null) {
            throw new Error('Could not create user')
        }
        console.log(`u:(${uObj.name}) created`)


        const movieRepo = new MovieRepo(driver)

        for(const movie of moviesToLike) {
            await movieRepo.addToWatchlist(movie.id, uObj as User)
            // console.log(`(u:${uObj.id})<-(m${mov.id}) created`)
        }
    }

    driver.close()

}

seed()