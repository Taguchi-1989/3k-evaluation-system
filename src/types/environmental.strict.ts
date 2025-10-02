/**
 * 環境因子評価の厳格な型定義
 * Branded Types、Readonly修飾子、厳密な範囲制約を使用
 */

import type {
  EnvironmentalFactorId,
  SubstanceId,
  ConditionId,
  EvaluationId,
  Score0To100,
  Score1To5,
  ConcentrationUnit,
  TemperatureUnit,
  NoiseUnit,
  VibrationUnit,
  LightingUnit,
  HumidityUnit,
  TimeUnit,
  RiskLevel,
  SeverityLevel,
  ProtectionLevel,
  PersonInfo,
  WorkInfo,
  DeepReadonly,
  NonEmptyArray,
  JapaneseDateString
} from './common'

// ============================================
// Environmental Substance Types (有害物質型)
// ============================================

/**
 * 物質カテゴリ（化学的・物理的・生物学的）
 */
export type SubstanceCategory = 'chemical' | 'physical' | 'biological'

/**
 * 化学物質の詳細分類
 */
export type ChemicalSubstanceType =
  | 'organic_solvent'      // 有機溶剤
  | 'acid'                 // 酸
  | 'alkali'               // アルカリ
  | 'heavy_metal'          // 重金属
  | 'gas'                  // ガス
  | 'particulate'          // 粒子状物質
  | 'other'                // その他

/**
 * 物理的因子の詳細分類
 */
export type PhysicalSubstanceType =
  | 'radiation'            // 放射線
  | 'electromagnetic'      // 電磁波
  | 'heat'                 // 熱
  | 'cold'                 // 寒冷
  | 'pressure'             // 気圧
  | 'other'                // その他

/**
 * 生物学的因子の詳細分類
 */
export type BiologicalSubstanceType =
  | 'bacteria'             // 細菌
  | 'virus'                // ウイルス
  | 'fungus'               // 真菌
  | 'allergen'             // アレルゲン
  | 'endotoxin'            // エンドトキシン
  | 'other'                // その他

/**
 * 有害物質の暴露経路
 */
export type ExposureRoute =
  | 'inhalation'           // 吸入
  | 'dermal'               // 皮膚接触
  | 'ingestion'            // 経口摂取
  | 'injection'            // 注射
  | 'multiple'             // 複数経路

/**
 * 有害物質情報（UI層用・厳格版）
 */
export interface EnvironmentalSubstanceStrict {
  readonly id: SubstanceId
  readonly substanceName: string
  readonly category: SubstanceCategory
  readonly substanceType: ChemicalSubstanceType | PhysicalSubstanceType | BiologicalSubstanceType
  readonly casNumber?: string              // CAS登録番号
  readonly standardValue: number           // 管理濃度・許容濃度
  readonly measuredValue: number           // 測定値
  readonly measurementUnit: ConcentrationUnit
  readonly exposureTime: number            // 暴露時間（時間）
  readonly exposureRoute: ExposureRoute
  readonly protectionLevel: ProtectionLevel
  readonly riskLevel: Score1To5
  readonly riskScore: Score0To100
  readonly notes?: string
  readonly sdsAvailable: boolean           // SDS（安全データシート）の有無
  readonly sdsUrl?: string
  readonly measurementDate?: JapaneseDateString
  readonly measuredBy?: string
}

// ============================================
// Environmental Condition Types (環境条件型)
// ============================================

/**
 * 環境条件のタイプ
 */
export type EnvironmentalConditionType =
  | 'temperature'          // 温度
  | 'humidity'             // 湿度
  | 'lighting'             // 照明
  | 'ventilation'          // 換気
  | 'noise'                // 騒音
  | 'vibration'            // 振動
  | 'air_quality'          // 空気質
  | 'dust'                 // 粉塵

/**
 * 測定位置
 */
export type MeasurementPosition =
  | 'breathing_zone'       // 呼吸域
  | 'work_area'            // 作業場所
  | 'general_area'         // 一般区域
  | 'exhaust'              // 排気口
  | 'other'                // その他

/**
 * 環境条件情報（厳格版）
 */
export interface EnvironmentalConditionStrict {
  readonly id: ConditionId
  readonly conditionType: EnvironmentalConditionType
  readonly label: string
  readonly standardMin: number
  readonly standardMax: number
  readonly currentValue: number
  readonly measurementUnit: TemperatureUnit | NoiseUnit | VibrationUnit | LightingUnit | HumidityUnit
  readonly measurementPosition: MeasurementPosition
  readonly isOutOfRange: boolean
  readonly severity: SeverityLevel
  readonly deviationPercentage: number     // 基準値からの乖離率（%）
  readonly measurementDate?: JapaneseDateString
  readonly measuredBy?: string
  readonly correctiveAction?: string       // 是正措置
}

// ============================================
// Risk Assessment Types (リスク評価型)
// ============================================

/**
 * リスク評価結果
 */
export interface RiskAssessmentResult {
  readonly riskLevel: RiskLevel
  readonly riskScore: Score0To100
  readonly contributingFactors: ReadonlyArray<string>
  readonly assessmentDate: JapaneseDateString
  readonly assessedBy: string
}

/**
 * 総合リスク評価
 */
