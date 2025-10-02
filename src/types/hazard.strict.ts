/**
 * 危険因子評価の厳格な型定義
 * Branded Types、Readonly修飾子、厳密な範囲制約を使用
 */

import type {
  HazardFactorId,
  EvaluationId,
  Score0To100,
  Score1To5,
  PersonInfo,
  WorkInfo,
  DeepReadonly,
  NonEmptyArray,
  JapaneseDateString,
  ISODateString,
  PriorityLevel
} from './common'

// ============================================
// Hazard Event Types (危険事象型)
// ============================================

/**
 * 危険因子のカテゴリ
 */
export type HazardCategory =
  | 'mechanical'           // 機械的危険
  | 'electrical'           // 電気的危険
  | 'thermal'              // 熱的危険
  | 'chemical'             // 化学的危険
  | 'biological'           // 生物学的危険
  | 'ergonomic'            // 人間工学的危険
  | 'physical'             // 物理的危険
  | 'psychosocial'         // 心理社会的危険

/**
 * 機械的危険の詳細分類
 */
export type MechanicalHazardType =
  | 'entrapment'           // 挟まれ
  | 'entanglement'         // 巻き込まれ
  | 'cutting'              // 切断
  | 'shearing'             // 剪断
  | 'crushing'             // 押しつぶし
  | 'impact'               // 衝撃
  | 'stabbing'             // 突き刺し
  | 'friction'             // 摩擦
  | 'ejection'             // 放出
  | 'fall'                 // 落下

/**
 * 電気的危険の詳細分類
 */
export type ElectricalHazardType =
  | 'electric_shock'       // 感電
  | 'arc_flash'            // アーク放電
  | 'electrocution'        // 電撃死
  | 'burns'                // 火傷
  | 'electromagnetic'      // 電磁波

/**
 * 化学的危険の詳細分類
 */
export type ChemicalHazardType =
  | 'inhalation'           // 吸入
  | 'ingestion'            // 経口摂取
  | 'skin_contact'         // 皮膚接触
  | 'eye_contact'          // 目への接触
  | 'explosion'            // 爆発
  | 'fire'                 // 火災
  | 'corrosion'            // 腐食

// ============================================
// Risk Assessment Types (リスク評価型)
// ============================================

/**
 * 遭遇頻度（Px: Probability of eXposure）
 * 作業者が危険源に遭遇する頻度
 */
export type EncounterFrequency = 1 | 2 | 3 | 4 | 5

/**
 * 危険事象の発生可能性（Py: Probability of Yield）
 * 危険源への暴露が危険事象を引き起こす可能性
 */
export type OccurrencePossibility = 1 | 2 | 3 | 4 | 5

/**
 * 発生確率レベル（P = Px × Py）
 * P1: 非常に低い, P2: 低い, P3: 中程度, P4: 高い, P5: 非常に高い
 */
export type OccurrenceProbabilityLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'

/**
 * 危害の深刻度（S: Severity）
 * S1: 軽微, S2: 中程度, S3: 重大, S4: 致命的
 */
export type HarmSeverityLevel = 'S1' | 'S2' | 'S3' | 'S4'

/**
 * リスクポイント（RP: Risk Point = P × S）
 */
export type RiskPoint = number  // 1-20の範囲

/**
 * リスクレベル（Risk Level）
 * A: 許容できないリスク（RP≧10）
 * B: 条件付き許容リスク（6≦RP<10）
 * C: 許容できるリスク（RP<6）
 */
export type HazardRiskLevel = 'A' | 'B' | 'C'

/**
 * リスク評価結果（厳格版）
 */
export interface RiskAssessmentStrict {
  readonly encounterFrequency: EncounterFrequency
  readonly encounterFrequencyDescription: string
  readonly occurrencePossibility: OccurrencePossibility
  readonly occurrencePossibilityDescription: string
  readonly occurrenceProbability: OccurrenceProbabilityLevel
  readonly occurrenceProbabilityValue: number  // Px × Py
  readonly harmSeverity: HarmSeverityLevel
  readonly harmSeverityDescription: string
  readonly harmSeverityValue: number           // 1-4
  readonly riskPoint: RiskPoint
  readonly riskLevel: HazardRiskLevel
  readonly requiresImmediateAction: boolean
  readonly assessmentDate: JapaneseDateString
  readonly assessedBy: string
}

// ============================================
// Hazard Event Types (危険事象型)
// ============================================

/**
 * 危険事象の状態
 */
export type HazardEventStatus =
  | 'identified'           // 特定済み
  | 'under_assessment'     // 評価中
  | 'mitigated'            // 対策済み
  | 'accepted'             // 受容済み
  | 'transferred'          // 移転済み
  | 'eliminated'           // 除去済み

/**
 * 危険事象（厳格版）
 */
