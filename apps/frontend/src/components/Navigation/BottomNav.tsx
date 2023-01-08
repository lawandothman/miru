import { ProfilePicture } from 'components/Avatar'
import {
  EXPLORE_INDEX,
  FOR_YOU_INDEX,
  POPULAR_INDEX,
  SIGN_IN_INDEX,
  USER_INDEX,
} from 'config/constants'
import type { User } from 'next-auth'
import type { NextRouter } from 'next/router'
import {
  FiHeart,
  FiHome,
  FiSearch,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi'
import { BottomNavItem } from './BottomNavItem'

export const BottomNavBar = ({
  router,
  user,
}: {
  router: NextRouter;
  user?: User | null;
}) => {
  return (
    <aside className='fixed bottom-0 z-10 flex w-full flex-row p-1 dark:bg-black bg-white'>
      <BottomNavItem
        isSelected={router.pathname === '/'}
        href='/'
        icon={FiHome}
      />
      <BottomNavItem
        isSelected={router.pathname === EXPLORE_INDEX}
        href={EXPLORE_INDEX}
        icon={FiSearch}
      />
      <BottomNavItem
        isSelected={router.pathname === FOR_YOU_INDEX}
        href={FOR_YOU_INDEX}
        icon={FiHeart}
      />
      <BottomNavItem
        isSelected={router.pathname === POPULAR_INDEX}
        href={POPULAR_INDEX}
        icon={FiTrendingUp}
      />
      {user != null ? (
        <BottomNavItem
          isSelected={router.asPath === `${USER_INDEX}/${user.id}`}
          href={`${USER_INDEX}/${user.id}`}
          icon={ProfileIcon(user)}
        />
      ) : (
        <BottomNavItem
          isSelected={router.pathname === SIGN_IN_INDEX}
          href={SIGN_IN_INDEX}
          icon={FiUser}
        />
      )}
    </aside>
  )
}

// eslint-disable-next-line react/display-name
const ProfileIcon = (user: User) => () => {
  return <ProfilePicture user={user} size={'sm'} />
}
