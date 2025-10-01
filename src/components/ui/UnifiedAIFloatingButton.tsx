'use client'

import React, { useState } from 'react'

interface UnifiedAIFloatingButtonProps {
  onAIAssist?: () => void
  variant?: 'default' | 'compact'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  disabled?: boolean
}

export default function UnifiedAIFloatingButton({
  onAIAssist,
  variant = 'default',
  position = 'bottom-right',
  disabled = false
}: UnifiedAIFloatingButtonProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'top-right':
        return 'top-6 right-6'
      case 'top-left':
        return 'top-6 left-6'
      case 'bottom-right':
      default:
        return 'bottom-6 right-6'
    }
  }

  const getSizeClasses = () => {
    return variant === 'compact'
      ? 'w-12 h-12'
      : 'w-14 h-14'
  }

  const handleClick = () => {
    if (!disabled && onAIAssist) {
      onAIAssist()
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={`
        fixed ${getPositionClasses()} ${getSizeClasses()}
        bg-gradient-to-r from-purple-600 to-purple-700
        hover:from-purple-700 hover:to-purple-800
        disabled:from-gray-400 disabled:to-gray-500
        text-white rounded-full
        shadow-lg hover:shadow-xl
        transform transition-all duration-200 ease-out
        ${isHovered && !disabled ? 'scale-105' : 'scale-100'}
        flex items-center justify-center
        z-50
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      aria-label="AI自動選択機能"
      title={disabled ? 'AI機能は現在利用できません' : 'AI自動選択機能を使用する'}
    >
      {/* AI アイコン */}
      <div className="relative">
        <svg
          width={variant === 'compact' ? 20 : 24}
          height={variant === 'compact' ? 20 : 24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isHovered ? 'rotate-12' : ''}`}
        >
          {/* 脳のアイコン */}
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2z" />
          <path d="M8.5 8.5a2.5 2.5 0 0 1 5 0" />
          <path d="M11 11a2 2 0 1 0 4 0" />
          <path d="M8 15s1.5-1 4-1 4 1 4 1" />
        </svg>

        {/* アクティブ時のパルス効果 */}
        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-purple-400 opacity-25 animate-ping" />
        )}
      </div>

      {/* ラベル（ホバー時表示） */}
      {isHovered && !disabled && variant === 'default' && (
        <div className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-90">
          AI自動選択
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </button>
  )
}

// 使用例コンポーネント
export function AIFloatingButtonWithModal(): React.JSX.Element {
  const [showModal, setShowModal] = useState(false)

  const handleAIAssist = () => {
    setShowModal(true)
  }

  return (
    <>
      <UnifiedAIFloatingButton onAIAssist={handleAIAssist} />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">AI自動選択機能</h3>
            <p className="text-gray-600 mb-4">
              AIが現在の評価内容を分析して、最適な選択肢を提案します。
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // AI機能実行
                  setShowModal(false)
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}