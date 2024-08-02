import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { FC, PropsWithChildren } from 'react'

interface BottomNavItemProps {
  href: string;
  isSelected: boolean;
  onClick?: () => void;
}

export const BottomNavItem: FC<PropsWithChildren<BottomNavItemProps>> = ({
  href,
  isSelected,
  children,
}) => {
  return (
    <div className='w-1/4 active:bg-transparent'>
      <Link className='bg-neutral-400 dark:text-white' href={href}>
        <div className='mx-1 rounded-lg  p-2 text-center'>
          <div
            className={cn(
              'm-auto w-6 h-6 inline-flex',
              isSelected
                ? 'text-black dark:text-white font-bold'
                : 'text-neutral-400 dark:text-neutral-600'
            )}
          >
            {children}
          </div>
        </div>
      </Link>
    </div>
  )
}
