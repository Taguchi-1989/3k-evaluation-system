'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
// 将来実装予定: アクションボタン追加時に使用
// import { Button } from '@/components/ui'
import { EvaluationEditModal } from './EvaluationEditModal'
import { useAuth } from '@/contexts/AuthContext'
import { useEvaluationData } from '@/hooks/useEvaluationData'

export interface WorkItem {
  id: string
  workName: string
  factoryName: string
  processName: string
  photoUrl: string
  kitsusaScore: number
  threekIndex: string
  physicalScore: number
  mentalScore: number
  environmentalScore: number
  hazardScore: number
  timeCategory: string
  status: 'draft' | 'completed' | 'reviewed' | 'archived'
}

export interface EvaluationListViewProps {
  workItems?: WorkItem[]
  onItemSelect?: (itemId: string) => void
}

const defaultWorkItems: WorkItem[] = [
  {
    id: '1',
    workName: '組立作業A',
    factoryName: '第1工場',
    processName: '組立工程',
    photoUrl: 'https://placehold.co/400x300/e5e7eb/4b5563?text=Work+Photo',
    kitsusaScore: 7,
    threekIndex: 'IV',
    physicalScore: 4,
    mentalScore: 2,
    environmentalScore: 1,
    hazardScore: 0,
    timeCategory: 'd',
    status: 'completed'
  },
  {
    id: '2',
    workName: '検査作業B',
    factoryName: '第2工場', 
    processName: '検査工程',
    photoUrl: 'https://placehold.co/400x300/f3f4f6/6b7280?text=Work+Photo+2',
    kitsusaScore: 3,
    threekIndex: 'II',
    physicalScore: 1,
    mentalScore: 3,
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
    photoUrl: 'https://placehold.co/400x300/fef3c7/d97706?text=Work+Photo+3',
    kitsusaScore: 9,
    threekIndex: 'V',
    physicalScore: 5,
    mentalScore: 4,
    environmentalScore: 3,
    hazardScore: 4,
    timeCategory: 'e',
    status: 'reviewed'
  },
  {
    id: '4',
    workName: '清掃作業D',
    factoryName: '第3工場',
    processName: '清掃工程',
    photoUrl: 'https://placehold.co/400x300/dbeafe/3b82f6?text=Work+Photo+4',
    kitsusaScore: 4,
    threekIndex: 'II',
    physicalScore: 2,
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
    photoUrl: 'https://placehold.co/400x300/dcfce7/16a34a?text=Work+Photo+5',
    kitsusaScore: 6,
    threekIndex: 'III',
    physicalScore: 4,
    mentalScore: 1,
    environmentalScore: 2,
    hazardScore: 1,
    timeCategory: 'd',
    status: 'draft'
  },
  {
    id: '6',
    workName: '溶接作業F',
    factoryName: '第1工場',
    processName: '溶接工程',
    photoUrl: 'https://placehold.co/400x300/fed7d7/dc2626?text=Work+Photo+6',
    kitsusaScore: 11,
    threekIndex: 'V',
    physicalScore: 4,
    mentalScore: 3,
    environmentalScore: 4,
    hazardScore: 3,
    timeCategory: 'e',
    status: 'reviewed'
  },
  {
    id: '7',
    workName: '包装作業G',
    factoryName: '第3工場',
    processName: '包装工程',
    photoUrl: 'https://placehold.co/400x300/fef3c7/ca8a04?text=Work+Photo+7',
    kitsusaScore: 2,
    threekIndex: 'I',
    physicalScore: 1,
    mentalScore: 1,
    environmentalScore: 1,
    hazardScore: 0,
    timeCategory: 'b',
    status: 'completed'
  },
  {
    id: '8',
    workName: '塗装作業H',
    factoryName: '第2工場',
    processName: '塗装工程',
    photoUrl: 'https://placehold.co/400x300/e0e7ff/6366f1?text=Work+Photo+8',
    kitsusaScore: 8,
    threekIndex: 'IV',
    physicalScore: 3,
    mentalScore: 2,
    environmentalScore: 3,
    hazardScore: 2,
    timeCategory: 'd',
    status: 'draft'
  }
]

