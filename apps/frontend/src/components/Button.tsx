import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

// mx-auto mb-8 mt-4 flex

export const button = cva(
  [
    'flex',
    'items-center',
    'justify-center',
    'rounded-lg',
    'font-semibold',
    'gap-2',
    'max-w-xl',
    'p-4'
  ],
  {
    variants: {
      intent: {
        primary: 'text-white dark:text-black',
        danger: 'text-red-500',
      },
      size: {
        md: 'h-10 w-28',
        sm: 'max-h-8 max-w-32',
      },
      display: {
        solid: 'bg-black dark:bg-white',
        ghost: '',
        outline: 'border',
      },
    },
    defaultVariants: {
      intent: 'primary',
      display: 'solid',
      size: 'md',
    },
  }
)

type ButtonProps = VariantProps<typeof button> &
ButtonHTMLAttributes<HTMLButtonElement>

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  intent,
  display,
  size,
  ...props
}) => {
  return (
    <button className={button({ intent, size, display })} {...props}>
      {children}
    </button>
  )
}
