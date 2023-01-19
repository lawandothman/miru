import type { FC, PropsWithChildren } from 'react'
import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cx } from 'class-variance-authority'

type TooltipProps = {
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: () => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
} & TooltipPrimitive.TooltipContentProps

export const Tooltip: FC<PropsWithChildren<TooltipProps>> = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delayDuration={300}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          side='bottom'
          align='center'
          sideOffset={4}
          className={cx(
            'radix-side-top:animate-slide-down-fade',
            'radix-side-right:animate-slide-left-fade',
            'radix-side-bottom:animate-slide-up-fade',
            'radix-side-left:animate-slide-right-fade',
            'rounded-md px-2 py-1 text-center',
            'bg-white dark:bg-neutral-800'
          )}
          {...props}
        >
          {content}
          <TooltipPrimitive.Arrow className='fill-current text-white dark:text-neutral-800' />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
