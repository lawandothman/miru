import Link from 'next/link'

export const Footer = () => (
  <div className='mb-2 mt-12 flex w-full gap-2  text-sm text-neutral-500'>
    <Link href='/about' className='hover:text-black dark:hover:text-white'>
      About
    </Link>
    <span>•</span>
    <Link
      href='/terms-and-conditions'
      className='hover:text-black dark:hover:text-white'
    >
      Terms & Conditions
    </Link>
    <span>•</span>
    <Link href='/privacy' className='hover:text-black dark:hover:text-white'>
      Privacy Policy
    </Link>
  </div>
)
