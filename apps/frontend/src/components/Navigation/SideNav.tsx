import Link from 'next/link'
import type { FC } from 'react'
import React from 'react'
import { signIn } from 'next-auth/react'
import { ProfilePicture } from '@/components/ProfilePicture'
import type { Genre } from '__generated__/resolvers-types'
import _ from 'lodash'
import type { NextRouter } from 'next/dist/client/router'
import type { User } from 'next-auth'
import { Button } from '@/components/ui/button'
import { SideNavItem } from './SideNavItem'
import {
  EXPLORE_INDEX,
  FOR_YOU_INDEX,
  GENRE_INDEX,
  POPULAR_INDEX,
  USER_INDEX,
  WATCHLIST_INDEX,
} from 'config/constants'
import { Heart, Home, Play, Search, TrendingUp } from 'lucide-react'

type SidebarProps = {
  genres: Genre[];
  router: NextRouter;
  user?: User | null;
}
export const Sidebar: FC<SidebarProps> = ({ genres, router, user }) => {
  return (
    <>
      <aside
        className={
          'fixed inset-y-0 z-30 h-full w-60 -translate-x-full overflow-y-auto border-r border-gray-200 bg-white dark:border-neutral-700 dark:bg-black lg:z-auto lg:translate-x-0'
        }
        aria-label='Sidenav'
      >
        <div className='mb-6 mt-4 flex items-center justify-between pl-4 dark:text-white'>
          <Link href='/' className='text-lg'>
            ミル Miru
          </Link>
          <span className='mr-1 rounded-lg bg-red-400 px-2 py-1 text-xs uppercase text-white dark:bg-red-800'>
            Alpha
          </span>
        </div>
        <nav className='flex flex-col p-2'>
          <ul className='space-y-2'>
            <SideNavItem
              isSelected={router.pathname === '/'}
              href='/'
              Icon={Home}
            >
              Home
            </SideNavItem>
            <SideNavItem
              isSelected={router.pathname === EXPLORE_INDEX}
              href={EXPLORE_INDEX}
              Icon={Search}
            >
              Explore
            </SideNavItem>
            <SideNavItem
              isSelected={router.pathname === WATCHLIST_INDEX}
              href={WATCHLIST_INDEX}
              Icon={Play}
            >
              Watchlist
            </SideNavItem>
            <SideNavItem
              isSelected={router.pathname === FOR_YOU_INDEX}
              href={FOR_YOU_INDEX}
              Icon={Heart}
            >
              For you
            </SideNavItem>
            <SideNavItem
              isSelected={router.pathname === POPULAR_INDEX}
              href={POPULAR_INDEX}
              Icon={TrendingUp}
            >
              Popular
            </SideNavItem>
          </ul>
          <p className='pb-2 pl-3 pt-4 text-sm'>Genres</p>
          <ul className='space-y-2'>
            {_.sortBy(genres, (genre) => genre.name).map((genre) => (
              <SideNavItem
                href={`${GENRE_INDEX}/${genre.id}`}
                isSelected={router.asPath === `${GENRE_INDEX}/${genre.id}`}
                key={genre.id}
              >
                {genre.name}
              </SideNavItem>
            ))}
          </ul>
        </nav>
        <footer className='sticky bottom-0 left-0'>
          <div className='h-8 bg-gradient-to-t from-white dark:from-black'></div>
          <div className='flex justify-center bg-white p-4 dark:bg-black'>
            {user ? (
              <Link
                href={`${USER_INDEX}/${user.id}`}
                className='flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700 '
              >
                <ProfilePicture size='sm' user={user} />
                <span className='ml-3 text-sm'>{user.name}</span>
              </Link>
            ) : (
              <Button onClick={() => signIn()}>Login</Button>
            )}
          </div>
        </footer>
      </aside>
      <div
        className={
          'pointer-events-none fixed inset-0 z-20 bg-white/10  opacity-0 transition duration-200 ease-in-out dark:bg-black/50'
        }
      />
    </>
  )
}
