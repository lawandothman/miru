import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'

type Tab = {
  title: string;
  value: string;
  content: React.ReactNode;
}

export const Tabs = ({ tabs }: { tabs: Tab[] }) => {
  return (
    <TabsPrimitive.Root defaultValue='tab1'>
      <TabsPrimitive.List className='flex w-full'>
        {tabs.map(({ title, value }) => (
          <TabsPrimitive.Trigger
            key={`tab-trigger-${value}`}
            value={value}
            className='group flex-1 border-b border-transparent px-3 pb-2.5 radix-state-active:border-b-black dark:radix-state-active:border-b-white'
          >
            <span className='text-sm font-medium text-black dark:text-white'>
              {title}
            </span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map(({ value, content }) => (
        <TabsPrimitive.Content
          key={`tab-content-${value}`}
          value={value}
          className='px-6 py-4'
        >
          {content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
