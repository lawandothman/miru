import Link from 'next/link'
import type { FC, PropsWithChildren } from 'react'
import { cx } from 'class-variance-authority'

interface SideNavItemProps {
  href: string;
  isSelected: boolean;
  icon?: React.ReactNode;
}
export const SideNavItem: FC<PropsWithChildren<SideNavItemProps>> = ({
  href,
  isSelected,
  icon,
  children,
}) => {
  return (
    <li>
      <Link
        className={cx(
          'flex items-center',
          'rounded-lg p-2 text-base font-normal',
          'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700',
          isSelected ? 'bg-gray-100 dark:bg-neutral-700' : 'bg-transparent'
        )}
        href={href}
      >
        {icon}
        <span className='ml-3 text-sm'>{children}</span>
      </Link>
    </li>
  )
}
