import * as Avatar from '@radix-ui/react-avatar'
import type { Maybe } from 'graphql/jsutils/Maybe'
import type { User } from 'next-auth'
import type { FC } from 'react'
import BoringAvatar from 'boring-avatars'

type ProfilePictureSizes = 'xs' | 'sm' | 'md' | 'lg'

interface ProfilePictureProps {
  user: Maybe<User>;
  size: ProfilePictureSizes;
}

type SizeMap = {
  [key in ProfilePictureSizes]: {
    imgSize: number;
    rootSize: string;
  };
}

const sizeMap: SizeMap = {
  xs: {
    imgSize: 16,
    rootSize: 'h-4 h-4',
  },
  sm: {
    imgSize: 200,
    rootSize: 'h-6 w-6',
  },
  md: {
    imgSize: 200,
    rootSize: 'h-10 w-10',
  },
  lg: {
    imgSize: 200,
    rootSize: 'h-14 w-14',
  },
}

export const ProfilePicture: FC<ProfilePictureProps> = ({
  user,
  size = 'sm',
}) => {
  const { rootSize } = sizeMap[size]
  return (
    <Avatar.Root
      className={`inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle ${rootSize}`}
    >
      {/* {user?.image ? (
        <Image
          width={imgSize}
          height={imgSize}
          className='object-contain'
          src={user.image}
          alt={user?.name ?? ''}
        />
      ) : ( */}
      <BoringAvatar
        size={120}
        name={user?.name ?? ''}
        variant='beam'
        colors={['#273c75', '#c23616', '#fbc531', '#2f3640']}
      />
      {/* )} */}
    </Avatar.Root>
  )
}
