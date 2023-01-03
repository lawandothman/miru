import Image from 'next/image'
import { useState } from 'react'
import { cn } from 'utils/cn'
import { getImage } from 'utils/image'
import type { Movie } from '__generated__/resolvers-types'

export const MoviePoster = ({ movie }: { movie: Movie }) => {
  const [isLoading, setLoading] = useState(true)
  return (
    <div className='aspect-w-8 aspect-h-12 w-full overflow-hidden rounded-lg'>
      <Image
        alt={movie?.title ?? ''}
        src={getImage(movie?.posterUrl ?? '')}
        fill
        unoptimized
        loading='lazy'
        sizes='(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              25vw'
        className={cn(
          'absolute top-0 left-0 bottom-0 right-0 min-h-full min-w-full object-cover',
          isLoading ? 'animate-pulse dark:bg-neutral-700 bg-neutral-300' : 'blur-0'
        )}
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  )
}
