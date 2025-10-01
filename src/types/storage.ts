/**
 * ストレージ関連の型定義
 */

import type { Evaluation } from './evaluation'

/**
 * 包括的評価データ（Date型含む）
 */
export interface ComprehensiveEvaluation extends Evaluation {
  id: string
  createdAt: Date
  updatedAt: Date
  physical?: { evaluatedAt: Date; [key: string]: unknown }
  mental?: { evaluatedAt: Date; [key: string]: unknown }
  environmental?: { evaluatedAt: Date; [key: string]: unknown }
  hazard?: { evaluatedAt: Date; [key: string]: unknown }
  workTime?: { evaluatedAt: Date; [key: string]: unknown }
  totalScore?: number
  status?: 'completed' | 'in_progress' | 'not_started'
}

/**
 * 評価サマリー
 */
export interface EvaluationSummary {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  averageScore: number
  latestEvaluations: ComprehensiveEvaluation[]
}

/**
 * 評価ストレージインターフェース
 */
export interface IEvaluationStorage {
  save(evaluation: ComprehensiveEvaluation): Promise<string>
  get(id: string): Promise<ComprehensiveEvaluation | null>
  getAll(): Promise<ComprehensiveEvaluation[]>
  update(id: string, updates: Partial<ComprehensiveEvaluation>): Promise<void>
  delete(id: string): Promise<void>
  getSummary(): Promise<EvaluationSummary>
}
