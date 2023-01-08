import { NextSeo } from 'next-seo'
import React from 'react'

interface PageProps {
  name: string;
  index: string;
  children: React.ReactNode;
  nofollow?: boolean;
  noindex?: boolean;
}
export const Page: React.FC<PageProps> = ({
  name,
  index,
  children,
  noindex = false,
  nofollow = false,
}) => {
  const title = `${name} • Miru`
  const url = `https://miru.space${index}`

  return (
    <>
      <NextSeo
        title={title}
        canonical={url}
        openGraph={{
          url,
          title,
        }}
        nofollow={nofollow}
        noindex={noindex}
      />
      {children}
    </>
  )
}
