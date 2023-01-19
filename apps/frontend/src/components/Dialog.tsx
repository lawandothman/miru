import React, { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'
import { cx } from 'class-variance-authority'

type DialogContentProps = {
  children: React.ReactNode;
  show: boolean;
} & React.HTMLAttributes<HTMLDivElement>

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, show, ...props }, forwardedRef) => (
    <DialogPrimitive.Portal forceMount>
      <Transition.Root show={show}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <DialogPrimitive.Overlay className='fixed inset-0 z-20 bg-black/50' />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <DialogPrimitive.Content
            className={cx(
              'fixed z-50',
              'top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]',
              'min-h-[400px] w-[400px] max-w-md rounded-lg',
              'bg-white p-2 shadow-lg dark:bg-neutral-800'
            )}
            {...props}
            ref={forwardedRef}
          >
            {children}
            <DialogPrimitive.Close asChild>
              <button
                className='absolute top-2 right-2 inline-flex items-center p-2 dark:text-white '
                aria-label='Close'
              >
                <FiX className='h-6 w-6' />
              </button>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </DialogPrimitive.Portal>
  )
)

DialogContent.displayName = 'DialogContent'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogTitle = DialogPrimitive.Title
