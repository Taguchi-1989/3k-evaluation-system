'use client'

import { useState, ReactNode } from 'react'

export interface Tab {
  id: string
  label: string
  content?: ReactNode
  icon?: ReactNode
}

export interface TabInterfaceProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export function TabInterface({
  tabs,
  defaultTab,
  onTabChange,
  className = ''
}: TabInterfaceProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

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