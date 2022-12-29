import type { FC } from 'react'

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}
export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle = '',
}) => {
  return (
    <div className='mb-4 flex justify-between'>
      <div>
        <h1 className='text-3xl font-thin tracking-widest dark:text-white'>
          {title}
        </h1>
        <p className='mt-1 font-thin dark:text-white'>{subtitle}</p>
      </div>
    </div>
  )
}
