/**
 * @3k/core - アプリケーションコア
 * ビジネスロジックとドメインモデルを含む
 */

// Bootstrap
export { bootstrap } from './app'
export type { Adapters, AppCore } from './app'

// Domain Models
export type {
  ThreeKIndexLevel,
  ScoreResult,
  Posture,
  HazardEvent,
  EnvironmentalSubstance,
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  WorkTimeFactor,
  ComprehensiveEvaluation,
  FinalScoreResult
} from './domain/evaluation'

// Services
export {
  calculatePhysicalScore,
  calculateMentalScore,
  calculateEnvironmentalScore,
  calculateHazardScore,
  calculateFinal3KIndex
} from './services/score-calculator'
export type { CalculationOptions } from './services/score-calculator'