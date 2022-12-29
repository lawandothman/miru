import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { FiFacebook } from 'react-icons/fi'

const SignIn: NextPage<
InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  return (
    <div className='mx-auto flex h-screen max-w-md flex-col items-center justify-center gap-8'>
      <h1 className='text-4xl'>Log in</h1>
      {providers &&
        Object.values(providers).map((provider) => (
          <button
            onClick={() => signIn(provider.id)}
            key={provider.name}
            className='flex w-72 items-center justify-center gap-4 rounded bg-black p-4 text-white dark:bg-white dark:text-neutral-900 '
          >
            <FiFacebook className='fill-white dark:fill-neutral-900' />
            Login with {provider.name}
          </button>
        ))}
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
