import { SIGN_IN_INDEX } from 'config/constants'
import type { User } from 'next-auth'
import { useState } from 'react'

export const useInviteLink = (user: User | undefined) => {
  const [isCopied, setIsCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin + SIGN_IN_INDEX}?invitedBy=${user?.id}`
      )
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 1000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return { copy, isCopied }
}