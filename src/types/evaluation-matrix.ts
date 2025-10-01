/**
 * 評価マトリックスの型定義
 */

/** スコアカラーマッピング */
export type ScoreColors = Record<string, string>

/** スコアラベルマッピング */
export type ScoreLabels = Record<string, string>

/**
 * OWAS評価マトリックス型
 */
export interface OWASMatrixData {
  name: string
  description: string
  backPostures: string[]
  armPostures: string[]
  legPostures: string[]
  loadLevels: string[]
  matrix: Record<string, Record<string, number[][]>>
  scoreLabels: ScoreLabels
  scoreColors: ScoreColors
}

/**
 * RULA評価マトリックス型
 */
export interface RULAMatrixData {
  name: string
  description: string
  rows: string[]
  columns: string[]
  matrix: number[][]
  scoreLabels: ScoreLabels
  scoreColors: ScoreColors
}

/**
 * 総合評価マトリックス型
 */
export interface ComprehensiveMatrixData {
  name: string
  description: string
  postureGroups: string[]
  durationLevels: string[]
  strengthLevels: string[]
  matrix: Record<string, Record<string, number[]>>
  scoreColors: ScoreColors
}

/**
 * 評価マトリックス全体の型
 */
export interface EvaluationMatrixData {
  COMPREHENSIVE: ComprehensiveMatrixData
  RULA: RULAMatrixData
  OWAS: OWASMatrixData
}
