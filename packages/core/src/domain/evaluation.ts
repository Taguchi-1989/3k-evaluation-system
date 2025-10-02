/**
 * 評価ドメインモデル
 * ビジネスロジックのコア型定義
 */

/**
 * 3K指数レベル
 */
export type ThreeKIndexLevel = 'A' | 'B' | 'C' | 'D'

/**
 * スコア計算結果
 */
export interface ScoreResult {
  readonly score: number
  readonly details: Record<string, unknown>
  readonly factors?: Record<string, number>
}

/**
 * 姿勢評価データ
 */
export interface Posture {
  readonly postureName: string
  readonly rulaScore: number
  readonly owasCategory: number
}

/**
 * 危険事象
 */
export interface HazardEvent {
  readonly hazardEvent: string
  readonly encounterFrequency: number
  readonly dangerPossibility: number
  readonly occurrencePossibility: number
  readonly harmSeverity: number
}

/**
 * 化学物質データ
 */
export interface EnvironmentalSubstance {
  readonly substanceName: string
  readonly measuredValue: number
  readonly permissibleConcentration?: number
  readonly thresholdValue?: number
}

/**
 * 肉体因子詳細
 */
export interface PhysicalDetails {
  readonly targetWeight?: {
    bothHands?: { kg: number }
    singleHand?: { kg: number }
  }
  readonly muscleForce?: {
    kg: number
  }
  readonly protectiveGear?: {
    percentage: number
  }
  readonly eyeStrain?: {
    percentage: number
  }
  readonly manualInput?: {
    strength: string
    duration: string
  }
  readonly checkboxes?: {
    weightBoth?: boolean
    weightSingle?: boolean
    muscle?: boolean
    gear?: boolean
    eye?: boolean
  }
  // Index signature for compatibility with Record<string, unknown>
  readonly [key: string]: unknown
}

/**
 * 精神因子詳細
 */
export interface MentalDetails {
  readonly workQuality?: {
    failure?: {
      level: string
      duration: string
    }
    concentration?: {
      level: string
      duration: string
    }
    cognitiveLoad?: {
      level: string
      duration: string
    }
    emotionalBurden?: {
      level: string
      duration: string
    }
    skillUtilization?: {
      level: string
      duration: string
    }
    workControl?: {
      level: string
      duration: string
    }
  }
  readonly manualInput?: {
    strength: string
    duration: string
  }
  // Index signature for compatibility with Record<string, unknown>
  readonly [key: string]: unknown
}

/**
 * 環境因子詳細
 */
export interface EnvironmentalDetails {
  readonly temperature?: number
  readonly noise?: number
  readonly dust?: number
  readonly vibration?: number
  readonly contamination?: string
  // Index signature for compatibility with Record<string, unknown>
  readonly [key: string]: unknown
}

/**
 * 危険因子詳細
 */
export interface HazardDetails {
  readonly hazardEvents?: HazardEvent[]
  // Index signature for compatibility with Record<string, unknown>
  readonly [key: string]: unknown
}

/**
 * 作業時間因子
 */
export interface WorkTimeFactor {
  readonly dailyHours: number
  readonly weeklyDays: number
  readonly factor: number
}

/**
 * 包括的評価データ
 */
export interface ComprehensiveEvaluation {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt?: string
  readonly workDescription: string
  readonly physicalDetails?: PhysicalDetails
  readonly mentalDetails?: MentalDetails
  readonly environmentalDetails?: EnvironmentalDetails
  readonly hazardDetails?: HazardDetails
  readonly workTimeFactor?: WorkTimeFactor
  readonly postures?: Posture[]
  readonly substances?: EnvironmentalSubstance[]
  readonly physicalScore?: number
  readonly mentalScore?: number
  readonly environmentalScore?: number
  readonly hazardScore?: number
  readonly workTimeScore?: number
  readonly final3KIndex?: ThreeKIndexLevel
  readonly finalKitsusaScore?: number
  readonly calculationDetails?: Record<string, unknown>
}

/**
 * 最終スコア計算結果
 */
export interface FinalScoreResult {
  readonly physicalScore: number
  readonly mentalScore: number
  readonly environmentalScore: number
  readonly hazardScore: number
  readonly workTimeScore: number
  readonly final3KIndex: ThreeKIndexLevel
  readonly finalKitsusaScore: number
  readonly calculationDetails: Record<string, unknown>
}