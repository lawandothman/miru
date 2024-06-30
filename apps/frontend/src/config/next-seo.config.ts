import type { DefaultSeoProps } from 'next-seo'

const config: DefaultSeoProps = {
  title: 'Miru',
  description:
    'Miru helps you remove the drama from movie night and find the movie that everyone wants to watch.',
  canonical: 'https://miru-chi.vercel.app/',
  openGraph: {
    url: 'https://miru-chi.vercel.app/',
    type: 'website',
    locale: 'en_IE',
    siteName: 'Miru',
    images: [
      {
        url: 'https://miru-chi.vercel.app/api/og',
        alt: 'Miru',
        width: 1200,
        height: 600,
      },
    ],
  },
}

export default config
