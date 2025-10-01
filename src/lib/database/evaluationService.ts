import { supabase } from '@/lib/supabase'
import type { WorkItem } from '@/components/evaluation/EvaluationListView'

export interface SavedEvaluation {
  id: string
  work_name: string
  factory_name: string
  process_name: string
  photo_url?: string
  kitsusa_score: number
  threek_index: string
  physical_score: number
  mental_score: number
  environmental_score: number
  hazard_score: number
  time_category: string
  status: 'draft' | 'completed' | 'reviewed' | 'archived'
  evaluation_data: Record<string, any>
  user_id: string
  created_at: string
  updated_at: string
}

export class EvaluationService {
  // 評価データを保存
  async saveEvaluation(workItem: WorkItem, userId: string): Promise<string> {
    const evaluationData = {
      work_name: workItem.workName,
      factory_name: workItem.factoryName,
      process_name: workItem.processName,
      photo_url: workItem.photoUrl,
      kitsusa_score: workItem.kitsusaScore,
      threek_index: workItem.threekIndex,
      physical_score: workItem.physicalScore,
      mental_score: workItem.mentalScore,
      environmental_score: workItem.environmentalScore,
      hazard_score: workItem.hazardScore,
      time_category: workItem.timeCategory,
      status: workItem.status,
      evaluation_data: {
        // 詳細データをJSONBで保存
        rawData: workItem,
        timestamp: new Date().toISOString()
      },
      user_id: userId,
      updated_at: new Date().toISOString()
    }

    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    if (workItem.id && workItem.id !== 'new') {
      // 既存データの更新
      const { data, error } = await supabase
        .from('evaluations')
        .update(evaluationData)
        .eq('id', workItem.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data.id
    } else {
      // 新規データの作成
      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          ...evaluationData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    }
  }

  // 評価データを取得
  async getEvaluation(id: string, userId: string): Promise<SavedEvaluation | null> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  // ユーザーの評価データ一覧を取得
  async getUserEvaluations(userId: string): Promise<SavedEvaluation[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // 評価データを削除
  async deleteEvaluation(id: string, userId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    return true
  }

  // WorkItemに変換
  convertToWorkItem(saved: SavedEvaluation): WorkItem {
    return {
      id: saved.id,
      workName: saved.work_name,
      factoryName: saved.factory_name,
      processName: saved.process_name,
      photoUrl: saved.photo_url || '',
      kitsusaScore: saved.kitsusa_score,
      threekIndex: saved.threek_index,
      physicalScore: saved.physical_score,
      mentalScore: saved.mental_score,
      environmentalScore: saved.environmental_score,
      hazardScore: saved.hazard_score,
      timeCategory: saved.time_category,
      status: saved.status
    }
  }

  // 評価結果の統計を取得
  async getEvaluationStats(userId: string): Promise<{
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
  }> {
    const evaluations = await this.getUserEvaluations(userId)
    
    const stats = {
      total: evaluations.length,
      byStatus: {} as Record<string, number>,
      byThreekIndex: {} as Record<string, number>,
      averageScores: {
        physical: 0,
        mental: 0,
        environmental: 0,
        hazard: 0,
        kitsusa: 0
      }
    }

    if (evaluations.length === 0) return stats

    // ステータス別集計
    evaluations.forEach(evaluation => {
      stats.byStatus[evaluation.status] = (stats.byStatus[evaluation.status] || 0) + 1
      stats.byThreekIndex[evaluation.threek_index] = (stats.byThreekIndex[evaluation.threek_index] || 0) + 1
    })

    // 平均スコア計算
    const totalPhysical = evaluations.reduce((sum, evaluation) => sum + evaluation.physical_score, 0)
    const totalMental = evaluations.reduce((sum, evaluation) => sum + evaluation.mental_score, 0)
    const totalEnvironmental = evaluations.reduce((sum, evaluation) => sum + evaluation.environmental_score, 0)
    const totalHazard = evaluations.reduce((sum, evaluation) => sum + evaluation.hazard_score, 0)
    const totalKitsusa = evaluations.reduce((sum, evaluation) => sum + evaluation.kitsusa_score, 0)

    stats.averageScores = {
      physical: Math.round((totalPhysical / evaluations.length) * 10) / 10,
      mental: Math.round((totalMental / evaluations.length) * 10) / 10,
      environmental: Math.round((totalEnvironmental / evaluations.length) * 10) / 10,
      hazard: Math.round((totalHazard / evaluations.length) * 10) / 10,
      kitsusa: Math.round((totalKitsusa / evaluations.length) * 10) / 10
    }

    return stats
  }
}

export const evaluationService = new EvaluationService()