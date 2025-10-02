/**
 * 精神因子評価の厳格な型定義
 * Branded Types、Readonly修飾子、厳密な範囲制約を使用
 */

import type {
  MentalFactorId,
  EvaluationId,
  Score0To100,
  Score1To5,
  PersonInfo,
  WorkInfo,
  DeepReadonly,
  NonEmptyArray,
  JapaneseDateString,
  ISODateString
} from './common'

// ============================================
// Mental Factor Category Types (精神因子カテゴリ型)
// ============================================

/**
 * 精神因子のカテゴリ
 */
export type MentalFactorCategory =
  | 'failure'              // 失敗・ミスのリスク
  | 'concentration'        // 注意集中の必要性
  | 'cognitiveLoad'        // 認知的負荷
  | 'emotionalBurden'      // 感情的負担
  | 'skillUtilization'     // 技能の活用度
  | 'workControl'          // 仕事のコントロール度

/**
 * 作業の質（失敗）の詳細分類
 */
export type FailureType =
  | 'critical_error'       // 致命的エラー
  | 'moderate_error'       // 中程度のエラー
  | 'minor_error'          // 軽微なエラー
  | 'near_miss'            // ヒヤリハット
  | 'rework_required'      // やり直し必要

/**
 * 注意集中の種類
 */
export type ConcentrationType =
  | 'sustained_attention'  // 持続的注意
  | 'selective_attention'  // 選択的注意
  | 'divided_attention'    // 分割的注意
  | 'alternating_attention' // 転換的注意

/**
 * 認知負荷のタイプ
 */
export type CognitiveLoadType =
  | 'intrinsic'            // 内在的負荷（タスク本来の難しさ）
  | 'extraneous'           // 外在的負荷（環境・手順の問題）
  | 'germane'              // 学習関連負荷（スキル獲得）

/**
 * 感情的負担の種類
 */
export type EmotionalBurdenType =
  | 'anxiety'              // 不安
  | 'frustration'          // フラストレーション
  | 'burnout_risk'         // 燃え尽き症候群リスク
  | 'compassion_fatigue'   // 共感疲労
  | 'moral_distress'       // 道徳的苦悩

// ============================================
// Mental Factor Item Types (精神因子項目型)
// ============================================

/**
 * 深刻度レベル（精神因子用）
 */
export type MentalSeverityLevel = 'negligible' | 'minor' | 'moderate' | 'major' | 'severe'

/**
 * 持続時間レベル
 */
export type DurationLevel = 'momentary' | 'short' | 'medium' | 'long' | 'continuous'

/**
 * 持続時間の詳細（パーセンテージベース）
 */
export interface DurationDetail {
  readonly level: DurationLevel
  readonly percentage: number              // 作業時間の何%を占めるか（0-100）
  readonly estimatedHoursPerDay: number    // 1日あたりの推定時間
}

/**
 * 精神因子項目（厳格版）
 */
export interface MentalFactorItemStrict {
  readonly id: string
  readonly label: string
  readonly isChecked: boolean
  readonly category: MentalFactorCategory
  readonly hasDetail: boolean
  readonly severity?: MentalSeverityLevel
  readonly severityScore?: Score1To5
  readonly duration?: DurationDetail
  readonly inputValue?: string             // 自由記述
  readonly relatedIncidents?: ReadonlyArray<string>  // 関連インシデント
  readonly notes?: string
}

// ============================================
// Psychological Stress Types (心理的負荷型)
// ============================================

/**
 * 心理的ストレスのカテゴリ（厚生労働省基準準拠）
 */
export type PsychologicalStressCategory =
  | 'workload_changes'           // 仕事量・質の変化
  | 'harassment_events'          // ハラスメント
  | 'interpersonal_issues'       // 対人関係の問題
  | 'work_responsibility'        // 仕事の責任
  | 'work_environment_changes'   // 作業環境の変化
  | 'accident_trauma'            // 事故・災害体験

/**
 * ストレス強度（厚労省基準）
 */
export type StressIntensity = 'weak' | 'moderate' | 'strong'

