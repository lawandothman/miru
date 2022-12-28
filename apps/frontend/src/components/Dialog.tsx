import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'

type DialogContentProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>

export const DialogContent = React.forwardRef<
HTMLDivElement,
DialogContentProps
>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className='fixed inset-0 bg-black opacity-80' />
    <DialogPrimitive.Content
      className='fixed top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-2 shadow-lg'
      {...props}
      ref={forwardedRef}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <button
          className='absolute inline-flex items-center p-2 top-2 right-2 dark:text-white '
          aria-label='Close'
        >
          <FiX className='w-6 h-6' />
        </button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))

DialogContent.displayName = 'DialogContent'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogTitle = DialogPrimitive.Title
