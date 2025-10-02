'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Header, Footer } from '@/components/layout'
import type { Tab } from '@/components/ui/TabInterface';
import { TabInterface } from '@/components/ui/TabInterface'
import type { WorkItem } from '@/components/evaluation/EvaluationListView';
import { EvaluationListView } from '@/components/evaluation/EvaluationListView'
import { DashboardCharts } from './DashboardCharts'
import { DashboardStats } from './DashboardStats'
import { ReportsDashboard } from './ReportsDashboard'
import { useDatabase } from '@/hooks/useDatabase'
import type { Evaluation } from '@/types/evaluation'

export interface EnhancedDashboardProps {
  workItems?: WorkItem[]
}

const defaultWorkItems: WorkItem[] = [
  {
    id: '1',
    workName: '組立作業A',
    factoryName: '第1工場',
    processName: '組立工程',
    photoUrl: 'https://placehold.co/400x300/e5e7eb/4b5563?text=Assembly+Work',
    kitsusaScore: 7,
    threekIndex: 'A',
    physicalScore: 6,
    mentalScore: 4,
    environmentalScore: 2,
    hazardScore: 3,
    timeCategory: 'd',
    status: 'completed'
  },
  {
    id: '2',
    workName: '検査作業B',
    factoryName: '第2工場', 
    processName: '検査工程',
    photoUrl: 'https://placehold.co/400x300/f3f4f6/6b7280?text=Inspection+Work',
    kitsusaScore: 5,
    threekIndex: 'B',
    physicalScore: 2,
    mentalScore: 5,
    environmentalScore: 1,
    hazardScore: 2,
    timeCategory: 'a',
    status: 'draft'
  },
  {
    id: '3',
    workName: 'メンテナンス作業C',
    factoryName: '第1工場',
    processName: '保守工程',
    photoUrl: 'https://placehold.co/400x300/fef3c7/d97706?text=Maintenance+Work',
    kitsusaScore: 9,
    threekIndex: 'A',
    physicalScore: 7,
    mentalScore: 6,
    environmentalScore: 4,
    hazardScore: 5,
    timeCategory: 'e',
    status: 'reviewed'
  },
  {
    id: '4',
    workName: '清掃作業D',
    factoryName: '第3工場',
    processName: '清掃工程',
    photoUrl: 'https://placehold.co/400x300/dbeafe/3b82f6?text=Cleaning+Work',
    kitsusaScore: 3,
    threekIndex: 'C',
    physicalScore: 3,
    mentalScore: 1,
    environmentalScore: 2,
    hazardScore: 1,
    timeCategory: 'c',
    status: 'completed'
  },
  {
    id: '5',
    workName: '運搬作業E',
    factoryName: '第2工場',
    processName: '運搬工程',
    photoUrl: 'https://placehold.co/400x300/dcfce7/16a34a?text=Transport+Work',
    kitsusaScore: 6,
    threekIndex: 'B',
    physicalScore: 6,
    mentalScore: 2,
    environmentalScore: 3,
    hazardScore: 2,
    timeCategory: 'b',
    status: 'completed'
  },
  {
    id: '6',
    workName: '溶接作業F',
    factoryName: '第1工場',
    processName: '溶接工程',
    photoUrl: 'https://placehold.co/400x300/fecaca/dc2626?text=Welding+Work',
    kitsusaScore: 8,
    threekIndex: 'A',
    physicalScore: 5,
    mentalScore: 3,
    environmentalScore: 6,
    hazardScore: 7,
    timeCategory: 'd',
    status: 'completed'
  },
  {
    id: '7',
    workName: '機械操作G',
    factoryName: '第3工場',
    processName: '加工工程',
    photoUrl: 'https://placehold.co/400x300/e0e7ff/4338ca?text=Machine+Operation',
    kitsusaScore: 4,
    threekIndex: 'B',
    physicalScore: 3,
    mentalScore: 4,
    environmentalScore: 2,
    hazardScore: 3,
    timeCategory: 'c',
    status: 'draft'
  },
  {
    id: '8',
    workName: '品質管理H',
    factoryName: '第2工場',
    processName: '品質管理工程',
    photoUrl: 'https://placehold.co/400x300/f0f9ff/0ea5e9?text=Quality+Control',
    kitsusaScore: 2,
    threekIndex: 'D',
    physicalScore: 1,
    mentalScore: 2,
    environmentalScore: 1,
    hazardScore: 1,
    timeCategory: 'a',
    status: 'completed'
  }
]

