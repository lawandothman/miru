import Link from 'next/link'
import type { FC, PropsWithChildren } from 'react'
import { createElement } from 'react'
import type { IconType } from 'react-icons'

interface BottomNavItemProps {
  href: string;
  isSelected: boolean;
  icon: IconType;
  onClick?: () => void;
}

export const BottomNavItem: FC<PropsWithChildren<BottomNavItemProps>> = ({
  href,
  isSelected,
  icon,
}) => {
  return (
    <div className='w-1/4 active:bg-transparent'>
      <Link className='bg-neutral-400 dark:text-white' href={href}>
        <div className='mx-1 rounded-lg  p-2 text-center'>
          {createElement(icon, {
            className: `m-auto w-6 h-6 inline-flex ${
              isSelected
                ? 'text-black dark:text-white font-bold'
                : 'text-neutral-400 dark:text-neutral-600'
            }`,
          })}
        </div>
      </Link>
    </div>
  )
}
