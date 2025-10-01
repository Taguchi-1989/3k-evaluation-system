'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { WorkItem } from '@/components/evaluation/EvaluationListView'
import Link from 'next/link'

interface ReportsDashboardProps {
  workItems: WorkItem[]
  className?: string
}

export function ReportsDashboard({ workItems, className = '' }: ReportsDashboardProps) {
  const [selectedWorkItems, setSelectedWorkItems] = useState<string[]>([])

  // レポート生成統計
  const reportsStats = {
    totalGenerated: 23,
    thisMonth: 8,
    downloaded: 67,
    avgPerReport: 2.9
  }

  // 最近生成されたレポート（サンプルデータ）
  const recentReports = [
    {
      id: 'report_001',
      title: '組立作業A - 3K評価レポート',
      workName: '組立作業A',
      generatedAt: new Date(Date.now() - 86400000),
      format: 'PDF',
      downloads: 5
    },
    {
      id: 'report_002',
      title: 'メンテナンス作業C - 詳細レポート',
      workName: 'メンテナンス作業C',
      generatedAt: new Date(Date.now() - 172800000),
      format: 'HTML',
      downloads: 3
    },
    {
      id: 'report_003',
      title: '溶接作業F - 管理者向けレポート',
      workName: '溶接作業F',
      generatedAt: new Date(Date.now() - 259200000),
      format: 'PDF',
      downloads: 8
    }
  ]

  const toggleWorkItemSelection = (itemId: string) => {
    setSelectedWorkItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAllWorkItems = () => {
    if (selectedWorkItems.length === workItems.length) {
      setSelectedWorkItems([])
    } else {
      setSelectedWorkItems(workItems.map(item => item.id))
    }
  }

  const handleBulkReportGeneration = () => {
    if (selectedWorkItems.length === 0) {
      alert('レポートを生成する作業を選択してください')
      return
    }
    
    // 複数レポート生成のロジック（実装に応じて）
    alert(`${selectedWorkItems.length}件の作業のレポート生成を開始します`)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* レポート統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{reportsStats.totalGenerated}</div>
          <div className="text-sm text-gray-600">総レポート数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{reportsStats.thisMonth}</div>
          <div className="text-sm text-gray-600">今月の生成</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{reportsStats.downloaded}</div>
          <div className="text-sm text-gray-600">総DL数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{reportsStats.avgPerReport}</div>
          <div className="text-sm text-gray-600">平均DL数</div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
        
        <div className="flex flex-wrap gap-3">
          <Link href="/reports">
            <Button variant="primary">
              📊 新規レポート生成
            </Button>
          </Link>
          
          <Link href="/reports?tab=history">
            <Button variant="outline">
              📋 レポート履歴
            </Button>
          </Link>
          
          <Link href="/reports?tab=templates">
            <Button variant="outline">
              📄 テンプレート管理
            </Button>
          </Link>
          
          <Button 
            variant="ghost"
            onClick={handleBulkReportGeneration}
            disabled={selectedWorkItems.length === 0}
          >
            📦 一括レポート生成 
            {selectedWorkItems.length > 0 && `(${selectedWorkItems.length})`}
          </Button>
        </div>
      </div>

      {/* 最近のレポート */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">最近生成されたレポート</h2>
          <Link href="/reports?tab=history">
            <Button variant="ghost" size="sm">
              すべて表示 →
            </Button>
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentReports.map(report => (
            <div key={report.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{report.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{report.generatedAt.toLocaleDateString('ja-JP')}</span>
                  <span>•</span>
                  <span>{report.format}</span>
                  <span>•</span>
                  <span>{report.downloads}回DL</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  ダウンロード
                </Button>
                <Button variant="ghost" size="sm">
                  再生成
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 作業選択とレポート生成 */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">作業選択レポート生成</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedWorkItems.length}/{workItems.length}選択
            </span>
            <Button variant="outline" size="sm" onClick={selectAllWorkItems}>
              {selectedWorkItems.length === workItems.length ? '全選択解除' : 'すべて選択'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {workItems.map(item => (
            <div 
              key={item.id}
              className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                selectedWorkItems.includes(item.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleWorkItemSelection(item.id)}
            >
              <input
                type="checkbox"
                checked={selectedWorkItems.includes(item.id)}
                onChange={() => toggleWorkItemSelection(item.id)}
                className="mr-3"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-sm">{item.workName}</span>
                  <span className="text-xs text-gray-500">{item.factoryName}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.threekIndex === 'A' ? 'bg-red-100 text-red-700' :
                    item.threekIndex === 'B' ? 'bg-orange-100 text-orange-700' :
                    item.threekIndex === 'C' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    3K指数: {item.threekIndex}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status === 'completed' ? '完了' :
                     item.status === 'reviewed' ? 'レビュー済み' : '下書き'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedWorkItems.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {selectedWorkItems.length}件の作業が選択されています
                </p>
                <p className="text-xs text-blue-600">
                  一括でレポートを生成するか、個別に処理を選択できます
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  個別生成
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleBulkReportGeneration}
                >
                  一括生成
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* レポート機能の説明 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">レポート機能について</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">📊 レポートの種類</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 標準レポート: 基本的な評価結果と推奨事項</li>
              <li>• 詳細レポート: マトリクス計算詳細を含む技術的レポート</li>
              <li>• 管理者レポート: エグゼクティブサマリー中心</li>
              <li>• カスタムレポート: 組織固有の要件に対応</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">🔧 利用できる機能</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF/HTML/Word形式での出力</li>
              <li>• チャートとグラフの自動生成</li>
              <li>• 履歴データとトレンド分析</li>
              <li>• 複数作業の一括レポート生成</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start">
            <span className="mr-2 mt-0.5">💡</span>
            <div className="text-sm">
              <p className="font-medium text-yellow-800">ヒント</p>
              <p className="text-yellow-700">
                レポート生成には数秒から数分かかる場合があります。
                生成完了後はダウンロードリンクが表示され、履歴からも再ダウンロードできます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}