/**
 * 共通型定義
 * アプリケーション全体で使用される基本的な型を定義
 */

// ============================================
// Branded Types (型レベルID区別)
// ============================================

/**
 * ブランド型のベース
 * コンパイル時に異なるID型を区別する
 */
declare const brand: unique symbol

export type Brand<T, TBrand extends string> = T & {
  readonly [brand]: TBrand
}

// ID型の定義
export type EvaluationId = Brand<string, 'EvaluationId'>
export type PhysicalFactorId = Brand<string, 'PhysicalFactorId'>
export type MentalFactorId = Brand<string, 'MentalFactorId'>
export type EnvironmentalFactorId = Brand<string, 'EnvironmentalFactorId'>
export type HazardFactorId = Brand<string, 'HazardFactorId'>
export type WorkTimeId = Brand<string, 'WorkTimeId'>
export type UserId = Brand<string, 'UserId'>
export type SubstanceId = Brand<string, 'SubstanceId'>
export type ConditionId = Brand<string, 'ConditionId'>

// ID生成ヘルパー
export const createEvaluationId = (id: string): EvaluationId => id as EvaluationId
export const createPhysicalFactorId = (id: string): PhysicalFactorId => id as PhysicalFactorId
export const createMentalFactorId = (id: string): MentalFactorId => id as MentalFactorId
export const createEnvironmentalFactorId = (id: string): EnvironmentalFactorId => id as EnvironmentalFactorId
export const createHazardFactorId = (id: string): HazardFactorId => id as HazardFactorId
export const createWorkTimeId = (id: string): WorkTimeId => id as WorkTimeId
export const createUserId = (id: string): UserId => id as UserId
export const createSubstanceId = (id: string): SubstanceId => id as SubstanceId
export const createConditionId = (id: string): ConditionId => id as ConditionId

// ============================================
// Date/Time Types (日付文字列の厳密な型)
// ============================================

/**
 * ISO 8601形式の日付文字列 (YYYY-MM-DD)
 */
export type ISODateString = Brand<string, 'ISODateString'>

/**
 * ISO 8601形式の日時文字列 (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export type ISODateTimeString = Brand<string, 'ISODateTimeString'>

/**
 * 日本形式の日付文字列 (YYYY/MM/DD)
 */
export type JapaneseDateString = Brand<string, 'JapaneseDateString'>

// 日付文字列生成ヘルパー
export const createISODateString = (date: string): ISODateString => date as ISODateString
export const createISODateTimeString = (datetime: string): ISODateTimeString => datetime as ISODateTimeString
export const createJapaneseDateString = (date: string): JapaneseDateString => date as JapaneseDateString

// ============================================
// Score Types (スコアの範囲型)
// ============================================

/**
 * 0-100の範囲のスコア
 */
export type Score0To100 = Brand<number, 'Score0To100'>

/**
 * 1-5の範囲のスコア
 */
export type Score1To5 = Brand<number, 'Score1To5'>

/**
 * 1-10の範囲のスコア
 */
export type Score1To10 = Brand<number, 'Score1To10'>

// スコア生成ヘルパー（範囲チェック付き）
export const createScore0To100 = (score: number): Score0To100 => {
  if (score < 0 || score > 100) {
    throw new Error(`Score must be between 0 and 100, got ${score}`)
  }
  return score as Score0To100
}

export const createScore1To5 = (score: number): Score1To5 => {
  if (score < 1 || score > 5) {
    throw new Error(`Score must be between 1 and 5, got ${score}`)
  }
  return score as Score1To5
}

export const createScore1To10 = (score: number): Score1To10 => {
  if (score < 1 || score > 10) {
    throw new Error(`Score must be between 1 and 10, got ${score}`)
  }
  return score as Score1To10
}

// ============================================
// Person/Organization Info (人物・組織情報)
// ============================================

/**
 * 部署情報
 */
export interface DepartmentInfo {
  readonly name: string
  readonly code?: string
}

/**
 * 人物情報（作成者・確認者用）
 */
export interface PersonInfo {
  readonly department: string
  readonly name: string
  readonly date: JapaneseDateString
  readonly userId?: UserId
}

/**
 * 作業情報
 */
export interface WorkInfo {
  readonly workName: string
  readonly factoryName: string
  readonly processName: string
  readonly workDescription?: string
}

// ============================================
// Measurement Units (測定単位)
// ============================================

/**
 * 濃度単位
 */
export type ConcentrationUnit = 'ppm' | 'mg/m³' | 'µg/m³' | '%' | 'vol%'

/**
 * 温度単位
 */
export type TemperatureUnit = '°C' | '°F' | 'K'

/**
 * 騒音単位
 */
export type NoiseUnit = 'dB' | 'dB(A)' | 'dB(C)'

/**
 * 振動単位
 */
export type VibrationUnit = 'm/s²' | 'cm/s²' | 'gal'

/**
 * 照度単位
 */
export type LightingUnit = 'lx' | 'lm' | 'cd'

/**
 * 湿度単位
 */
export type HumidityUnit = '%RH' | 'g/m³'

/**
 * 時間単位
 */
export type TimeUnit = 'hours' | 'minutes' | 'seconds' | 'days'

// ============================================
// Risk/Severity Levels (リスク・深刻度レベル)
// ============================================

/**
 * リスクレベル（4段階）
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * 深刻度レベル（4段階）
 */
export type SeverityLevel = 'minor' | 'moderate' | 'major' | 'severe'

/**
 * 保護レベル（4段階）
 */
export type ProtectionLevel = 'none' | 'low' | 'medium' | 'high'

/**
 * 優先度レベル（3段階）
 */
export type PriorityLevel = 'low' | 'medium' | 'high'

// ============================================
// Utility Types
// ============================================

/**
 * Readonly配列型
 */
export type ReadonlyArray<T> = readonly T[]

/**
 * DeepReadonly型（ネストしたオブジェクトも不変に）
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

/**
 * NonEmptyArray型（空でない配列）
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Nullable型
 */
export type Nullable<T> = T | null

/**
 * Optional型（nullableかつundefined可）
 */
export type Optional<T> = T | null | undefined
