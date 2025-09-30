'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { WorkItem } from './EvaluationListView'

interface EvaluationEditModalProps {
  workItem: WorkItem
  isOpen: boolean
  onClose: () => void
  onSave: (updatedItem: WorkItem) => void
}

export function EvaluationEditModal({
  workItem,
  isOpen,
  onClose,
  onSave
}: EvaluationEditModalProps) {
  const { checkPermission } = useAuth()
  const [editedItem, setEditedItem] = useState<WorkItem>(workItem)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 実際の実装では API 呼び出しを行う
      await new Promise(resolve => setTimeout(resolve, 1000)) // デモ用の遅延
      onSave(editedItem)
      onClose()
    } catch (error) {
      console.error('保存に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (newStatus: WorkItem['status']) => {
    setEditedItem(prev => ({ ...prev, status: newStatus }))
  }

  const getStatusColor = (status: WorkItem['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canEdit = checkPermission('canEdit')
  const canCheck = checkPermission('canCheck')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>評価編集</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  基本情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      作業名
                    </label>
                    <input
                      type="text"
                      value={editedItem.workName}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, workName: e.target.value }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      工場名
                    </label>
                    <input
                      type="text"
                      value={editedItem.factoryName}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, factoryName: e.target.value }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      工程名
                    </label>
                    <input
                      type="text"
                      value={editedItem.processName}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, processName: e.target.value }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ステータス
                    </label>
                    <select
                      value={editedItem.status}
                      onChange={(e) => handleStatusChange(e.target.value as WorkItem['status'])}
                      disabled={!canEdit && !canCheck}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="draft">下書き</option>
                      <option value="reviewed">レビュー済み</option>
                      <option value="completed">完了</option>
                      <option value="archived">アーカイブ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 評価スコア */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  評価スコア
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      肉体因子
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem.physicalScore}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, physicalScore: parseInt(e.target.value) || 0 }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      精神因子
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem.mentalScore}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, mentalScore: parseInt(e.target.value) || 0 }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      環境因子
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem.environmentalScore}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, environmentalScore: parseInt(e.target.value) || 0 }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      危険因子
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editedItem.hazardScore}
                      onChange={(e) => setEditedItem(prev => ({ ...prev, hazardScore: parseInt(e.target.value) || 0 }))}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* 総合評価 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  総合評価
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      きつさスコア
                    </label>
                    <div className={`px-3 py-2 rounded-md font-semibold ${
                      editedItem.kitsusaScore >= 7 ? 'bg-red-100 text-red-800' :
                      editedItem.kitsusaScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {editedItem.kitsusaScore}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      3K指数
                    </label>
                    <div className={`px-3 py-2 rounded-md font-semibold ${
                      editedItem.threekIndex === 'A' ? 'bg-red-100 text-red-800' :
                      editedItem.threekIndex === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {editedItem.threekIndex}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      現在のステータス
                    </label>
                    <div className={`px-3 py-2 rounded-md font-semibold text-center ${getStatusColor(editedItem.status)}`}>
                      {editedItem.status === 'draft' ? '下書き' :
                       editedItem.status === 'reviewed' ? 'レビュー済み' :
                       editedItem.status === 'completed' ? '完了' :
                       editedItem.status === 'archived' ? 'アーカイブ' : editedItem.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                
                <PermissionGuard 
                  requiredPermission={editedItem.status === 'draft' ? 'canEdit' : 'canCheck'}
                  fallback={null}
                  showMessage={false}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}