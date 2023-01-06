import { useMobile } from 'hooks/useMobile'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import type { FC } from 'react'
import type { Genre } from '__generated__/resolvers-types'
import { BottomNavBar } from './BottomNav'
import { Sidebar } from './SideNav'

type NavigationProps = {
  genres: Genre[];
}
export const Navigation: FC<NavigationProps> = ({ genres }) => {
  const { data: session } = useSession()
  const router = useRouter()

  const mobile = useMobile()

  if (mobile) {
    return <BottomNavBar router={router} user={session?.user} />
  } else {
    return <Sidebar genres={genres} router={router} user={session?.user} />
  }
}
