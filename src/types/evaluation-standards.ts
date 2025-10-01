/**
 * 評価基準データの型定義
 */

/** 評価閾値 */
export interface EvaluationThresholds {
  low: number
  medium: number
  high: number
  danger: number
}

/** 化学物質情報 */
export interface ChemicalSubstance {
  substance_name: string
  cas_number: string
  permissible_concentration: number
  unit: string
  evaluation_thresholds: EvaluationThresholds
}

/** 一般化学物質 */
export interface GeneralChemicals {
  standard_category: string
  standard_type: string
  substances: Record<string, ChemicalSubstance>
}

/** 化学物質基準 */
export interface ChemicalSubstances {
  general_chemicals: GeneralChemicals
  ammonia?: unknown // 将来の拡張用
}

/** RULAスコア範囲評価 */
export interface RulaScoreRange {
  level: string
  action_level: string
  description: string
}

/** RULAアセスメント */
export interface RulaAssessment {
  score_ranges: {
    '1_2': RulaScoreRange
    '3_4': RulaScoreRange
    '5_6': RulaScoreRange
    '7': RulaScoreRange
  }
}

/** OWASカテゴリ */
export interface OwasCategory {
  category: number
  action_level: string
  description: string
}

/** OWASアセスメント */
export interface OwasAssessment {
  categories: {
    '1': OwasCategory
    '2': OwasCategory
    '3': OwasCategory
    '4': OwasCategory
  }
}

/** 物理的因子 */
export interface PhysicalFactors {
  rula_assessment?: RulaAssessment
  owas_assessment?: OwasAssessment
}

/** リスク評価レベル */
export interface RiskLevel {
  level: string
  action: string
  description: string
}

/** リスクマトリックス */
export interface RiskMatrix {
  low_risk: RiskLevel
  medium_risk: RiskLevel
  high_risk: RiskLevel
  critical_risk: RiskLevel
}

/** リスクアセスメント */
export interface RiskAssessment {
  risk_matrix: RiskMatrix
}

/** 危険因子 */
export interface HazardFactors {
  risk_assessment?: RiskAssessment
}

/** 環境因子 */
export interface EnvironmentalFactors {
  chemical_substances: ChemicalSubstances
}

/** 評価基準 */
export interface EvaluationStandards {
  environmental_factors: EnvironmentalFactors
  physical_factors?: PhysicalFactors
  hazard_factors?: HazardFactors
}

/** 評価基準データ全体 */
export interface StandardsData {
  evaluation_standards: EvaluationStandards
}

/** スコアリングパターン */
export interface ScoringPattern {
  condition: string
  interpretation: string
}

/** 環境スコアリング */
export interface EnvironmentalScoring {
  score_1: ScoringPattern
  [key: string]: ScoringPattern // 動的なスコアキー
}

/** 一般スコアリングパターン */
export interface GeneralScoringPatterns {
  environmental_scoring: EnvironmentalScoring
  [key: string]: Record<string, ScoringPattern> // 動的なカテゴリ
}

/** 参照例 */
export interface ReferenceExamples {
  reference_examples: {
    general_scoring_patterns: GeneralScoringPatterns
  }
}

/** 最終評価 */
export interface FinalEvaluation {
  kitsu_sa_score: number
  '3k_index': string
}

/** 作業事例 */
export interface WorkCase {
  case_id: string
  work_description: string
  final_evaluation: FinalEvaluation
}

/** 個別作業事例 */
export interface IndividualWorkCases {
  painting_booth_operator: WorkCase
  [key: string]: WorkCase // 動的な作業事例キー
}

/** 作業事例データ */
export interface WorkCaseExamples {
  work_case_examples: {
    individual_work_cases: IndividualWorkCases
  }
}