/**
 * 心理的ストレスイベント（厳格版）
 */
export interface PsychologicalStressEventStrict {
  readonly id: string
  readonly category: PsychologicalStressCategory
  readonly eventDescription: string
  readonly occurredDate: ISODateString
  readonly intensity: StressIntensity
  readonly intensityScore: Score1To5
  readonly duration: DurationLevel
  readonly supportReceived: boolean
  readonly supportType?: ReadonlyArray<string>
  readonly resolved: boolean
  readonly resolvedDate?: ISODateString
  readonly impact: {
    readonly psychological: Score1To5
    readonly physical: Score1To5
    readonly work_performance: Score1To5
  }
}

/**
 * 心理的ストレス評価（厳格版）
 */
export interface PsychologicalStressAssessmentStrict {
  readonly workloadChanges: ReadonlyArray<PsychologicalStressEventStrict>
  readonly harassmentEvents: ReadonlyArray<PsychologicalStressEventStrict>
  readonly interpersonalIssues: ReadonlyArray<PsychologicalStressEventStrict>
  readonly workResponsibility: ReadonlyArray<PsychologicalStressEventStrict>
  readonly workEnvironmentChanges: ReadonlyArray<PsychologicalStressEventStrict>
  readonly accidentTrauma: ReadonlyArray<PsychologicalStressEventStrict>
  readonly overallStressLevel: Score0To100
  readonly assessmentDate: JapaneseDateString
  readonly requiresProfessionalSupport: boolean
}

// ============================================
// Overtime Work Types (時間外労働型)
// ============================================

/**
 * 時間外労働の評価期間
 */
export type OvertimePeriod = 'monthly' | 'bi_monthly' | 'quarterly' | 'yearly'

/**
 * 時間外労働の詳細
 */
export interface OvertimeDetail {
  readonly period: OvertimePeriod
  readonly startDate: ISODateString
  readonly endDate: ISODateString
  readonly regularHours: number
  readonly overtimeHours: number
  readonly nightShiftHours: number
  readonly holidayWorkHours: number
  readonly totalWorkHours: number
}

/**
 * 過重労働リスク評価
 */
export interface OverworkRiskAssessment {
  readonly riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  readonly monthlyOvertimeAverage: number
  readonly exceeds45Hours: boolean         // 月45時間超過
  readonly exceeds80Hours: boolean         // 月80時間超過（過労死ライン）
  readonly exceeds100Hours: boolean        // 月100時間超過（危険レベル）
  readonly consecutiveOvertime: number     // 連続超過月数
  readonly healthCheckRequired: boolean
  readonly lastHealthCheckDate?: JapaneseDateString
}

/**
 * 時間外労働評価（厳格版）
 */
export interface OvertimeWorkStrict {
  readonly monthlyOvertimeHours: number
  readonly details: ReadonlyArray<OvertimeDetail>
  readonly riskAssessment: DeepReadonly<OverworkRiskAssessment>
  readonly mitigationMeasures?: ReadonlyArray<string>
}

// ============================================
// Work Quality Assessment (作業の質評価)
// ============================================

/**
 * 作業の質（失敗）
 */
export interface WorkQualityFailure {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly failureTypes: NonEmptyArray<FailureType>
  readonly frequency: 'rare' | 'occasional' | 'frequent' | 'constant'
  readonly impactScore: Score1To5
}

/**
 * 注意集中
 */
export interface WorkQualityConcentration {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly concentrationTypes: NonEmptyArray<ConcentrationType>
  readonly distractionsPresent: boolean
  readonly fatigueImpact: Score1To5
}

/**
 * 認知的負荷
 */
export interface WorkQualityCognitiveLoad {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly loadTypes: NonEmptyArray<CognitiveLoadType>
  readonly complexityScore: Score1To5
  readonly trainingAdequate: boolean
}

/**
 * 感情的負担
 */
export interface WorkQualityEmotionalBurden {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly burdenTypes: NonEmptyArray<EmotionalBurdenType>
  readonly supportAvailable: boolean
  readonly copingStrategies: ReadonlyArray<string>
}

