import type { FC } from 'react'

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}
export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className='mb-4'>
      <h1 className='text-3xl font-thin tracking-widest'>{title}</h1>
      {subtitle && <p className='mt-1 text-lg font-light'>{subtitle}</p>}
    </header>
  )
}
