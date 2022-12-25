import type { DefaultSeoProps } from 'next-seo'

const config: DefaultSeoProps = {
  title: 'ミル Miru',
  description:
    'Miru helps you remove the drama from movie night and find the movie that everyone wants to watch.',
  canonical: 'https://www.miru-chi.vercel.app/',
  openGraph: {
    url: 'https://www.miru-chi.vercel.app/',
    type: 'website',
    locale: 'en_IE',
    siteName: 'ミル Miru',
  },
}

export default config
