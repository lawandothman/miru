import { ProfilePicture } from '@/components/ProfilePicture'
import {
  EXPLORE_INDEX,
  FOR_YOU_INDEX,
  POPULAR_INDEX,
  SIGN_IN_INDEX,
  USER_INDEX,
} from 'config/constants'
import { type User } from 'next-auth'
import type { NextRouter } from 'next/router'
import { BottomNavItem } from './BottomNavItem'
import { Heart, Home, Search, TrendingUp, User as UserIcon } from 'lucide-react'

export const BottomNavBar = ({
  router,
  user,
}: {
  router: NextRouter;
  user?: User | null;
}) => {
  return (
    <aside className='fixed bottom-0 z-10 flex h-20 w-full flex-row items-start bg-white pt-1 pb-safe dark:bg-black'>
      <BottomNavItem
        isSelected={router.pathname === '/' || router.pathname === '/dashboard'}
        href='/'>
        <Home />
      </BottomNavItem>
      <BottomNavItem
        isSelected={router.pathname === EXPLORE_INDEX}
        href={EXPLORE_INDEX}
      >
        <Search />
      </BottomNavItem>
      <BottomNavItem
        isSelected={router.pathname === FOR_YOU_INDEX}
        href={FOR_YOU_INDEX}
      >
        <Heart />
      </BottomNavItem>
      <BottomNavItem
        isSelected={router.pathname === POPULAR_INDEX}
        href={POPULAR_INDEX}
      >
        <TrendingUp />
      </BottomNavItem>
      {user != null ? (
        <BottomNavItem
          isSelected={router.asPath === `${USER_INDEX}/${user.id}`}
          href={`${USER_INDEX}/${user.id}`}
        >
          <ProfilePicture user={user} size={'sm'} />
        </BottomNavItem>
      ) : (
        <BottomNavItem
          isSelected={router.pathname === SIGN_IN_INDEX}
          href={SIGN_IN_INDEX}
        >
          <UserIcon />
        </BottomNavItem>
      )}
    </aside>
  )
}
