'use client'

import React from 'react'
import { Button, Breadcrumb, ThemeToggle } from '@/components/ui'
import { ScreenIdDisplay } from '@/components/ui/ScreenIdDisplay'
import { UserRoleIndicator } from '@/components/auth/UserRoleIndicator'
import { useAuth } from '@/contexts/AuthContext'
import { generateBreadcrumb } from '@/lib/screenMapping'
import { usePathname } from 'next/navigation'

export interface HeaderProps {
  variant?: 'standard' | 'simple' | 'app'
  evaluationNo?: string
  title?: string
  creator?: {
    department: string
    name: string
    date: string
  }
  checker?: {
    department: string
    name: string
    date: string
  }
  workInfo?: {
    workName: string
    factoryName: string
    processName: string
  }
  actions?: React.ReactNode
  showConfirmation?: boolean
}

export function Header({
  variant = 'standard',
  evaluationNo = 'XX_YY_ZZ_r',
  title = '評価画面',
  creator,
  checker,
  workInfo,
  actions,
  showConfirmation = true
}: HeaderProps): React.JSX.Element {
  const pathname = usePathname()
  const breadcrumbItems = generateBreadcrumb(pathname)
  const { logout } = useAuth()
  
  if (variant === 'app') {
    return (
      <header className="page-header">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-blue-600 text-white font-bold text-lg p-1.5 rounded-md">3K</div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-800 truncate">{title || '3K指数評価アプリ'}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">バージョン 1.0.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden lg:block">
            <ScreenIdDisplay variant="header" showCategory={false} />
          </div>
          <Breadcrumb items={breadcrumbItems} className="hidden md:flex" />
          <div className="hidden sm:block">
            <UserRoleIndicator variant="badge" />
          </div>
          <ThemeToggle variant="button" size="sm" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-gray-600 hover:text-red-600 text-sm px-2"
          >
            ログアウト
          </Button>
          {actions}
        </div>
      </header>
    )
  }
  
  if (variant === 'simple') {
    return (
      <header className="page-header">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <ScreenIdDisplay variant="badge" showCategory={false} className="flex-shrink-0" />
          <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
          <Breadcrumb items={breadcrumbItems} className="hidden md:flex ml-2" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <UserRoleIndicator variant="text" className="mr-2" />
          <ThemeToggle variant="button" size="sm" />
          {actions}
        </div>
      </header>
    )
  }
  
  // Standard header (default)
  return (
    <header className="page-header bg-gray-50" style={{ height: 'auto', minHeight: 'var(--header-height)' }}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-1.5">
        <div className="flex items-center gap-3 flex-shrink-0">
          <ScreenIdDisplay variant="badge" showCategory={false} />
          <h1 className="text-lg font-bold text-gray-800">
            No. <span className="bg-white px-2 py-0.5 rounded-md text-gray-700 text-base border border-gray-200">
              {evaluationNo}
            </span>
          </h1>
          <Breadcrumb items={breadcrumbItems} className="hidden lg:flex ml-2" />
        </div>
        <div className="flex items-center gap-x-4 text-[11px] text-gray-500">
          {creator && (
            <div>
              作成者所属: <span className="font-semibold text-gray-700">{creator.department}</span> 
              氏名: <span className="font-semibold text-gray-700">{creator.name}</span> 
              <span className="ml-1">{creator.date}</span>
            </div>
          )}
          {checker && (
            <div>
              確認者所属: <span className="font-semibold text-gray-700">{checker.department}</span> 
              氏名: <span className="font-semibold text-gray-700">{checker.name}</span> 
              <span className="ml-1">{checker.date}</span>
            </div>
          )}
        </div>
      </div>
      
      {workInfo && (
        <div className="flex items-end justify-between gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm flex-grow">
            <div className="min-w-0">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">作業名</label>
              <div className="w-full bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm truncate">
                {workInfo.workName}
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">工場名</label>
              <div className="w-full bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm truncate">
                {workInfo.factoryName}
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">工程名</label>
              <div className="w-full bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm truncate">
                {workInfo.processName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 pl-4 flex-shrink-0">
            {showConfirmation && (
              <label htmlFor="confirmation" className="flex items-center cursor-pointer text-xs">
                <input 
                  id="confirmation" 
                  type="checkbox" 
                  className="h-3.5 w-3.5 rounded border-gray-400 text-red-600 focus:ring-red-500"
                />
                <span className="ml-1.5 font-medium">記入確認</span>
              </label>
            )}
            {/* ユーザー情報とコントロール */}
            <div className="flex items-center gap-2">
              <UserRoleIndicator variant="full" />
              <ThemeToggle variant="dropdown" size="md" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-gray-600 hover:text-red-600 text-xs"
              >
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}