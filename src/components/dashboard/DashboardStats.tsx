'use client'

import { WorkItem } from '@/components/evaluation/EvaluationListView'
import { ThumbnailOptimizedImage } from '@/components/optimized/OptimizedImage'

export interface DashboardStatsProps {
  workItems: WorkItem[]
  className?: string
}

export function DashboardStats({ workItems, className = '' }: DashboardStatsProps) {
  // 統計計算
  const totalItems = workItems.length
  const highRiskItems = workItems.filter(item => item.kitsusaScore >= 7).length
  const mediumRiskItems = workItems.filter(item => item.kitsusaScore >= 4 && item.kitsusaScore < 7).length
  const completedItems = workItems.filter(item => item.status === 'completed').length
  const averageKitsusaScore = workItems.reduce((sum, item) => sum + item.kitsusaScore, 0) / totalItems

  // 因子別平均
  const avgPhysical = workItems.reduce((sum, item) => sum + item.physicalScore, 0) / totalItems
  const avgMental = workItems.reduce((sum, item) => sum + item.mentalScore, 0) / totalItems
  const avgEnvironmental = workItems.reduce((sum, item) => sum + item.environmentalScore, 0) / totalItems
  const avgHazard = workItems.reduce((sum, item) => sum + item.hazardScore, 0) / totalItems

  // 最もリスクの高い作業
  const highestRiskWork = workItems.reduce((prev, current) => 
    prev.kitsusaScore > current.kitsusaScore ? prev : current
  )

  // 工場別統計
  const factoryStats = [...new Set(workItems.map(item => item.factoryName))].map(factory => {
    const factoryItems = workItems.filter(item => item.factoryName === factory)
    return {
      name: factory,
      count: factoryItems.length,
      avgScore: factoryItems.reduce((sum, item) => sum + item.kitsusaScore, 0) / factoryItems.length,
      highRiskCount: factoryItems.filter(item => item.kitsusaScore >= 7).length
    }
  })

  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-orange-600'
    if (score >= 2) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskBadge = (level: string, count: number) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    
    return (
      <div className={`px-3 py-2 rounded-lg border ${colors[level as keyof typeof colors]}`}>
        <div className="text-xs font-medium">{level === 'high' ? '高リスク' : level === 'medium' ? '中リスク' : '低リスク'}</div>
        <div className="text-lg font-bold">{count}件</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 新規評価作成ボタン */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          新規評価作成
        </button>
      </div>

      {/* 概要統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-gray-600">総作業数</div>
          <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">
            完了: {completedItems}件 ({Math.round((completedItems/totalItems)*100)}%)
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-gray-600">平均キツさスコア</div>
          <div className={`text-3xl font-bold ${getScoreColor(averageKitsusaScore)}`}>
            {averageKitsusaScore.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            改善推奨: {highRiskItems + mediumRiskItems}件
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-gray-600">高リスク作業</div>
          <div className="text-3xl font-bold text-red-600">{highRiskItems}</div>
          <div className="text-xs text-red-500 mt-1">
            7点以上 (緊急対応必要)
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-gray-600">対象工場数</div>
          <div className="text-3xl font-bold text-blue-600">{factoryStats.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            活動工場数
          </div>
        </div>
      </div>

      {/* リスクレベル別統計 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">リスクレベル分布</h3>
        <div className="grid grid-cols-3 gap-4">
          {getRiskBadge('high', highRiskItems)}
          {getRiskBadge('medium', mediumRiskItems)}
          {getRiskBadge('low', totalItems - highRiskItems - mediumRiskItems)}
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div 
              className="bg-red-500" 
              style={{ width: `${(highRiskItems/totalItems)*100}%` }}
            ></div>
            <div 
              className="bg-orange-500" 
              style={{ width: `${(mediumRiskItems/totalItems)*100}%` }}
            ></div>
            <div 
              className="bg-green-500" 
              style={{ width: `${((totalItems - highRiskItems - mediumRiskItems)/totalItems)*100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 因子別平均スコア */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">因子別平均スコア</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">肉体因</div>
            <div className={`text-2xl font-bold ${getScoreColor(avgPhysical)}`}>
              {avgPhysical.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(avgPhysical/10)*100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">精神因</div>
            <div className={`text-2xl font-bold ${getScoreColor(avgMental)}`}>
              {avgMental.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${(avgMental/10)*100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">環境因</div>
            <div className={`text-2xl font-bold ${getScoreColor(avgEnvironmental)}`}>
              {avgEnvironmental.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(avgEnvironmental/10)*100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">危険因</div>
            <div className={`text-2xl font-bold ${getScoreColor(avgHazard)}`}>
              {avgHazard.toFixed(1)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(avgHazard/10)*100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 最高リスク作業の詳細 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">最高リスク作業</h3>
        <div className="flex items-center gap-4">
          <ThumbnailOptimizedImage
            src={highestRiskWork.photoUrl}
            alt="最高リスク作業"
            width={80}
            height={80}
            className="dashboard-photo rounded-lg"
          />
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-900">{highestRiskWork.workName}</h4>
            <p className="text-sm text-gray-600">
              {highestRiskWork.factoryName} - {highestRiskWork.processName}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-lg font-bold ${getScoreColor(highestRiskWork.kitsusaScore)}`}>
                キツさスコア: {highestRiskWork.kitsusaScore}点
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                highestRiskWork.kitsusaScore >= 7 ? 'bg-red-100 text-red-800' :
                highestRiskWork.kitsusaScore >= 4 ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                3K指数: {highestRiskWork.threekIndex}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
          <div className="text-center">
            <div className="text-gray-600">肉体因</div>
            <div className="font-semibold">{highestRiskWork.physicalScore}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">精神因</div>
            <div className="font-semibold">{highestRiskWork.mentalScore}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">環境因</div>
            <div className="font-semibold">{highestRiskWork.environmentalScore}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">危険因</div>
            <div className="font-semibold">{highestRiskWork.hazardScore}</div>
          </div>
        </div>
      </div>

      {/* 工場別統計 */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">工場別統計</h3>
        <div className="space-y-3">
          {factoryStats.map((factory, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-grow">
                <h4 className="font-medium text-gray-900">{factory.name}</h4>
                <div className="text-sm text-gray-600">
                  作業数: {factory.count}件 | 高リスク: {factory.highRiskCount}件
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(factory.avgScore)}`}>
                  {factory.avgScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">平均スコア</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}