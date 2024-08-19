import { FullPageLoader } from 'components/AsyncState'
import { PageHeader } from 'components/PageHeader'
import type { GetServerSidePropsContext, NextPage } from 'next'
import { getSession, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import HomeCinemaDark from '../../public/illustration/dark/home_cinema.svg'
import HomeCinemaLight from '../../public/illustration/light/home_cinema.svg'
import React from 'react'
import { useTheme } from 'next-themes'
import { SIGN_IN_INDEX } from 'config/constants'
import { Popcorn, Search, UserPlus, type LucideIcon } from 'lucide-react'
import { Footer } from '@/components/footer'

const Home: NextPage = () => {
  const { status: sessionStatus } = useSession({ required: false })

  if (sessionStatus === 'loading') {
    return <FullPageLoader />
  }

  return (
    <main>
      <PageHeader
        title='Welcome to Miru'
        subtitle='The social movie watching platform'
      />
      <p>
        Remove the drama from movie night and find the movie that everyone wants
        to watch.
      </p>
      <p className='mb-8'>
        Get started by making an account and adding movies to your watchlist
      </p>
      <Illustration />

      <h2 className='mt-4 text-xl'>How it works?</h2>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        <Step
          Icon={UserPlus}
          text={'Find your friends'}
          description={
            'Follow your friends in Miru and we will recommend movies for you to watch together.'
          }
        />
        <Step
          Icon={Search}
          text={'Find your movies'}
          description={
            'Search for movies you want to watch, or just check your For you page for recommendations based on the people you follow.'
          }
        />
        <Step
          Icon={Popcorn}
          text={'Find your matches'}
          description={
            'Miru will match you and the people you follow to show what you should watch together'
          }
        />
      </div>

      <Link
        href={SIGN_IN_INDEX}
        className='mx-auto mt-12 block max-w-lg rounded-md bg-black px-2 py-4 text-center text-lg font-semibold  text-white dark:bg-white dark:text-black'
      >
        Login
      </Link>
      <Footer />
    </main>
  )
}

const Step = ({
  Icon,
  text,
  description,
}: {
  Icon: LucideIcon;
  text: string;
  description: string;
}) => {
  return (
    <div>
      <div className='flex w-full justify-center'>
        <div className='m-8 flex size-32 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black'>
          <Icon size={32} />
        </div>
      </div>
      <div className='w-full'>
        <p className='mb-4 text-center text-lg font-bold'>{text}</p>
        <p className='text-center'>{description}</p>
      </div>
    </div>
  )
}


const Illustration = () => {
  const { systemTheme } = useTheme()
  return (
    <Image
      className='mx-auto'
      src={systemTheme === 'dark' ? HomeCinemaDark : HomeCinemaLight}
      alt='Illustration'
      width={500}
    />
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default Home
