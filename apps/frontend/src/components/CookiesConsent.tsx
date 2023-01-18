import { PRIVACY_POLICY_INDEX } from 'config/constants'
import { getCookie, setCookie } from 'cookies-next'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { Button } from './Button'

export const CookieConsent = () => {
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    const storedConsent = getCookie('cookieConset') as boolean
    setConsent(storedConsent)
  }, [])

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!consent) {
      setCookie('cookieConsent', true)
      setConsent(true)
    }
  }

  if (consent) {
    return null
  }

  return (
    <section className='fixed bottom-12 left-2 right-0 flex w-full flex-col bg-neutral-100 px-5 py-8 dark:bg-neutral-900 md:flex-row md:items-stretch md:py-4 lg:bottom-0'>
      <div className='flex flex-grow items-center text-gray-900'>
        <p className='text-sm font-medium'>
          We use cookies to deliver a better experience. You can learn more
          about the services we use at our{' '}
          <Link
            className='hover:text-lightAccent text-sm underline'
            href={PRIVACY_POLICY_INDEX}
          >
            privacy policy
          </Link>
          .
        </p>
      </div>
      <div className='mt-2 ml-auto flex items-center'>
        <Button onClick={onClick}>Got it</Button>
      </div>
    </section>
  )
}
