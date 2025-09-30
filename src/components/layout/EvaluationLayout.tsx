'use client'

import { ReactNode } from 'react'
import { PageLayout, PageLayoutProps } from './PageLayout'
import { NavigationButtons } from '@/components/ui/BackButton'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

export interface EvaluationLayoutProps extends Omit<PageLayoutProps, 'children'> {
  children?: ReactNode
  evaluationContent: ReactNode
  sidebarContent?: ReactNode
  showGrid?: boolean
  showBackButton?: boolean
  breadcrumbItems?: BreadcrumbItem[]
}

export function EvaluationLayout({
  children,
  evaluationContent,
  sidebarContent,
  showGrid = true,
  showBackButton = true,
  breadcrumbItems,
  ...pageLayoutProps
}: EvaluationLayoutProps) {
  if (!showGrid) {
    return (
      <PageLayout {...pageLayoutProps}>
        <div className="p-6 max-w-7xl mx-auto mobile-chrome-visible form-mobile-optimized chrome-mobile-fix">
          {breadcrumbItems && breadcrumbItems.length > 0 && (
            <div className="mb-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}
          {showBackButton && (
            <div className="mb-4">
              <NavigationButtons />
            </div>
          )}
          {children && children}
          {evaluationContent}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout {...pageLayoutProps}>
      <div className="evaluation-grid h-full">
        {sidebarContent && (
          <div className="sidebar scrollable bg-white border-r border-gray-200 p-4">
            {sidebarContent}
          </div>
        )}
        
        <div className="main-content scrollable p-6">
          <div className="max-w-full mx-auto mobile-chrome-visible form-mobile-optimized chrome-mobile-fix">
            {breadcrumbItems && breadcrumbItems.length > 0 && (
              <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
              </div>
            )}
            {showBackButton && (
              <div className="mb-4">
                <NavigationButtons />
              </div>
            )}
            {children && children}
            {evaluationContent}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

// 16:9対応のコンテンツコンテナ
export function EvaluationContentContainer({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={`card mobile-chrome-visible form-mobile-optimized ${className}`}>
      {children}
    </div>
  )
}

// 評価フォームのグリッドレイアウト
export function EvaluationFormGrid({ 
  children,
  columns = 1,
  className = '' 
}: { 
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  )
}