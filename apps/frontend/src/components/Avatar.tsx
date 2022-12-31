/* eslint-disable react/jsx-no-undef */
import * as Avatar from '@radix-ui/react-avatar'
import type { User } from 'next-auth'
import Image from 'next/image'
import type { FC } from 'react'
import { cn } from 'utils/cn'

const initials = (name: string) => {
  const [firstName, lastName] = name.split(' ')
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName?.charAt(0)
}

interface ProfilePictureProps {
  user: User;
  size: 'sm' | 'md' | 'lg';
}

export const ProfilePicture: FC<ProfilePictureProps> = ({
  user,
  size = 'sm',
}) => {
  return (
    <Avatar.Root
      className={cn(
        'inline-flex  select-none items-center justify-center overflow-hidden rounded-full align-middle',
        size === 'md' ? 'h-10 w-10' : size == 'lg' ? 'h-14 w-14' : 'h-6 w-6'
      )}
    >
      {user.image ? (
        <Image width={200} height={200} className='object-contain' src={user.image} alt={user.name ?? ''} />
      ) : (
        <Avatar.Fallback
          className={cn(
            'flex h-full w-full items-center justify-center bg-white text-sm text-neutral-900',
            size === 'md' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-base'
          )}
          delayMs={600}
        >
          {user.name && initials(user.name)}
        </Avatar.Fallback>
      )}
    </Avatar.Root>
  )
}