export interface HazardEventStrict {
  readonly id: string
  readonly eventDescription: string
  readonly category: HazardCategory
  readonly hazardType: MechanicalHazardType | ElectricalHazardType | ChemicalHazardType | string
  readonly location: string                    // 発生場所
  readonly affectedPersonnel: string           // 影響を受ける人員
  readonly existingControls: ReadonlyArray<string>  // 既存の管理策
  readonly riskAssessment: DeepReadonly<RiskAssessmentStrict>
  readonly status: HazardEventStatus
  readonly identificationDate: ISODateString
  readonly lastReviewDate?: JapaneseDateString
  readonly nextReviewDate?: JapaneseDateString
  readonly notes?: string
}

// ============================================
// Control Measures Types (管理策型)
// ============================================

/**
 * 管理策の階層（リスク管理の優先順位）
 */
export type ControlHierarchy =
  | 'elimination'          // 除去（最優先）
  | 'substitution'         // 代替
  | 'engineering_control'  // 工学的対策
  | 'administrative'       // 管理的対策
  | 'ppe'                  // 個人保護具（最終手段）

/**
 * 管理策の実施状態
 */
export type ControlMeasureStatus =
  | 'planned'              // 計画中
  | 'in_progress'          // 実施中
  | 'completed'            // 完了
  | 'verified'             // 検証済み
  | 'ineffective'          // 効果なし

/**
 * 管理策アイテム（厳格版）
 */
export interface ControlMeasureItemStrict {
  readonly id: string
  readonly hierarchy: ControlHierarchy
  readonly description: string
  readonly targetRiskLevel: HazardRiskLevel
  readonly expectedReduction: number           // 期待されるリスク低減率（%）
  readonly implementationCost: 'low' | 'medium' | 'high'
  readonly implementationTime: number          // 実施期間（日数）
  readonly priority: PriorityLevel
  readonly status: ControlMeasureStatus
  readonly responsiblePerson: string
  readonly deadline?: ISODateString
  readonly completedDate?: ISODateString
  readonly effectivenessScore?: Score1To5      // 効果度スコア
  readonly notes?: string
}

/**
 * 管理策（厳格版）
 */
export interface ControlMeasuresStrict {
  readonly elimination: ReadonlyArray<ControlMeasureItemStrict>
  readonly substitution: ReadonlyArray<ControlMeasureItemStrict>
  readonly engineeringControls: ReadonlyArray<ControlMeasureItemStrict>
  readonly administrativeControls: ReadonlyArray<ControlMeasureItemStrict>
  readonly personalProtectiveEquipment: NonEmptyArray<ControlMeasureItemStrict>
  readonly overallEffectiveness: Score0To100
  readonly residualRiskLevel: HazardRiskLevel
  readonly isAcceptable: boolean
}

// ============================================
// Incident/Accident Types (インシデント・事故型)
// ============================================

/**
 * インシデント・事故の重大度
 */
export type IncidentSeverity =
  | 'near_miss'            // ヒヤリハット
  | 'minor_injury'         // 軽傷
  | 'major_injury'         // 重傷
  | 'fatal'                // 死亡事故
  | 'multiple_fatalities'  // 複数死亡

/**
 * インシデント・事故の記録
 */
export interface IncidentRecordStrict {
  readonly id: string
  readonly relatedHazardEventId?: string
  readonly incidentDate: ISODateString
  readonly location: string
  readonly description: string
  readonly severity: IncidentSeverity
  readonly injuredPersons: number
  readonly fatalities: number
  readonly witnessAccounts: ReadonlyArray<string>
  readonly rootCauses: NonEmptyArray<string>
  readonly contributingFactors: ReadonlyArray<string>
  readonly correctiveActions: NonEmptyArray<ControlMeasureItemStrict>
  readonly preventiveActions: ReadonlyArray<ControlMeasureItemStrict>
  readonly investigationCompleted: boolean
  readonly investigationDate?: ISODateString
  readonly investigator: string
  readonly reportedToAuthorities: boolean
  readonly lostWorkDays: number
}

// ============================================
// Emergency Response Types (緊急対応型)
// ============================================

/**
 * 緊急対応の種類
 */
export type EmergencyResponseType =
  | 'evacuation'           // 避難
  | 'first_aid'            // 応急処置
  | 'fire_suppression'     // 消火
  | 'spill_containment'    // 漏洩対応
  | 'rescue'               // 救助
  | 'lockdown'             // 封鎖

/**
 * 緊急対応手順
 */
export interface EmergencyResponseProcedureStrict {
  readonly id: string
  readonly responseType: EmergencyResponseType
  readonly triggerConditions: NonEmptyArray<string>
  readonly steps: NonEmptyArray<string>
  readonly responsiblePersons: NonEmptyArray<string>
  readonly requiredEquipment: ReadonlyArray<string>
  readonly communicationProtocol: string
  readonly evacuationRoutes?: ReadonlyArray<string>
  readonly assemblyPoints?: ReadonlyArray<string>
  readonly emergencyContacts: NonEmptyArray<{
    readonly name: string
    readonly role: string
    readonly phone: string
  }>
  readonly lastDrillDate?: JapaneseDateString
  readonly nextDrillDate?: JapaneseDateString
  readonly drillFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually'
}

