import { useEffect, useState } from 'react'

export function useColorMode(fallBackTheme = 'light') {
  const [theme, setTheme] = useState(fallBackTheme)

  if (typeof window === 'object') {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setTheme(matcher.matches ? 'dark' : 'light')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    matcher.addEventListener('change', (e) => {
      setTheme(e.matches ? 'dark' : 'light')
    })
  }
  return theme
}