export interface OverallRiskAssessmentStrict {
  readonly chemicalRisk: RiskAssessmentResult
  readonly physicalRisk: RiskAssessmentResult
  readonly biologicalRisk: RiskAssessmentResult
  readonly combinedRisk: RiskAssessmentResult
  readonly maxRiskLevel: RiskLevel
  readonly requiresImmediateAction: boolean
}

// ============================================
// Protective Measures Types (保護措置型)
// ============================================

/**
 * 保護措置のカテゴリ
 */
export type ProtectiveMeasureCategory =
  | 'personal_protection'      // 個人保護具
  | 'engineering_control'      // 工学的対策
  | 'administrative_control'   // 管理的対策
  | 'emergency_procedure'      // 緊急時手順

/**
 * 保護措置の優先度
 */
export type ProtectiveMeasurePriority = 'immediate' | 'short_term' | 'long_term'

/**
 * 保護措置アイテム
 */
export interface ProtectiveMeasureItem {
  readonly id: string
  readonly category: ProtectiveMeasureCategory
  readonly description: string
  readonly priority: ProtectiveMeasurePriority
  readonly implemented: boolean
  readonly implementationDate?: JapaneseDateString
  readonly responsiblePerson?: string
  readonly effectivenessScore?: Score1To5
}

/**
 * 保護措置（厳格版）
 */
export interface ProtectiveMeasuresStrict {
  readonly personalProtection: NonEmptyArray<ProtectiveMeasureItem>
  readonly engineeringControls: ReadonlyArray<ProtectiveMeasureItem>
  readonly administrativeControls: ReadonlyArray<ProtectiveMeasureItem>
  readonly emergencyProcedures: NonEmptyArray<ProtectiveMeasureItem>
  readonly trainingRequired: boolean
  readonly trainingFrequency?: TimeUnit
  readonly lastTrainingDate?: JapaneseDateString
}

// ============================================
// Environmental Details (環境因子詳細)
// ============================================

/**
 * チェックボックス状態（厳格版）
 */
export interface EnvironmentalCheckboxesStrict {
  readonly chemicals: boolean
  readonly temperature: boolean
  readonly noise: boolean
  readonly vibration: boolean
  readonly lighting: boolean
  readonly dust: boolean
  readonly humidity: boolean
  readonly ventilation: boolean
  readonly airQuality: boolean
}

/**
 * 環境因子詳細情報（UI層用・厳格版）
 */
export interface EnvironmentalDetailsStrict {
  readonly checkboxes: DeepReadonly<EnvironmentalCheckboxesStrict>
  readonly substances: ReadonlyArray<EnvironmentalSubstanceStrict>
  readonly conditions: ReadonlyArray<EnvironmentalConditionStrict>
  readonly overallRiskAssessment: DeepReadonly<OverallRiskAssessmentStrict>
  readonly protectiveMeasures: DeepReadonly<ProtectiveMeasuresStrict>
  readonly complianceStatus: 'compliant' | 'non_compliant' | 'pending_review'
  readonly nextReviewDate?: JapaneseDateString
  readonly reviewFrequency: TimeUnit
}

// ============================================
// Component Props (コンポーネントProps)
// ============================================

/**
 * 環境因子詳細コンポーネントのProps（厳格版）
 */
export interface EnvironmentalFactorDetailPropsStrict {
  readonly evaluationNo?: string
  readonly creator?: DeepReadonly<PersonInfo>
  readonly checker?: DeepReadonly<PersonInfo>
  readonly workInfo?: DeepReadonly<WorkInfo>
  readonly photoUrl?: string
  readonly initialData?: DeepReadonly<Partial<EnvironmentalDetailsStrict>>
  readonly onSave?: (data: DeepReadonly<EnvironmentalDetailsStrict>) => void
  readonly onCancel?: () => void
  readonly readOnly?: boolean
}

// ============================================
// Domain Model (ドメインモデル)
// ============================================

/**
 * 環境因子ドメインモデル（厳格版）
 */
export interface EnvironmentalFactorStrict {
  readonly id: EnvironmentalFactorId
  readonly evaluationId: EvaluationId
  readonly score: Score0To100
  readonly details: DeepReadonly<EnvironmentalDetailsStrict>
  readonly sdsUrl?: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number                 // 楽観的ロック用
}

// ============================================
// Validation Types (バリデーション型)
// ============================================

/**
 * バリデーションエラー
 */
export interface ValidationError {
  readonly field: string
  readonly message: string
  readonly severity: 'error' | 'warning'
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: ReadonlyArray<ValidationError>
  readonly warnings: ReadonlyArray<ValidationError>
}

// ============================================
// Type Guards (型ガード)
// ============================================

/**
 * SubstanceCategoryの型ガード
 */
export function isSubstanceCategory(value: unknown): value is SubstanceCategory {
  return typeof value === 'string' && ['chemical', 'physical', 'biological'].includes(value)
}

/**
 * EnvironmentalConditionTypeの型ガード
 */
export function isEnvironmentalConditionType(value: unknown): value is EnvironmentalConditionType {
  return (
    typeof value === 'string' &&
    ['temperature', 'humidity', 'lighting', 'ventilation', 'noise', 'vibration', 'air_quality', 'dust'].includes(value)
  )
}

/**
 * RiskLevelの型ガード
 */
export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && ['low', 'medium', 'high', 'critical'].includes(value)
}
