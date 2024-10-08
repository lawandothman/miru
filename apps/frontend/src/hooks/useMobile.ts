import { useEffect, useState } from 'react'

export function useMobile(fallBackTheme = false) {
  const [mobile, setMobile] = useState(fallBackTheme)
  if (typeof window !== 'undefined') {
    const matcher = window.matchMedia('(min-width: 1024px)')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setMobile(!matcher.matches)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    matcher.addEventListener('change', (e) => {
      setMobile(!e.matches)
    })
  }
  return mobile
}
