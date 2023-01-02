import { useEffect, useState } from 'react'

export function useMobile(fallBackTheme = true) {
  const [mobile, setMobile] = useState(fallBackTheme)
  if (typeof window !== 'undefined') {
    const matcher = window.matchMedia('(min-width: 1024px)')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setMobile(!matcher.matches)
    }, [])
    matcher.addEventListener('change', (e) => {
      setMobile(!e.matches)
    })
  }
  return mobile
}