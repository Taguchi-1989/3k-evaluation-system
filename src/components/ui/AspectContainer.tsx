'use client'

import React, { type ReactNode } from 'react'

export interface AspectContainerProps {
  children: ReactNode
  className?: string
  includeBackground?: boolean
}

export function AspectContainer({
  children,
  className = '',
  includeBackground = true
}: AspectContainerProps): React.JSX.Element {
  return (
    <div className={`${includeBackground ? 'bg-gray-800 dark:bg-gray-900 min-h-screen' : ''} flex items-center justify-center p-4`}>
      <div className={`
        aspect-container 
        w-full 
        max-w-[1440px] 
        mx-auto 
        aspect-[16/9] 
        flex 
        flex-col 
        bg-white 
        dark:bg-gray-900 
        rounded-xl 
        shadow-2xl 
        overflow-hidden 
        ${className}
      `}>
        {children}
      </div>
    </div>
  )
}

export function AspectHeader({ children, className = '' }: { children: ReactNode, className?: string }): React.JSX.Element {
  return (
    <header className={`p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${className}`}>
      {children}
    </header>
  )
}

export function AspectMain({ children, className = '' }: { children: ReactNode, className?: string }): React.JSX.Element {
  return (
    <section className={`flex-grow p-3 flex flex-row gap-3 overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {children}
    </section>
  )
}

export function AspectFooter({ children, className = '' }: { children: ReactNode, className?: string }): React.JSX.Element {
  return (
    <footer className={`p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 ${className}`}>
      {children}
    </footer>
  )
}