import Link from 'next/link'
import {
  FiHeart,
  FiHome,
  FiPlay,
  FiSearch,
  FiTrendingUp,
  FiUser,
  FiX,
} from 'react-icons/fi'
import type { FC, PropsWithChildren } from 'react'
import React from 'react'
import { cn } from 'utils/cn'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { ProfilePicture } from './Avatar'
import type { Genre } from '__generated__/resolvers-types'
import { useSession } from 'next-auth/react'
import _ from 'lodash'
import { useMobile } from 'hooks/useMobile'
import type { NextRouter } from 'next/dist/client/router'
import type { IconType } from 'react-icons/lib'
import type { User } from 'next-auth'

interface NavItemProps {
  href: string;
  isSelected: boolean;
  icon?: React.ReactNode;
}
const NavItem: FC<PropsWithChildren<NavItemProps>> = ({
  href,
  isSelected,
  icon,
  children,
}) => {
  return (
    <li>
      <Link
        className={cn(
          'flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700',
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

interface BottomNavItemProps {
  href: string;
  isSelected: boolean;
  icon: IconType;
  onClick?: () => void;
}

const BottomNavItem: FC<PropsWithChildren<BottomNavItemProps>> = ({
  href,
  isSelected,
  icon,
}) => {
  return (
    <div className='w-1/4'>
      <Link className='bg-neutral-400 dark:text-white' href={href}>
        <div className='mx-1 rounded-lg p-2 text-center'>
          {React.createElement(icon, {
            className: 'm-auto inline-flex',
          })}
        </div>
        <div className='h-5 text-center'> {isSelected ? '•' : ' '}</div>
      </Link>
    </div>
  )
}

export const BottomNavBar = ({
  router,
  user,
}: {
  router: NextRouter;
  user: User | null;
}) => {
  return (
    <aside id='bottomNav'>
      <BottomNavItem
        isSelected={router.pathname === '/'}
        href='/'
        icon={FiHome}
      />
      <BottomNavItem
        isSelected={router.pathname === '/explore'}
        href='/explore'
        icon={FiSearch}
      />
      <BottomNavItem
        isSelected={router.pathname === '/for-you'}
        href='/for-you'
        icon={FiHeart}
      />
      <BottomNavItem
        isSelected={router.pathname === '/popular'}
        href='/popular'
        icon={FiTrendingUp}
      />
      {user != null ? (
        <BottomNavItem
          isSelected={router.asPath === `/users/${user.id}`}
          href={`/users/${user.id}`}
          icon={ProfileIcon(user)}
        />
      ) : (
        <BottomNavItem
          isSelected={router.pathname === '/auth/signin'}
          href={'/auth/signin'}
          icon={FiUser}
        />
      )}
    </aside>
  )
}

// eslint-disable-next-line react/display-name
const ProfileIcon = (user: User) => () => {
  return <ProfilePicture user={user} size={'sm'}></ProfilePicture>
}

export const Sidebar = ({ genres }: { genres: Genre[] }) => {
  const { data: session } = useSession()
  const router = useRouter()

  const mobile = useMobile()

  if (mobile) {
    return <BottomNavBar router={router} user={session?.user as User} />
  }

  return (
    <>
      <aside
        className={
          'fixed inset-y-0 z-30 h-full w-60 -translate-x-full transform overflow-y-auto border-r border-gray-200 bg-white transition duration-200 ease-in-out dark:border-neutral-700 dark:bg-black lg:z-auto lg:translate-x-0'
        }
        aria-label='Sidenav'
      >
        <div className='mt-4 mb-6 flex items-center justify-between pl-4 dark:text-white'>
          <Link href='/' className='text-lg'>
            ミル Miru
          </Link>
          <span className='mr-1 rounded-lg bg-red-400 px-2 py-1 text-xs uppercase text-white dark:bg-red-800'>
            Alpha
          </span>
          <button className='mr-2 rounded p-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 lg:hidden'>
            <FiX />
          </button>
        </div>
        <nav className='flex flex-col p-2'>
          <ul className='space-y-2'>
            <NavItem
              isSelected={router.pathname === '/'}
              href='/'
              icon={<FiHome />}
            >
              Home
            </NavItem>
            <NavItem
              isSelected={router.pathname === '/explore'}
              href='/explore'
              icon={<FiSearch />}
            >
              Explore
            </NavItem>
            <NavItem
              isSelected={router.pathname === '/watchlist'}
              href='/watchlist'
              icon={<FiPlay />}
            >
              Watchlist
            </NavItem>
            <NavItem
              isSelected={router.pathname === '/for-you'}
              href='/for-you'
              icon={<FiHeart />}
            >
              For you
            </NavItem>
            <NavItem
              isSelected={router.pathname === '/popular'}
              href='/popular'
              icon={<FiTrendingUp />}
            >
              Popular
            </NavItem>
          </ul>
          <p className='pt-4 pb-2 pl-3 text-sm'>Genres</p>
          <ul className='space-y-2'>
            {_.sortBy(genres, (genre) => genre.name).map((genre) => (
              <NavItem
                href={`/genre/${genre.id}`}
                isSelected={router.asPath === `/genre/${genre.id}`}
                key={genre.id}
              >
                {genre.name}
              </NavItem>
            ))}
          </ul>
        </nav>
        <footer className='sticky bottom-0 left-0'>
          <div className='h-8 bg-gradient-to-t from-white dark:from-black'></div>
          <div className='bg-white p-4 dark:bg-black'>
            {session?.user ? (
              <Link
                href={`/users/${session.user.id}`}
                className='flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700 '
              >
                <ProfilePicture size='sm' user={session.user} />
                <span className='ml-3 text-sm'>
                  {session?.user?.name ?? 'Profile'}
                </span>
              </Link>
            ) : (
              <button
                className='mx-auto mt-2 flex justify-center rounded bg-black px-8 py-1 text-base font-normal text-white dark:bg-white dark:text-black'
                onClick={() => {
                  signIn()
                }}
              >
                Login
              </button>
            )}
          </div>
        </footer>
      </aside>
      <div
        className={
          'pointer-events-none fixed inset-0 z-20 bg-white bg-opacity-10 opacity-0 transition duration-200 ease-in-out dark:bg-black dark:bg-opacity-50'
        }
      />
    </>
  )
}
