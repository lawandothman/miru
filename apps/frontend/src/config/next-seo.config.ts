import type { DefaultSeoProps } from 'next-seo'

const config: DefaultSeoProps = {
  title: 'Miru',
  description:
    'Miru helps you remove the drama from movie night and find the movie that everyone wants to watch.',
  canonical: 'https://miru.space',
  openGraph: {
    url: 'https://www.miru.space/',
    type: 'website',
    locale: 'en_IE',
    siteName: 'Miru',
    images: [
      {
        url: 'https://miru.space/og-image.png',
        alt: 'Miru',
        width: 1260,
        height: 640,
      },
    ],
  },
}

export default config