const convertEvaluationToWorkItem = (evaluation: Evaluation): WorkItem => {
  // Evaluation型にはphysicalFactor等が無いため、暫定値を使用
  // 実際のスコアはfinalScoreKitsusaから算出
  const kitsusaScore = evaluation.finalScoreKitsusa ?? 0
  const estimatedIndividualScore = Math.floor(kitsusaScore / 4) // 4因子の平均値として推定

  return {
    id: evaluation.id,
    workName: evaluation.workName || '未設定',
    factoryName: evaluation.factoryName || '未設定',
    processName: evaluation.processName || '未設定',
    photoUrl: evaluation.mainPhotoUrl || 'https://placehold.co/400x300/e5e7eb/4b5563?text=Work+Item',
    kitsusaScore,
    threekIndex: evaluation.finalScore3K || 'C',
    physicalScore: estimatedIndividualScore,
    mentalScore: estimatedIndividualScore,
    environmentalScore: estimatedIndividualScore,
    hazardScore: estimatedIndividualScore,
    timeCategory: 'c', // 暫定値
    status: (evaluation.status as 'draft' | 'completed' | 'reviewed' | 'archived') || 'draft'
  }
}

export function EnhancedDashboard({ workItems }: EnhancedDashboardProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('overview')
  const [_evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [displayWorkItems, setDisplayWorkItems] = useState<WorkItem[]>(workItems || defaultWorkItems)
  const database = useDatabase()

  const handleTabChange = useCallback((tabId: string): void => {
    console.log('Tab change requested:', tabId)
    setActiveTab(tabId)
  }, [])

  // データベースから評価データを読み込み
  useEffect(() => {
    const loadEvaluations = async (): Promise<void> => {
      try {
        const data = await database.listEvaluations()
        setEvaluations(data)

        // データベースに評価データがある場合は、それを WorkItem 形式に変換
        if (data.length > 0) {
          const workItemsFromDB = data.map(convertEvaluationToWorkItem)
          setDisplayWorkItems(workItemsFromDB)
        } else {
          // データベースが空の場合はサンプルデータを使用
          setDisplayWorkItems(workItems || defaultWorkItems)
        }
      } catch (error) {
        console.error('評価データの読み込みに失敗しました:', error)
        // エラー時はサンプルデータを使用
        setDisplayWorkItems(workItems || defaultWorkItems)
      }
    }

    void loadEvaluations()
  }, [database, workItems])

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: '概要統計',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'charts',
      label: 'グラフ分析',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'list',
      label: '作業一覧',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'レポート',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ]

  const handleItemSelect = useCallback((_itemId: string): void => {
    // Handle item selection
    // 詳細画面への遷移などの処理
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats workItems={displayWorkItems} className="p-6" />

      case 'charts':
        return <DashboardCharts workItems={displayWorkItems} className="p-6 chart" />

      case 'list':
        return (
          <div className="p-6">
            <EvaluationListView
              workItems={displayWorkItems}
              onItemSelect={handleItemSelect}
            />
          </div>
        )

      case 'reports':
        return <ReportsDashboard workItems={displayWorkItems} className="p-6" />

      default:
        return <DashboardStats workItems={displayWorkItems} className="p-6" />
    }
  }

  return (
    <div className="aspect-container">
      <Header
        variant="app"
        title="ダッシュボード"
        actions={
          <div data-testid="stats-summary" className="stats-card flex items-center gap-3 stats">
            <div data-testid="factory-stats" className="text-sm">
              <span className="text-gray-500">総作業数:</span>
              <span className="font-semibold text-gray-800 ml-1">{displayWorkItems.length}</span>
            </div>
            <div data-testid="risk-summary" className="text-sm">
              <span className="text-gray-500">高リスク:</span>
              <span className="font-semibold text-red-600 ml-1">
                {displayWorkItems.filter(item => item.kitsusaScore >= 7).length}
              </span>
            </div>
            {database.isLoading && (
              <div className="text-sm text-blue-600">
                データ読み込み中...
              </div>
            )}
          </div>
        }
      />

      <main className="flex-grow overflow-hidden bg-gray-100">
        <div className="h-full flex flex-col">
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <TabInterface
              tabs={tabs}
              defaultTab="overview"
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
          
          <div className="flex-grow overflow-auto work-list">
            {renderTabContent()}
          </div>
        </div>
      </main>

      <Footer
        variant="app"
      />
    </div>
  )
}