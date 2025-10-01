import { useState, useEffect } from 'react'
import { evaluationService } from '@/lib/database/evaluationService'
import type { WorkItem } from '@/components/evaluation/EvaluationListView'
import { useAuth } from '@/contexts/AuthContext'

export interface UseEvaluationDataReturn {
  evaluations: WorkItem[]
  isLoading: boolean
  error: string | null
  saveEvaluation: (workItem: WorkItem) => Promise<string>
  deleteEvaluation: (id: string) => Promise<boolean>
  refreshData: () => Promise<void>
  stats: {
    total: number
    byStatus: Record<string, number>
    byThreekIndex: Record<string, number>
    averageScores: {
      physical: number
      mental: number
      environmental: number
      hazard: number
      kitsusa: number
    }
  }
}

export function useEvaluationData(): UseEvaluationDataReturn {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<WorkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byThreekIndex: {},
    averageScores: {
      physical: 0,
      mental: 0,
      environmental: 0,
      hazard: 0,
      kitsusa: 0
    }
  })

  const loadEvaluations = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [savedEvaluations, evaluationStats] = await Promise.all([
        evaluationService.getUserEvaluations(user.id),
        evaluationService.getEvaluationStats(user.id)
      ])

      const workItems = savedEvaluations.map(saved => 
        evaluationService.convertToWorkItem(saved)
      )

      setEvaluations(workItems)
      setStats(evaluationStats)
    } catch (err) {
      console.error('Failed to load evaluations:', err)
      setError(err instanceof Error ? err.message : '評価データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const saveEvaluation = async (workItem: WorkItem): Promise<string> => {
    if (!user?.id) {
      throw new Error('ユーザーが認証されていません')
    }

    try {
      const savedId = await evaluationService.saveEvaluation(workItem, user.id)
      
      // データを再読み込み
      await loadEvaluations()
      
      return savedId
    } catch (err) {
      console.error('Failed to save evaluation:', err)
      throw new Error(err instanceof Error ? err.message : '評価データの保存に失敗しました')
    }
  }

  const deleteEvaluation = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('ユーザーが認証されていません')
    }

    try {
      const success = await evaluationService.deleteEvaluation(id, user.id)
      
      if (success) {
        // データを再読み込み
        await loadEvaluations()
      }
      
      return success
    } catch (err) {
      console.error('Failed to delete evaluation:', err)
      throw new Error(err instanceof Error ? err.message : '評価データの削除に失敗しました')
    }
  }

  const refreshData = async () => {
    await loadEvaluations()
  }

  useEffect(() => {
    void loadEvaluations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return {
    evaluations,
    isLoading,
    error,
    saveEvaluation,
    deleteEvaluation,
    refreshData,
    stats
  }
}