import Image from 'next/image'
import { useState } from 'react'
import { cn } from 'utils/cn'
import { getImage } from 'utils/image'
import type { Movie } from '__generated__/resolvers-types'

export const MovieBackdrop = ({ movie }: { movie: Movie }) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <div className='aspect-w-12 aspect-h-8 w-full overflow-hidden rounded-lg'>
      <Image
        alt={movie?.title ?? ''}
        src={getImage(movie?.backdropUrl ?? '')}
        fill
        unoptimized
        loading='lazy'
        sizes='(max-width: 160px) 50vw,
              (max-width: 240px) 100vw,
              25vw'
        className={cn(
          'absolute top-0 left-0 bottom-0 right-0 min-h-full min-w-full object-cover',
          isLoading ? 'animate-pulse bg-neutral-700' : 'blur-0'
        )}
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  )
}
