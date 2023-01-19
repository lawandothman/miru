import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

export const button = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-lg',
    'font-semibold',
    'whitespace-nowrap',
    'gap-2',
    'max-w-xl px-6 py-2',
  ],
  {
    variants: {
      intent: {
        primary: 'text-white dark:text-black',
        danger: 'text-red-500',
      },
      size: {
        md: 'min-h-10 min-w-28',
        sm: 'max-h-8 max-w-32 p-4',
        'full-width':'w-full'
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
