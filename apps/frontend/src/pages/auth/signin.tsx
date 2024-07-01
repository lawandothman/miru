import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import type { User } from '__generated__/resolvers-types'
import { ProfilePicture } from '@/components/ProfilePicture'
import { setCookie, getCookie } from 'cookies-next'
import { Button } from '@/components/ui/button'

const GET_INVITEE = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      id
      name
      image
    }
  }
`

const SignIn: NextPage<
InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  const router = useRouter()
  const [invitedBy, setInvitedBy] = useState(router.query.invitedBy as string)

  const { data } = useQuery<{ user: User }, { userId?: string }>(GET_INVITEE, {
    variables: {
      userId: invitedBy,
    },
    skip: !invitedBy,
  })

  useEffect(() => {
    const storedInvite = getCookie('invitedBy') as string
    if (storedInvite) {
      setInvitedBy(storedInvite)
    }
    if (invitedBy) {
      setCookie('invitedBy', invitedBy, {
        maxAge: 30 * 24 * 60 * 60,
      })
    }
  }, [invitedBy])

  return (
    <div className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-8'>
      {data && (
        <div className='flex flex-col items-center gap-4'>
          <ProfilePicture size='lg' user={data.user} />
          <h1>{data.user.name} has invited you to join Miru! </h1>
        </div>
      )}
      <h1 className='text-4xl'>Log in</h1>
      {providers &&
        Object.values(providers).map((provider) => (
          <Button
            onClick={() =>
              signIn(provider.id, {
                callbackUrl: router.query.callbackUrl as string,
              })
            }
            key={provider.name}
            className='flex w-72 items-center justify-center gap-4 rounded-lg bg-black px-4 py-8 text-white dark:bg-white dark:text-neutral-900 '
          >
            {provider.name === 'Facebook' ? (
              <FaFacebookF className='fill-white dark:fill-neutral-900' />
            ) : (
              <FcGoogle size={32}/>
            )}
            Continue with {provider.name}
          </Button>
        ))}

      <div className='max-w-md border-t-[0.1px] border-t-neutral-500 p-8 text-center text-xs text-neutral-500'>
        By clicking “Continue with Google” above, you acknowledge that
        you have read and understood, and agree to Miru&apos;s{' '}
        <Link className='underline' href='/terms-and-conditions'>
          Terms & Conditions
        </Link>{' '}
        and{' '}
        <Link className='underline' href='/privacy'>
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req } = context
  const session = await getSession({ req })

  if (session) {
    return {
      redirect: {
        destination: '/',
        statusCode: 302,
      },
    }
  }

  const providers = await getProviders()

  return {
    props: {
      providers,
    },
  }
}

export default SignIn
