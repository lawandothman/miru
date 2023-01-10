import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { FaFacebookF, FaGoogle } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/router'

const SignIn: NextPage<
InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  const router = useRouter()
  return (
    <div className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-8'>
      <h1 className='text-4xl'>Log in</h1>
      {providers &&
        Object.values(providers).map((provider) => (
          <button
            onClick={() => signIn(provider.id ,{ callbackUrl: router.query.callbackUrl as string })}
            key={provider.name}
            className='flex w-72 items-center justify-center gap-4 rounded-lg bg-black p-4 text-white dark:bg-white dark:text-neutral-900 '
          >
            {provider.name === 'Facebook' ? (
              <FaFacebookF className='fill-white dark:fill-neutral-900' />
            ) : (
              <FaGoogle className='fill-white dark:fill-neutral-900' />
            )}
            Continue with {provider.name}
          </button>
        ))}

      <div className='w-md border-t-[0.1px] border-t-neutral-500 pt-8 text-center  text-sm text-neutral-500'>
        By clicking “Continue with Facebook/Google” above, you acknowledge that
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
