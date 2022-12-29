import Link from 'next/link'
import {
  FiHeart,
  FiHome,
  FiMenu,
  FiPlay,
  FiSearch,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi'
import type { FC, PropsWithChildren } from 'react'
import React, { useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'
import { cn } from 'utils/cn'
import { useRouter } from 'next/router'
import { signIn, signOut } from 'next-auth/react'
import { ProfilePicture } from './Avatar'
import type { Genre } from '__generated__/resolvers-types'
import { useSession } from 'next-auth/react'
import _ from 'lodash'

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

export const Sidebar = ({ genres }: { genres: Genre[] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
        <div className='m-4 flex items-center lg:hidden'>
          <FiMenu
            className='h-5 w-5 cursor-pointer dark:text-white'
            onClick={() => setIsOpen(true)}
          />
          <h1
            className={`mx-auto text-lg  ${
              isOpen && 'opacity-0'
            } transition-opacity`}
          >
            ミル Miru
          </h1>
          <span className='mr-1 rounded-lg bg-red-400 px-2 py-1 text-xs uppercase text-white dark:bg-red-800'>
            Alpha
          </span>
        </div>
        <aside
          className={cn(
            'z-30 h-full w-60 transform overflow-y-auto border-r border-gray-200 bg-white transition duration-200 ease-in-out dark:border-neutral-700 dark:bg-black lg:z-auto lg:translate-x-0',
            isOpen
              ? 'fixed inset-y-0 left-0 translate-x-0'
              : 'fixed inset-y-0 -translate-x-full'
          )}
          aria-label='Sidenav'
        >
          <div className='mt-4 mb-6 flex items-center justify-between pl-4 dark:text-white'>
            <Link href='/' className='text-lg'>
              ミル Miru
            </Link>
            <span className='mr-1 rounded-lg bg-red-400 px-2 py-1 text-xs uppercase text-white dark:bg-red-800'>
              Alpha
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className='mr-2 rounded p-1 dark:hover:bg-neutral-700 hover:bg-neutral-300 lg:hidden'
            >
              <FiX />
            </button>
          </div>
          <main className='flex flex-col p-2'>
            <nav>
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
            </nav>
            <nav>
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
          </main>
          <footer className='sticky bottom-0 left-0'>
            <div className='h-8 bg-gradient-to-t from-white dark:from-black'></div>
            <div className='bg-white p-4 dark:bg-black'>
              {session?.user ? (
                <>
                  <div className='flex w-full items-center justify-between rounded-lg p-2 text-base font-normal text-gray-900 dark:text-white '>
                    <div>
                      <ProfilePicture size='sm' user={session.user} />
                      <span className='ml-3 text-sm'>
                        {session?.user?.name ?? 'Profile'}
                      </span>
                    </div>
                  </div>
                  <button
                    className='mx-auto mt-2 flex justify-center p-2 text-base font-normal text-red-500'
                    onClick={() => signOut()}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  className='mx-auto mt-2 flex justify-center rounded bg-black px-8 py-1 text-base font-normal text-white dark:bg-white dark:text-black'
                  onClick={() => signIn()}
                >
                  Login
                </button>
              )}
            </div>
          </footer>
        </aside>
      </OutsideClickHandler>
      <div
        className={`fixed inset-0 z-20 bg-white bg-opacity-10 transition duration-200 ease-in-out dark:bg-black dark:bg-opacity-50 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />
    </>
  )
}