export function EvaluationListView({
  workItems = defaultWorkItems,
  onItemSelect
}: EvaluationListViewProps): React.JSX.Element {
  const { evaluations, isLoading, error, saveEvaluation, deleteEvaluation, refreshData: _refreshData } = useEvaluationData()  // refreshDataは将来実装予定
  const items = evaluations.length > 0 ? evaluations : workItems
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(items[0] || null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null)
  const [_isSaving, setIsSaving] = useState(false)  // 将来実装予定: 保存中インジケーター表示
  const { checkPermission } = useAuth()

  const handleItemClick = (item: WorkItem) => {
    setSelectedItem(item)
    onItemSelect?.(item.id)
  }

  const handleEditEvaluation = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item && (checkPermission('canEdit') || checkPermission('canCheck'))) {
      setEditingItem(item)
      setEditModalOpen(true)
    }
  }

  const handleSaveEvaluation = async (updatedItem: WorkItem) => {
    setIsSaving(true)
    try {
      await saveEvaluation(updatedItem)
      
      // 選択中のアイテムも更新
      if (selectedItem?.id === updatedItem.id) {
        setSelectedItem(updatedItem)
      }
    } catch (error) {
      console.error('評価の保存に失敗しました:', error)
      alert('評価の保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvaluation = async (itemId: string) => {
    if (!confirm('この評価を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      await deleteEvaluation(itemId)
      
      // 削除されたアイテムが選択中の場合、選択を解除
      if (selectedItem?.id === itemId) {
        setSelectedItem(items.find(item => item.id !== itemId) || null)
      }
    } catch (error) {
      console.error('評価の削除に失敗しました:', error)
      alert('評価の削除に失敗しました。もう一度お試しください。')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getThreekIndexColor = (index: string) => {
    switch (index) {
      case 'V':
        return 'text-red-600'
      case 'IV':
        return 'text-orange-600'
      case 'III':
        return 'text-yellow-600'
      case 'II':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  const handleFactorDetail = (factorType: string) => {
    switch (factorType) {
      case 'physical':
        window.location.href = '/evaluation/physical'
        break
      case 'mental':
        window.location.href = '/evaluation/mental'
        break
      case 'environmental':
        window.location.href = '/evaluation/environmental'
        break
      case 'hazard':
        window.location.href = '/evaluation/hazard'
        break
      case 'worktime':
        window.location.href = '/evaluation/worktime'
        break
      default:
        // Unknown factor type
    }
  }

  // 将来実装予定: 編集ページへの遷移ボタン
  const _handleNavigateToEdit = (itemId: string): void => {
    window.location.href = `/evaluation/edit/${itemId}`
  }

  // 将来実装予定: トップページへの戻るボタン
  const _handleBackToTop = (): void => {
    window.location.href = '/'
  }

  return (
    <div className="aspect-container">
      <Header
        variant="simple"
        title="評価画面"
        actions={
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100">権限設定</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100">閲覧者</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100">設定登録</button>
          </div>
        }
      />

      <section className="flex-grow p-3 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 h-full">
          
          {/* 左列: 作業リスト */}
          <div className="col-span-3 flex flex-col">
            <Card className="flex-grow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold">作業一覧</h2>
                  {isLoading && (
                    <div className="text-xs text-gray-500">読み込み中...</div>
                  )}
                  {error && (
                    <div className="text-xs text-red-500" title={error}>エラー</div>
                  )}
                </div>
                <div data-testid="work-list" className="space-y-1 overflow-y-auto max-h-full">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      data-testid={item.kitsusaScore >= 7 ? "high-risk-work-item" : "work-item"}
                      className={`p-1.5 rounded cursor-pointer transition-all text-xs ${
                        selectedItem?.id === item.id
                          ? 'evaluation-item-selected'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:evaluation-item-hover dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600'
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-bold text-xs truncate max-w-[120px]">{item.workName}</h3>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] px-1 py-0.5 rounded ${getStatusColor(item.status)}`}>
                            {item.status === 'completed' ? '完了' : 
                           item.status === 'draft' ? '下書' : 
                           item.status === 'reviewed' ? '査定' : 
                           item.status === 'archived' ? 'アーカイブ' : item.status}
                          </span>
                          <span className={`text-xs font-bold ${getThreekIndexColor(item.threekIndex)}`}>
                            {item.threekIndex}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-600 truncate">{item.factoryName} - {item.processName}</p>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-[10px] text-gray-500">キツさ: {item.kitsusaScore}</span>
                        <div className="flex gap-1">
                          {(checkPermission('canEdit') || checkPermission('canCheck')) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEvaluation(item.id)
                              }}
                              className="px-1 py-0.5 text-[8px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                            >
                              編集
                            </button>
                          )}
                          {checkPermission('canAdmin') && evaluations.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleDeleteEvaluation(item.id)
                              }}
                              className="px-1 py-0.5 text-[8px] text-red-600 hover:text-red-800 bg-transparent hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中央列: 写真 & 詳細 */}
          <div className="col-span-3 flex flex-col gap-3">
            <Card className="h-1/2">
              <CardContent className="p-2 flex flex-col items-center justify-center h-full">
                <h2 className="text-sm font-bold mb-2 w-full">写真</h2>
                <Image
                  src={selectedItem?.photoUrl || 'https://placehold.co/400x300/e5e7eb/4b5563?text=No+Photo'}
                  width={400}
                  height={300}
                  className="evaluation-photo rounded"
                  alt="関連写真"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </CardContent>
            </Card>
            
            <Card className="h-1/2">
              <CardContent className="p-2 flex flex-col h-full">
                <h2 className="text-sm font-bold mb-2">選択作業の詳細内訳</h2>
                {selectedItem && (
                  <div className="text-xs space-y-2 overflow-y-auto">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-1 border border-gray-200 rounded">
                        <div>
                          <span className="font-medium">肉体因:</span>
                          <span className="ml-1 text-green-600">{selectedItem.physicalScore}</span>
                        </div>
                        <button 
                          onClick={() => handleFactorDetail('physical')}
                          className="px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          詳細入力
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-1 border border-gray-200 rounded">
                        <div>
                          <span className="font-medium">精神因:</span>
                          <span className="ml-1 text-green-600">{selectedItem.mentalScore}</span>
                        </div>
                        <button 
                          onClick={() => handleFactorDetail('mental')}
                          className="px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          詳細入力
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-1 border border-gray-200 rounded">
                        <div>
                          <span className="font-medium">環境因:</span>
                          <span className="ml-1 text-yellow-600">{selectedItem.environmentalScore}</span>
                        </div>
                        <button 
                          onClick={() => handleFactorDetail('environmental')}
                          className="px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          詳細入力
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-1 border border-gray-200 rounded">
                        <div>
                          <span className="font-medium">危険因:</span>
                          <span className="ml-1 text-gray-500">{selectedItem.hazardScore}</span>
                        </div>
                        <button 
                          onClick={() => handleFactorDetail('hazard')}
                          className="px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          詳細入力
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between p-1 border border-gray-200 rounded">
                        <div>
                          <span className="font-medium">作業時間カテゴリ:</span>
                          <span className="ml-1 text-blue-600">{selectedItem.timeCategory}</span>
                        </div>
                        <button 
                          onClick={() => handleFactorDetail('worktime')}
                          className="px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          詳細入力
                        </button>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-medium">総合評価:</span>
                        <span className={`font-bold ${getThreekIndexColor(selectedItem.threekIndex)}`}>
                          {selectedItem.threekIndex} ({selectedItem.kitsusaScore})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右列: グラフエリア */}
          <div className="col-span-6 flex flex-col gap-3">
            <Card className="h-1/2">
              <CardContent className="p-2 flex flex-col h-full">
                <h2 className="text-sm font-bold mb-2">作業のキツさ累積</h2>
                <div className="flex-grow bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">グラフ表示エリア (Chart.js)</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="h-1/2">
              <CardContent className="p-2 flex flex-col h-full">
                <h2 className="text-sm font-bold mb-2">3K指数マップ (散布図)</h2>
                <div className="flex-grow bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500 text-sm">散布図表示エリア (Chart.js)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {editingItem && (
        <EvaluationEditModal
          workItem={editingItem}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingItem(null)
          }}
          onSave={(data) => { void handleSaveEvaluation(data) }}
        />
      )}

    </div>
  )
}