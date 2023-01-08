import { Page } from 'components/Page'
import { PageHeader } from 'components/PageHeader'
import { ABOUT_INDEX } from 'config/constants'
import type { NextPage } from 'next'
import Link from 'next/link'

const About: NextPage = () => {
  return (
    <Page name='About' index={ABOUT_INDEX}>
      <main className='mx-auto max-w-4xl'>
        <PageHeader title='Welcome to Miru!' subtitle='' />
        <div className=' mx-auto flex flex-col gap-8'>
          <p>
            Miru is a platform that helps you and your friends find movies to
            watch together. We know that one of the best parts of watching
            movies is sharing the experience with others, and Miru makes it easy
            to find the perfect film for your group.
          </p>
          <p>
            Miru is designed to help you and your friends find the perfect movie
            to watch together. One way we do this is by comparing your
            watchlists and identifying common movies that you both want to see.
            This can be especially helpful if you and your friends have
            different tastes in movies, as it allows you to find a film that you
            can both agree on.
          </p>
          <p>
            To use this feature, simply add Movies that you want to see to your
            watchlist and invite your friends to do the same. Miru will then
            analyze your lists and suggest movies that both of you have added.
          </p>
          <p>
            So why wait? Start using Miru today and never watch a movie alone
            again!
          </p>
        </div>
        <h1 className='mb-4 mt-8 text-2xl font-thin tracking-widest'>
          Acknowledgments
        </h1>
        <div className=' mx-auto flex flex-col gap-8'>
          <p>
            This product uses the{' '}
            <Link
              href='https://www.themoviedb.org/'
              className='underline dark:text-white dark:no-underline'
            >
              TMDB API
            </Link>{' '}
            (The Movie Database API) but is not endorsed or certified by TMDb.
            TMDb is a popular movie database that provides a wealth of
            information on films, including plot summaries, cast and crew lists,
            and more. We utilize their API to provide movie recommendations and
            information to our users, but we are not affiliated with TMDb in any
            official capacity.
          </p>
          <p>
            We offer a variety of options for finding films that fit your
            preferences and interests, including information on where you can
            stream, rent, or buy a movie. This data comes from{' '}
            <Link
              href='https://www.justwatch.com/'
              className='underline dark:text-white dark:no-underline'
            >
              JustWatch
            </Link>
            , a leading platform for finding the best way to watch movies and TV
            shows online. Currently, the information provided by JustWatch is
            specific to the UK, but we plan to expand to other regions in the
            future.
          </p>
        </div>
      </main>
    </Page>
  )
}

export default About
