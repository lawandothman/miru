import type { NextPage } from 'next'
import Link from 'next/link'

const Custom404: NextPage = () => {
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-8'>
      <h1 className='text-6xl'>404</h1>
      <p className='max-w-lg text-center text-lg font-thin'>
        The page no longer exists or the link may be broken.
      </p>
      <Link
        href='/'
        className='flex h-10 items-center rounded-md bg-neutral-900 px-8 text-white dark:bg-white dark:text-neutral-900'
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default Custom404
