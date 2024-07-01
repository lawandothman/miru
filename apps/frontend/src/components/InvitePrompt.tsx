import { gql, useQuery } from '@apollo/client'
import { EXPLORE_INDEX, USER_INDEX } from 'config/constants'
import { useInviteLink } from 'hooks/useInviteLink'
import type { Session, User } from 'next-auth'
import Link from 'next/link'
import { ProfilePicture } from './ProfilePicture'
import { Button } from './ui/button'
import { PageHeader } from './PageHeader'

const GET_BOTS = gql`
  query getBots {
    bots {
      name
      image
      id
      matches {
        id
        title
        posterUrl
        inWatchlist
      }
    }
  }
`

export const InvitePrompt = ({
  Illustration,
  pageTitle,
  session,
}: {
  Illustration: () => JSX.Element;
  pageTitle: string;
  session: Session | null;
}) => {
  const { data: botsData } = useQuery<{ bots: User[] }>(GET_BOTS)
  const { copy, isCopied } = useInviteLink(session?.user)

  return (
    <main>
      <PageHeader title={pageTitle} />
      <Illustration />
      <p className='mx-auto mt-8 max-w-2xl text-center text-xl'>
        It&apos;s a bit quiet here... let&apos;s get the party started by finding
        your friends or following some Miru bots. They&apos;ve got some great
        movie recommendations that will have you adding to your watchlist in no
        time!
      </p>

      <div className='mt-8 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8'>
        {botsData?.bots.map((bot) => (
          <Link
            href={`${USER_INDEX}/${bot.id}`}
            className='flex w-full flex-col items-center justify-center gap-8 rounded-lg border border-neutral-300 p-8  hover:bg-neutral-300 dark:border-neutral-600 hover:dark:bg-neutral-900'
            key={bot.id}
          >
            <ProfilePicture size='lg' user={bot} />
            <span>{bot.name}</span>
          </Link>
        ))}
      </div>
      <div className='mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-4'>
        <Link className='block w-full' href={EXPLORE_INDEX}>
          <Button className='w-full py-8 text-base' >
            Search for your friends
          </Button>
        </Link>
        <Button className='w-full py-8 text-base'  onClick={() => copy()}>
          {isCopied ? 'Copied!' : 'Copy Invite Link'}
        </Button>
      </div>
    </main>
  )
}
