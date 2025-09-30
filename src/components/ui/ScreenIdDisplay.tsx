'use client'

import { usePathname } from 'next/navigation'
import { getScreenInfo, getCategoryColor } from '@/lib/screenMapping'

export interface ScreenIdDisplayProps {
  variant?: 'badge' | 'inline' | 'header'
  showCategory?: boolean
  className?: string
}

export function ScreenIdDisplay({
  variant = 'badge',
  showCategory = true,
  className = ''
}: ScreenIdDisplayProps) {
  const pathname = usePathname()
  const screenInfo = getScreenInfo(pathname)

  if (variant === 'inline') {
    return (
      <span className={`text-sm text-gray-600 ${className}`}>
        [{screenInfo.id}] {screenInfo.name}
      </span>
    )
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`px-2 py-1 text-xs font-mono rounded ${getCategoryColor(screenInfo.category)}`}>
          {screenInfo.id}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {screenInfo.name}
        </span>
      </div>
    )
  }

  // デフォルト: badge
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`px-2 py-1 text-xs font-mono rounded-full border ${getCategoryColor(screenInfo.category)}`}>
        {screenInfo.id}
      </span>
      {showCategory && (
        <span className="text-xs text-gray-500">
          {screenInfo.category}
        </span>
      )}
    </div>
  )
}