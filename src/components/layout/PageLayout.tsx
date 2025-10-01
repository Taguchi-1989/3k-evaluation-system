'use client'

import type { HeaderProps } from './Header';
import { Header } from './Header'
import type { ReactNode } from 'react'

export interface PageLayoutProps extends HeaderProps {
  children: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
  className?: string
}

export function PageLayout({
  children,
  footer,
  sidebar,
  className = '',
  ...headerProps
}: PageLayoutProps) {
  return (
    <div className="page-container">
      <Header {...headerProps} />
      
      <main className={`page-content ${className}`}>
        {sidebar ? (
          <div className="flex flex-1 overflow-hidden">
            <aside className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
              {sidebar}
            </aside>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        )}
      </main>
      
      {footer && (
        <footer className="page-footer">
          {footer}
        </footer>
      )}
    </div>
  )
}