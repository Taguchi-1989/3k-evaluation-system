'use client'

import { Header } from '@/components/layout'
import { Card, CardContent, ThemeToggle } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/hooks/useNavigation'

export interface SummaryStats {
  totalWorks: number
  highRiskWorks: number
  completedWorks: number
  pendingWorks: number
}

export interface AppHomeProps {
  stats?: SummaryStats
  onNavigate?: (destination: string) => void
}

const defaultStats: SummaryStats = {
  totalWorks: 25,
  highRiskWorks: 3,
  completedWorks: 20,
  pendingWorks: 5
}

export function AppHome({
  stats = defaultStats,
  onNavigate
}: AppHomeProps) {
  const router = useRouter()
  const { navigateToNewEvaluation, navigateToEvaluationList, navigateToDashboard } = useNavigation()

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  const handleHelpClick = () => {
    router.push('/help')
  }
  
  const menuItems = [
    {
      id: 'new-evaluation',
      title: '新しい評価を作成',
      description: '作業の3K指数を評価します。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverColor: 'hover:bg-green-200'
    },
    {
      id: 'view-evaluations',
      title: '登録済み評価を確認',
      description: '過去に登録した評価結果を確認・編集します。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:bg-blue-200'
    },
    {
      id: 'dashboard',
      title: 'ダッシュボード',
      description: '登録済みの作業をグラフで分析します。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-200'
    },
    {
      id: 'physical-evaluation',
      title: '肉体因子評価',
      description: '身体的負荷を直接評価します。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:bg-orange-200'
    }
  ]

  const summaryCards = [
    {
      title: '登録済み作業数',
      value: stats.totalWorks,
      unit: '件',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: '要注意作業 (3K指数IV以上)',
      value: stats.highRiskWorks,
      unit: '件',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ]

  const handleItemClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId)
    } else {
      // Fallback to direct navigation if no onNavigate prop provided
      switch (itemId) {
        case 'new-evaluation':
          navigateToNewEvaluation()
          break
        case 'view-evaluations':
          navigateToEvaluationList()
          break
        case 'dashboard':
          navigateToDashboard()
          break
        case 'physical-evaluation':
          router.push('/evaluation/physical')
          break
        default:
          // Unknown navigation destination
      }
    }
  }

  return (
    <div className="aspect-container">
      <Header
        variant="app"
        actions={
          <div className="flex items-center gap-2">
            <ThemeToggle variant="button" size="sm" />
            <button 
              onClick={handleSettingsClick}
              className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              設定
            </button>
            <button 
              onClick={handleHelpClick}
              className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              ヘルプ
            </button>
          </div>
        }
      />

      <section className="flex-grow p-6 bg-gray-100 overflow-y-auto flex flex-col items-center">
        {/* システム概要セクション */}
        <div data-testid="system-overview" className="w-full max-w-4xl mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">3K評価システム</h1>
          <p className="text-gray-600">労働環境における3K指数（きつい・汚い・危険）を科学的に評価するシステム</p>
        </div>

        {/* メインメニュー */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              data-testid={`${item.id}-link`}
              className={`cursor-pointer transition-all duration-200 ${item.hoverColor} hover:shadow-lg`}
              onClick={() => handleItemClick(item.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`${item.bgColor} ${item.iconColor} p-3 rounded-full mx-auto mb-3 w-fit`}>
                  {item.icon}
                </div>
                <h2 className="font-bold text-gray-800 mb-1">{item.title}</h2>
                <p className="text-xs text-gray-500">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* サマリーカード */}
        <div data-testid="stats-summary" className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex items-center">
                <div className={`${card.bgColor} ${card.iconColor} p-2 rounded-full mr-3`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.title}</p>
                  <p className="text-xl font-bold text-gray-800">
                    {card.value}{card.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* お知らせ・最新情報 */}
        <div className="w-full max-w-4xl">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-800 mb-3">お知らせ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-700">システムメンテナンスのお知らせ</span>
                  <span className="text-xs text-gray-500">2024/12/01</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-700">新機能：AIによる自動評価機能を追加</span>
                  <span className="text-xs text-gray-500">2024/11/28</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-700">バージョン1.0.0リリース</span>
                  <span className="text-xs text-gray-500">2024/11/15</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  )
}