/**
 * 技能活用
 */
export interface WorkQualitySkillUtilization {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly skillMatch: 'underutilized' | 'appropriate' | 'overextended'
  readonly developmentOpportunities: boolean
  readonly satisfactionScore: Score1To5
}

/**
 * 仕事のコントロール
 */
export interface WorkQualityWorkControl {
  readonly level: MentalSeverityLevel
  readonly duration: DurationLevel
  readonly autonomyLevel: Score1To5
  readonly decisionAuthority: boolean
  readonly scheduleFlexibility: Score1To5
}

/**
 * 作業の質評価（厳格版）
 */
export interface WorkQualityAssessmentStrict {
  readonly failure?: DeepReadonly<WorkQualityFailure>
  readonly concentration?: DeepReadonly<WorkQualityConcentration>
  readonly cognitiveLoad?: DeepReadonly<WorkQualityCognitiveLoad>
  readonly emotionalBurden?: DeepReadonly<WorkQualityEmotionalBurden>
  readonly skillUtilization?: DeepReadonly<WorkQualitySkillUtilization>
  readonly workControl?: DeepReadonly<WorkQualityWorkControl>
}

// ============================================
// Mental Details (精神因子詳細)
// ============================================

/**
 * 精神因子詳細情報（厳格版）
 */
export interface MentalDetailsStrict {
  readonly workQuality: DeepReadonly<WorkQualityAssessmentStrict>
  readonly psychologicalStress?: DeepReadonly<PsychologicalStressAssessmentStrict>
  readonly overtimeWork?: DeepReadonly<OvertimeWorkStrict>
  readonly overallMentalScore: Score0To100
  readonly strengthScore: Score0To100
  readonly durationScore: Score0To100
  readonly assessmentDate: JapaneseDateString
  readonly nextReviewDate?: JapaneseDateString
}

// ============================================
// Component Props (コンポーネントProps)
// ============================================

/**
 * 精神因子詳細コンポーネントのProps（厳格版）
 */
export interface MentalFactorDetailPropsStrict {
  readonly evaluationNo?: string
  readonly creator?: DeepReadonly<PersonInfo>
  readonly checker?: DeepReadonly<PersonInfo>
  readonly workInfo?: DeepReadonly<WorkInfo>
  readonly photoUrl?: string
  readonly mentalFactorItems?: ReadonlyArray<MentalFactorItemStrict>
  readonly initialData?: DeepReadonly<Partial<MentalDetailsStrict>>
  readonly onSave?: (data: DeepReadonly<MentalDetailsStrict>) => void
  readonly onCancel?: () => void
  readonly readOnly?: boolean
}

// ============================================
// Domain Model (ドメインモデル)
// ============================================

/**
 * 精神因子ドメインモデル（厳格版）
 */
export interface MentalFactorStrict {
  readonly id: MentalFactorId
  readonly evaluationId: EvaluationId
  readonly score: Score0To100
  readonly details: DeepReadonly<MentalDetailsStrict>
  readonly strengthScore: Score0To100
  readonly durationScore: Score0To100
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number
}

// ============================================
// Type Guards (型ガード)
// ============================================

/**
 * MentalFactorCategoryの型ガード
 */
export function isMentalFactorCategory(value: unknown): value is MentalFactorCategory {
  return (
    typeof value === 'string' &&
    ['failure', 'concentration', 'cognitiveLoad', 'emotionalBurden', 'skillUtilization', 'workControl'].includes(value)
  )
}

/**
 * PsychologicalStressCategoryの型ガード
 */
export function isPsychologicalStressCategory(value: unknown): value is PsychologicalStressCategory {
  return (
    typeof value === 'string' &&
    [
      'workload_changes',
      'harassment_events',
      'interpersonal_issues',
      'work_responsibility',
      'work_environment_changes',
      'accident_trauma'
    ].includes(value)
  )
}

/**
 * StressIntensityの型ガード
 */
export function isStressIntensity(value: unknown): value is StressIntensity {
  return typeof value === 'string' && ['weak', 'moderate', 'strong'].includes(value)
}
