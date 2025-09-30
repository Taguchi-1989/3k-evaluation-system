'use client'

import { useState } from 'react'

export interface HelpTooltipProps {
  content: string
  title?: string
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
  displayMode?: 'tooltip' | 'overlay'
}

export function HelpTooltip({
  content,
  title,
  className = '',
  iconSize = 'md',
  displayMode = 'overlay'
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const getSizeClasses = () => {
    switch (iconSize) {
      case 'sm':
        return 'h-3 w-3'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ${getSizeClasses()}`}
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={displayMode === 'tooltip' ? () => setIsVisible(true) : undefined}
        onMouseLeave={displayMode === 'tooltip' ? () => setIsVisible(false) : undefined}
        title="ヘルプを表示"
      >
        <svg 
          className="w-full h-full p-0.5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.448-2.09 1.172-2.828M12 14v.01M12 18v-2" 
          />
        </svg>
      </button>

      {isVisible && displayMode === 'tooltip' && (
        <div className="absolute z-50 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-sm">
          {title && (
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</div>
          )}
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {content}
          </div>
          {/* 吹き出しの矢印 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800 mt-[-1px]"></div>
        </div>
      )}

      {/* オーバーレイモード */}
      {isVisible && displayMode === 'overlay' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
            onClick={() => setIsVisible(false)}
          ></div>
          
          {/* モーダルコンテンツ */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                )}
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 text-right">
              <button
                onClick={() => setIsVisible(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}