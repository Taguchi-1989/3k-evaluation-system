'use client'

import React, { type ReactNode, useState, useEffect } from 'react'

export interface Tab {
  id: string
  label: string
  content?: ReactNode
  icon?: ReactNode
}

export interface TabInterfaceProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export function TabInterface({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  className = ''
}: TabInterfaceProps): React.JSX.Element {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  // 制御コンポーネントとして動作: activeTabプロップが渡されたら、それを優先
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab)
    }
  }, [controlledActiveTab])

  const handleTabClick = (tabId: string) => {
    console.log('[TabInterface] Tab clicked:', tabId, 'current activeTab:', activeTab)
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    console.log('[TabInterface] Calling onTabChange callback')
    onTabChange?.(tabId)
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  // contentが提供されていない場合は、ヘッダーのみをレンダリング
  const hasContent = tabs.some(tab => tab.content !== undefined)

  if (!hasContent) {
    // ヘッダーのみモード
    return (
      <div className={`flex ${className}`} data-testid="tab-interface">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`tab-button-${tab.id}`}
            data-active={activeTab === tab.id ? 'true' : 'false'}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 relative z-10 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  // フルモード（ヘッダー+コンテンツ）
  return (
    <div className={`flex flex-col h-full border rounded-lg ${className}`}>
      {/* タブヘッダー */}
      <div className="flex border-b flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="p-2 flex-grow flex flex-col overflow-hidden">
        <div className="overflow-y-auto">
          {activeTabContent}
        </div>
      </div>
    </div>
  )
}