// ============================================
// Hazard Details (危険因子詳細)
// ============================================

/**
 * 危険因子詳細情報（厳格版）
 */
export interface HazardDetailsStrict {
  readonly hazardEvents: NonEmptyArray<HazardEventStrict>
  readonly controlMeasures: DeepReadonly<ControlMeasuresStrict>
  readonly incidentRecords: ReadonlyArray<IncidentRecordStrict>
  readonly emergencyProcedures: NonEmptyArray<EmergencyResponseProcedureStrict>
  readonly overallRiskLevel: HazardRiskLevel
  readonly acceptableRiskAchieved: boolean
  readonly lastAssessmentDate: JapaneseDateString
  readonly nextAssessmentDate: JapaneseDateString
  readonly assessmentFrequency: 'monthly' | 'quarterly' | 'semi_annually' | 'annually'
  readonly complianceStatus: 'compliant' | 'non_compliant' | 'pending_review'
  readonly regulatoryReferences: ReadonlyArray<string>
}

// ============================================
// Component Props (コンポーネントProps)
// ============================================

/**
 * 危険因子詳細コンポーネントのProps（厳格版）
 */
export interface HazardFactorDetailPropsStrict {
  readonly evaluationNo?: string
  readonly creator?: DeepReadonly<PersonInfo>
  readonly checker?: DeepReadonly<PersonInfo>
  readonly workInfo?: DeepReadonly<WorkInfo>
  readonly photoUrl?: string
  readonly hazardEvents?: ReadonlyArray<HazardEventStrict>
  readonly initialData?: DeepReadonly<Partial<HazardDetailsStrict>>
  readonly onSave?: (data: DeepReadonly<HazardDetailsStrict>) => void
  readonly onCancel?: () => void
  readonly readOnly?: boolean
}

// ============================================
// Domain Model (ドメインモデル)
// ============================================

/**
 * 危険因子ドメインモデル（厳格版）
 */
export interface HazardFactorStrict {
  readonly id: HazardFactorId
  readonly evaluationId: EvaluationId
  readonly score: Score0To100
  readonly details: DeepReadonly<HazardDetailsStrict>
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number
}

// ============================================
// Helper Functions (ヘルパー関数)
// ============================================

/**
 * リスクポイント計算
 */
export function calculateRiskPoint(
  occurrenceProbabilityValue: number,
  harmSeverityValue: number
): RiskPoint {
  return occurrenceProbabilityValue * harmSeverityValue
}

/**
 * リスクレベル判定
 */
export function determineRiskLevel(riskPoint: RiskPoint): HazardRiskLevel {
  if (riskPoint >= 10) return 'A'
  if (riskPoint >= 6) return 'B'
  return 'C'
}

/**
 * 発生確率レベル計算
 */
export function calculateOccurrenceProbability(
  encounterFrequency: EncounterFrequency,
  occurrencePossibility: OccurrencePossibility
): { level: OccurrenceProbabilityLevel; value: number } {
  const value = encounterFrequency * occurrencePossibility
  let level: OccurrenceProbabilityLevel

  if (value <= 5) level = 'P1'
  else if (value <= 10) level = 'P2'
  else if (value <= 15) level = 'P3'
  else if (value <= 20) level = 'P4'
  else level = 'P5'

  return { level, value }
}

// ============================================
// Type Guards (型ガード)
// ============================================

/**
 * HazardCategoryの型ガード
 */
export function isHazardCategory(value: unknown): value is HazardCategory {
  return (
    typeof value === 'string' &&
    ['mechanical', 'electrical', 'thermal', 'chemical', 'biological', 'ergonomic', 'physical', 'psychosocial'].includes(
      value
    )
  )
}

/**
 * HazardRiskLevelの型ガード
 */
export function isHazardRiskLevel(value: unknown): value is HazardRiskLevel {
  return typeof value === 'string' && ['A', 'B', 'C'].includes(value)
}

/**
 * ControlHierarchyの型ガード
 */
export function isControlHierarchy(value: unknown): value is ControlHierarchy {
  return (
    typeof value === 'string' &&
    ['elimination', 'substitution', 'engineering_control', 'administrative', 'ppe'].includes(value)
  )
}

/**
 * EncounterFrequencyの型ガード
 */
export function isEncounterFrequency(value: unknown): value is EncounterFrequency {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value)
}

/**
 * OccurrencePossibilityの型ガード
 */
export function isOccurrencePossibility(value: unknown): value is OccurrencePossibility {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value)
}
