'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// アイコンコンポーネント
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
  </svg>
)

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

interface UnifiedNavigationBarProps {
  breadcrumbItems?: BreadcrumbItem[]
  showBackButton?: boolean
  customBackAction?: () => void
}

export default function UnifiedNavigationBar({
  breadcrumbItems = [],
  showBackButton = true,
  customBackAction
}: UnifiedNavigationBarProps): React.JSX.Element {
  const router = useRouter()

  const handleBack = () => {
    if (customBackAction) {
      customBackAction()
    } else {
      router.back()
    }
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and breadcrumbs */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="text-sm font-medium">戻る</span>
              </button>
            )}

            {breadcrumbItems.length > 0 && (
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="text-gray-400 mx-2">/</span>
                    )}
                    {item.path && !item.isActive ? (
                      <Link
                        href={item.path}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={item.isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Right side - Quick actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">ダッシュボード</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">ホーム</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}