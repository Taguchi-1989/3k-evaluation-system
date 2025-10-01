'use client'

import React from 'react'
import UnifiedHeader from './UnifiedHeader'
import UnifiedNavigationBar from '../navigation/UnifiedNavigationBar'

interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

interface UnifiedEvaluationLayoutProps {
  title: string
  score?: string | number
  breadcrumbItems?: BreadcrumbItem[]
  children: React.ReactNode
  showBackButton?: boolean
  customBackAction?: () => void
  variant?: 'simple' | 'sidebar' | 'full'
  sidebar?: React.ReactNode
}

export default function UnifiedEvaluationLayout({
  title,
  score,
  breadcrumbItems,
  children,
  showBackButton = true,
  customBackAction,
  variant = 'simple',
  sidebar
}: UnifiedEvaluationLayoutProps): React.JSX.Element {
  const getLayoutContent = () => {
    switch (variant) {
      case 'sidebar':
        return (
          <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
              {sidebar}
            </div>
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto">
                <div className="container mx-auto px-6 py-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        )

      case 'full':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-6">
              {children}
            </div>
          </div>
        )

      case 'simple':
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Header */}
      <UnifiedHeader
        title={title}
        score={score}
        variant="evaluation"
      />

      {/* Unified Navigation */}
      <UnifiedNavigationBar
        breadcrumbItems={breadcrumbItems}
        showBackButton={showBackButton}
        customBackAction={customBackAction}
      />

      {/* Main Content */}
      <main className="flex-1">
        {getLayoutContent()}
      </main>
    </div>
  )
}