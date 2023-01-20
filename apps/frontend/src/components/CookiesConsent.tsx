import { PRIVACY_POLICY_INDEX } from 'config/constants'
import { getCookie, setCookie } from 'cookies-next'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { Button } from './Button'

export const CookieConsent = () => {
  const [consent, setConsent] = useState(true)

  useEffect(() => {
    const storedConsent = getCookie('cookieConsent') as boolean
    setConsent(storedConsent)
  }, [])

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!consent) {
      setCookie('cookieConsent', true, {
        maxAge: 30 * 24 * 60 * 60,
      })
      setConsent(true)
    }
  }

  if (consent) {
    return null
  }

  return (
    <section className='fixed inset-x-0 bottom-12 mx-auto flex max-w-4xl flex-col gap-3 rounded-lg bg-neutral-100 px-5 py-8 dark:bg-neutral-900 md:items-stretch md:py-4 lg:left-60 lg:bottom-0'>
      <div className='flex grow items-center justify-center text-gray-900'>
        <p className='text-center text-sm font-medium'>
          We use cookies to deliver a better experience. You can learn more
          about the services we use at our{' '}
          <Link className='text-sm underline' href={PRIVACY_POLICY_INDEX}>
            privacy policy
          </Link>
          .
        </p>
      </div>
      <div className='flex w-full justify-center'>
        <Button className='w-full py-4' onClick={onClick}>
          Got it
        </Button>
      </div>
    </section>
  )
}
