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
    <main className='max-w-screen-2xl'>
      <PageHeader title={pageTitle} />
      <Illustration />
      <p className='mx-auto mt-4 max-w-2xl text-center text-xl'>
        It&apos;s a bit quiet here... Get the party started by connecting
        with friends or following Miru bots for top-notch movie recommendations!
      </p>

      <div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {botsData?.bots.map((bot) => (
          <Link
            href={`${USER_INDEX}/${bot.id}`}
            className='flex flex-col items-center rounded-lg border p-6 hover:bg-neutral-300 dark:border-neutral-600 hover:dark:bg-neutral-900'
            key={bot.id}
          >
            <ProfilePicture size='lg' user={bot} />
            <span className='mt-4 text-lg font-medium'>{bot.name}</span>
          </Link>
        ))}
      </div>
      <div className='mx-auto mt-8 flex max-w-md flex-col items-center space-y-4'>
        <Link className='w-full' href={EXPLORE_INDEX}>
          <Button className='w-full py-8 text-lg' >
            Search for your friends
          </Button>
        </Link>
        <Button className='w-full py-8 text-lg'  onClick={() => copy()}>
          {isCopied ? 'Invite Link Copied!' : 'Copy Invite Link'}
        </Button>
      </div>
    </main>
  )
}
