import { PRIVACY_POLICY_INDEX } from 'config/constants'
import { getCookie, setCookie } from 'cookies-next'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

export const CookieConsent = () => {
  const [consent, setConsent] = useState<boolean | null>(null)

  useEffect(() => {
    const storedConsent = getCookie('cookieConsent')
    setConsent(!!storedConsent)
  }, [])

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (consent === false) {
      setCookie('cookieConsent', true, {
        maxAge: 30 * 24 * 60 * 60,
      })
      setConsent(true)
    }
  }

  if (consent === null) {
    return null
  }

  if (consent) {
    return null
  }

  return (
    <section className='fixed inset-x-0 bottom-12 mx-auto mb-8 flex max-w-4xl flex-col gap-3 rounded-lg bg-neutral-50 px-6 py-4 shadow-lg dark:bg-neutral-900 dark:shadow-none md:flex-row md:items-center md:py-3 lg:bottom-0 lg:left-60'>
      <div className='flex flex-1 items-center justify-center md:justify-start'>
        <p className='text-center text-sm font-medium text-gray-800 dark:text-gray-300 md:text-left'>
          We use cookies to deliver a better experience. You can learn more
          about the services we use at our{' '}
          <Link className='text-sm underline' href={PRIVACY_POLICY_INDEX}>
            privacy policy
          </Link>
          .
        </p>
      </div>
      <div className='flex justify-center md:justify-end'>
        <Button
          className='w-full py-2 md:ml-4 md:w-auto md:py-1'
          onClick={onClick}
        >
          Got it
        </Button>
      </div>
    </section>
  )
}
