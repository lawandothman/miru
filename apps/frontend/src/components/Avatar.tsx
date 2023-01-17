import * as Avatar from '@radix-ui/react-avatar'
import type { Maybe } from 'graphql/jsutils/Maybe'
import type { User } from 'next-auth'
import Image from 'next/image'
import type { FC } from 'react'

const initials = (name: string) => {
  const [firstName, lastName] = name.split(' ')
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName?.charAt(0)
}

type ProfilePictureSizes = 'xs' | 'sm' | 'md' | 'lg'

interface ProfilePictureProps {
  user: Maybe<User>;
  size: ProfilePictureSizes;
}

type SizeMap = {
  [key in ProfilePictureSizes]: {
    imgSize: number;
    fallbackSize: string;
    rootSize: string;
  };
}

const sizeMap: SizeMap = {
  xs: {
    imgSize: 16,
    fallbackSize: 'text-base',
    rootSize: 'h-4 h-4',
  },
  sm: {
    imgSize: 200,
    fallbackSize: 'text-base',
    rootSize: 'h-6 w-6',
  },
  md: {
    imgSize: 200,
    fallbackSize: 'text-lg',
    rootSize: 'h-10 w-10',
  },
  lg: {
    imgSize: 200,
    fallbackSize: 'text-3x',
    rootSize: 'h14 w-14',
  },
}

export const ProfilePicture: FC<ProfilePictureProps> = ({
  user,
  size = 'sm',
}) => {
  const { rootSize, imgSize, fallbackSize } = sizeMap[size]
  return (
    <Avatar.Root
      className={`inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle ${rootSize}`}
    >
      {user?.image ? (
        <Image
          width={imgSize}
          height={imgSize}
          className='object-contain'
          src={user?.image}
          alt={user?.name ?? ''}
        />
      ) : (
        <Avatar.Fallback
          className={`flex h-full w-full items-center justify-center bg-white text-sm text-neutral-900 ${fallbackSize}`}
          delayMs={600}
        >
          {user?.name && initials(user.name)}
        </Avatar.Fallback>
      )}
    </Avatar.Root>
  )
}
