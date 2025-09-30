'use client'

import { Button } from '@/components/ui'

export interface FooterProps {
  variant?: 'standard' | 'simple' | 'app'
  status?: 'saved' | 'unsaved'
  statusBadges?: Array<{
    label: string
    color: 'gray' | 'lime' | 'green' | 'blue' | 'orange' | 'red'
  }>
  showAiButton?: boolean
  aiButtonText?: string
  onAiButtonClick?: () => void
  actions?: React.ReactNode
  copyright?: string
  asContent?: boolean // When true, returns content without footer wrapper
}

export function Footer({
  variant = 'standard',
  status = 'unsaved',
  statusBadges = [],
  showAiButton = true,
  aiButtonText = 'AIで自動選択する',
  onAiButtonClick,
  actions,
  copyright = 'Copyright © 2024 Asahi KASEI All rights reserved.',
  asContent = false
}: FooterProps) {

  const appFooterContent = (
    <>
      <div className="text-xs text-gray-600">
        <p><span className="font-bold">リリース情報:</span> バージョン1.0.0 (2024/12/12)</p>
      </div>
      <div className="text-xs text-gray-400">
        {copyright}
      </div>
    </>
  )

  if (variant === 'app') {
    if (asContent) {
      return (
        <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          {appFooterContent}
        </div>
      )
    }
    return (
      <footer className="p-3 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0">
        {appFooterContent}
      </footer>
    )
  }
  
  if (variant === 'simple') {
    return (
      <footer className="p-2 bg-white border-t border-gray-200 flex items-center justify-end flex-shrink-0">
        <div className="flex flex-wrap gap-2 justify-end">
          {actions || (
            <>
              <Button variant="outline" size="sm" className="text-xs">全体評価</Button>
              <Button variant="outline" size="sm" className="text-xs">TOPに戻る</Button>
            </>
          )}
        </div>
      </footer>
    )
  }
  
  // Standard footer (default)
  return (
    <footer className="p-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2 text-[10px] flex-shrink-0">
        {statusBadges.length > 0 ? (
          <>
            <h3 className="text-xs font-medium text-gray-700">ステータス:</h3>
            <div className="flex flex-wrap gap-1">
              {statusBadges.map((badge, index) => {
                const colorClasses = {
                  gray: 'bg-gray-200 text-gray-800',
                  lime: 'bg-lime-200 text-lime-800',
                  green: 'bg-green-200 text-green-800',
                  blue: 'bg-blue-200 text-blue-800',
                  orange: 'bg-orange-200 text-orange-800',
                  red: 'bg-red-200 text-red-800'
                }
                
                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-1.5 rounded-full font-medium ${colorClasses[badge.color]}`}
                  >
                    {badge.label}
                  </span>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-600">
            ステータス: <span className={`font-semibold ${status === 'saved' ? 'text-green-600' : 'text-orange-600'}`}>
              {status === 'saved' ? '保存済み' : '未保存'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 justify-end">
        {showAiButton && (
          <Button
            variant="primary"
            size="sm"
            className="text-xs bg-purple-600 hover:bg-purple-700 flex items-center gap-1"
            onClick={onAiButtonClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {aiButtonText}
          </Button>
        )}
        
        {actions}
      </div>
    </footer>
  )
}