/**
 * スコア計算サービス
 * 純粋な計算ロジック - 外部依存なし
 */

import type {
  ScoreResult,
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  Posture,
  EnvironmentalSubstance,
  FinalScoreResult,
  ThreeKIndexLevel
} from '../domain/evaluation'

/**
 * スコア計算オプション
 */
export interface CalculationOptions {
  readonly workTimeFactor?: number
  readonly useMatrixCalculation?: boolean
}

/**
 * 肉体因スコア計算
 */
export function calculatePhysicalScore(
  details: PhysicalDetails,
  postures: Posture[] = [],
  options: CalculationOptions = {}
): ScoreResult {
  const { workTimeFactor = 1.0 } = options
  const factors: Record<string, number> = {}
  const calculationDetails: Record<string, unknown> = {}

  // 重量取扱いスコア
  if (details.targetWeight) {
    let weightScore = 1

    if (details.targetWeight.bothHands && details.checkboxes?.weightBoth) {
      const kg = details.targetWeight.bothHands.kg
      weightScore = Math.max(weightScore, calculateWeightScore(kg, 'both_hands'))
    }

    if (details.targetWeight.singleHand && details.checkboxes?.weightSingle) {
      const kg = details.targetWeight.singleHand.kg
      weightScore = Math.max(weightScore, calculateWeightScore(kg, 'single_hand'))
    }

    factors.weight = weightScore
    calculationDetails.weightCalculation = {
      bothHands: details.targetWeight.bothHands,
      singleHand: details.targetWeight.singleHand,
      score: weightScore
    }
  }

  // 筋力スコア
  if (details.muscleForce && details.checkboxes?.muscle) {
    const muscleScore = calculateMuscleForceScore(details.muscleForce.kg)
    factors.muscle = muscleScore
    calculationDetails.muscleCalculation = {
      force: details.muscleForce.kg,
      score: muscleScore
    }
  }

  // 保護具スコア
  if (details.protectiveGear && details.checkboxes?.gear) {
    const gearScore = calculateProtectiveGearScore(details.protectiveGear.percentage)
    factors.gear = gearScore
    calculationDetails.gearCalculation = {
      percentage: details.protectiveGear.percentage,
      score: gearScore
    }
  }

  // 目の疲労スコア
  if (details.eyeStrain && details.checkboxes?.eye) {
    const eyeScore = calculateEyeStrainScore(details.eyeStrain.percentage)
    factors.eye = eyeScore
    calculationDetails.eyeCalculation = {
      percentage: details.eyeStrain.percentage,
      score: eyeScore
    }
  }

  // 姿勢評価スコア
  if (postures.length > 0) {
    const postureScores = postures.map(posture => {
      const rulaScore = calculateRulaScore(posture.rulaScore)
      const owasScore = calculateOwasScore(posture.owasCategory)
      const finalScore = Math.max(rulaScore, owasScore)

      return {
        postureName: posture.postureName,
        rulaScore: posture.rulaScore,
        owasCategory: posture.owasCategory,
        finalScore,
        calculationMethod: 'traditional'
      }
    })

    const maxPostureScore = Math.max(...postureScores.map(p => p.finalScore))
    factors.posture = maxPostureScore
    calculationDetails.postureCalculation = {
      postures: postureScores,
      maxScore: maxPostureScore
    }
  }

  // 手動入力
  if (details.manualInput) {
    const manualScore = calculateManualInputScore(
      details.manualInput.strength,
      details.manualInput.duration
    )
    factors.manualInput = manualScore
    calculationDetails.manualInputCalculation = {
      strength: details.manualInput.strength,
      duration: details.manualInput.duration,
      score: manualScore
    }
  }

  // 最大値を基本スコアとして採用
  const factorScores = Object.values(factors)
  const baseScore = factorScores.length > 0 ? Math.max(...factorScores) : 1

  // 作業時間ファクター適用
  const totalScore = Math.min(Math.ceil(baseScore * workTimeFactor), 10)

  return {
    score: totalScore,
    details: calculationDetails,
    factors
  }
}

/**
 * 精神因スコア計算
 */
export function calculateMentalScore(
  details: MentalDetails,
  options: CalculationOptions = {}
): ScoreResult {
  const { workTimeFactor = 1.0 } = options
  const factors: Record<string, number> = {}
  const calculationDetails: Record<string, unknown> = {}

  if (details.workQuality) {
    const wq = details.workQuality

    // 失敗リスクスコア
    if (wq.failure) {
      const failureScore = calculateFailureScore(wq.failure.level, wq.failure.duration)
      factors.failure = failureScore
      calculationDetails.failureCalculation = {
        level: wq.failure.level,
        duration: wq.failure.duration,
        score: failureScore
      }
    }

    // 集中力スコア
    if (wq.concentration) {
      const concentrationScore = calculateConcentrationScore(
        wq.concentration.level,
        wq.concentration.duration
      )
      factors.concentration = concentrationScore
      calculationDetails.concentrationCalculation = {
        level: wq.concentration.level,
        duration: wq.concentration.duration,
        score: concentrationScore
      }
    }

    // 認知負荷スコア
    if (wq.cognitiveLoad) {
      const cognitiveScore = calculateCognitiveLoadScore(
        wq.cognitiveLoad.level,
        wq.cognitiveLoad.duration
      )
      factors.cognitive = cognitiveScore
      calculationDetails.cognitiveCalculation = {
        level: wq.cognitiveLoad.level,
        duration: wq.cognitiveLoad.duration,
        score: cognitiveScore
      }
    }

    // 感情負担スコア
    if (wq.emotionalBurden) {
      const emotionalScore = calculateEmotionalBurdenScore(
        wq.emotionalBurden.level,
        wq.emotionalBurden.duration
      )
      factors.emotional = emotionalScore
      calculationDetails.emotionalCalculation = {
        level: wq.emotionalBurden.level,
        duration: wq.emotionalBurden.duration,
        score: emotionalScore
      }
    }

    // 技能活用度スコア
    if (wq.skillUtilization) {
      const skillScore = calculateSkillUtilizationScore(
        wq.skillUtilization.level,
        wq.skillUtilization.duration
      )
      factors.skill = skillScore
      calculationDetails.skillCalculation = {
        level: wq.skillUtilization.level,
        duration: wq.skillUtilization.duration,
        score: skillScore
      }
    }

    // 作業統制度スコア
    if (wq.workControl) {
      const controlScore = calculateWorkControlScore(
        wq.workControl.level,
        wq.workControl.duration
      )
      factors.control = controlScore
      calculationDetails.controlCalculation = {
        level: wq.workControl.level,
        duration: wq.workControl.duration,
        score: controlScore
      }
    }
  }

  // 手動入力スコア
  if (details.manualInput) {
    const manualScore = calculateManualInputScore(
      details.manualInput.strength,
      details.manualInput.duration
    )
    factors.manualInput = manualScore
    calculationDetails.manualInputCalculation = {
      strength: details.manualInput.strength,
      duration: details.manualInput.duration,
      score: manualScore
    }
  }

  // 最大値を基本スコアとして採用
  const factorScores = Object.values(factors)
  const baseScore = factorScores.length > 0 ? Math.max(...factorScores) : 1

  // 作業時間ファクター適用
  const totalScore = Math.min(Math.ceil(baseScore * workTimeFactor), 10)

  return {
    score: totalScore,
    details: calculationDetails,
    factors
  }
}

/**
 * 環境因スコア計算
 */
export function calculateEnvironmentalScore(
  details: EnvironmentalDetails,
  substances: EnvironmentalSubstance[] = []
): ScoreResult {
  const factors: Record<string, number> = {}
  const calculationDetails: Record<string, unknown> = {}

  // 化学物質スコア
  if (substances.length > 0) {
    const substanceScores = substances.map(substance => {
      const score = calculateChemicalScore(
        substance.measuredValue,
        substance.permissibleConcentration || 100
      )

      return {
        substanceName: substance.substanceName,
        measuredValue: substance.measuredValue,
        thresholdValue: substance.thresholdValue,
        score
      }
    })

    const maxSubstanceScore = Math.max(...substanceScores.map(s => s.score))
    factors.substances = maxSubstanceScore
    calculationDetails.substancesCalculation = {
      substances: substanceScores,
      maxScore: maxSubstanceScore
    }
  }

  // 温度スコア
  if (details.temperature !== undefined) {
    const tempScore = calculateTemperatureScore(details.temperature)
    factors.temperature = tempScore
    calculationDetails.temperatureCalculation = {
      temperature: details.temperature,
      score: tempScore
    }
  }

  // 騒音スコア
  if (details.noise !== undefined) {
    const noiseScore = calculateNoiseScore(details.noise)
    factors.noise = noiseScore
    calculationDetails.noiseCalculation = {
      noise: details.noise,
      score: noiseScore
    }
  }

  // 粉じんスコア
  if (details.dust !== undefined) {
    const dustScore = calculateDustScore(details.dust)
    factors.dust = dustScore
    calculationDetails.dustCalculation = {
      dust: details.dust,
      score: dustScore
    }
  }

  // 振動スコア
  if (details.vibration !== undefined) {
    const vibrationScore = calculateVibrationScore(details.vibration)
    factors.vibration = vibrationScore
    calculationDetails.vibrationCalculation = {
      vibration: details.vibration,
      score: vibrationScore
    }
  }

  // 汚染レベルスコア
  if (details.contamination !== undefined) {
    const contaminationScore = calculateContaminationScore(details.contamination)
    factors.contamination = contaminationScore
    calculationDetails.contaminationCalculation = {
      level: details.contamination,
      score: contaminationScore
    }
  }

  // 最大値を採用
  const factorScores = Object.values(factors)
  const totalScore = factorScores.length > 0 ? Math.max(...factorScores) : 1

  return {
    score: totalScore,
    details: calculationDetails,
    factors
  }
}

/**
 * 危険因スコア計算
 */
export function calculateHazardScore(details: HazardDetails): ScoreResult {
  const factors: Record<string, number> = {}
  const calculationDetails: Record<string, unknown> = {}

  if (details.hazardEvents && details.hazardEvents.length > 0) {
    const hazardScores = details.hazardEvents.map(event => {
      const riskScore = calculateRiskScore(
        event.encounterFrequency,
        event.dangerPossibility,
        event.occurrencePossibility,
        event.harmSeverity
      )

      return {
        hazardEvent: event.hazardEvent,
        encounterFrequency: event.encounterFrequency,
        dangerPossibility: event.dangerPossibility,
        occurrencePossibility: event.occurrencePossibility,
        harmSeverity: event.harmSeverity,
        riskScore
      }
    })

    const maxHazardScore = Math.max(...hazardScores.map(h => h.riskScore))
    factors.hazard = maxHazardScore

    calculationDetails.hazardCalculation = {
      events: hazardScores,
      maxScore: maxHazardScore
    }
  }

  const totalScore = factors.hazard || 1

  return {
    score: totalScore,
    details: calculationDetails,
    factors
  }
}

/**
 * 最終3K指数を計算
 */
export function calculateFinal3KIndex(
  physicalScore: number,
  mentalScore: number,
  environmentalScore: number,
  hazardScore: number,
  workTimeFactor: number = 1.0
): FinalScoreResult {
  // 各因子スコアに作業時間ファクターを適用
  const adjustedPhysicalScore = Math.min(Math.ceil(physicalScore * workTimeFactor), 10)
  const adjustedMentalScore = Math.min(Math.ceil(mentalScore * workTimeFactor), 10)
  const adjustedEnvironmentalScore = Math.min(Math.ceil(environmentalScore * workTimeFactor), 10)
  const adjustedHazardScore = Math.min(Math.ceil(hazardScore * workTimeFactor), 10)

  // 最終キツさスコア（最大値を採用）
  const finalKitsusaScore = Math.max(
    adjustedPhysicalScore,
    adjustedMentalScore,
    adjustedEnvironmentalScore,
    adjustedHazardScore
  )

  // 3K指数の決定
  let final3KIndex: ThreeKIndexLevel
  if (finalKitsusaScore >= 7) {
    final3KIndex = 'A'
  } else if (finalKitsusaScore >= 4) {
    final3KIndex = 'B'
  } else if (finalKitsusaScore >= 2) {
    final3KIndex = 'C'
  } else {
    final3KIndex = 'D'
  }

  const calculationDetails = {
    originalScores: {
      physical: physicalScore,
      mental: mentalScore,
      environmental: environmentalScore,
      hazard: hazardScore
    },
    workTimeFactor,
    adjustedScores: {
      physical: adjustedPhysicalScore,
      mental: adjustedMentalScore,
      environmental: adjustedEnvironmentalScore,
      hazard: adjustedHazardScore
    },
    maxScore: finalKitsusaScore,
    indexMapping: {
      'A': '7-10点: 改善必須',
      'B': '4-6点: 改善推奨',
      'C': '2-3点: 注意必要',
      'D': '1点: 良好'
    }
  }

  return {
    physicalScore: adjustedPhysicalScore,
    mentalScore: adjustedMentalScore,
    environmentalScore: adjustedEnvironmentalScore,
    hazardScore: adjustedHazardScore,
    workTimeScore: workTimeFactor,
    final3KIndex,
    finalKitsusaScore,
    calculationDetails
  }
}

// ===== ヘルパー関数 =====

function calculateWeightScore(kg: number, handType: 'both_hands' | 'single_hand'): number {
  if (handType === 'both_hands') {
    if (kg >= 40) return 10
    if (kg >= 25) return 7
    if (kg >= 15) return 4
    if (kg >= 10) return 2
    return 1
  } else {
    if (kg >= 20) return 10
    if (kg >= 12) return 7
    if (kg >= 7) return 4
    if (kg >= 5) return 2
    return 1
  }
}

function calculateMuscleForceScore(force: number): number {
  if (force >= 50) return 7
  if (force >= 30) return 4
  if (force >= 15) return 2
  return 1
}

function calculateProtectiveGearScore(percentage: number): number {
  if (percentage >= 80) return 7
  if (percentage >= 50) return 4
  if (percentage >= 20) return 2
  return 1
}

function calculateEyeStrainScore(percentage: number): number {
  if (percentage >= 70) return 7
  if (percentage >= 40) return 4
  if (percentage >= 15) return 2
  return 1
}

function calculateRulaScore(score: number): number {
  if (score === 7) return 10
  if (score >= 5) return 7
  if (score >= 3) return 4
  return 2
}

function calculateOwasScore(category: number): number {
  if (category === 4) return 10
  if (category === 3) return 7
  if (category === 2) return 4
  return 2
}

function calculateManualInputScore(strength: string, duration: string): number {
  const strengthScores: Record<string, number> = {
    '軽い': 1,
    '少しきつい': 2,
    'きつい': 4,
    'とてもきつい': 7,
    '限界': 10
  }

  const durationFactors: Record<string, number> = {
    '<10%': 0.7,
    '10-50%': 1.0,
    '>50%': 1.5
  }

  const baseScore = strengthScores[strength] || 1
  const factor = durationFactors[duration] || 1.0

  return Math.min(Math.ceil(baseScore * factor), 10)
}

function calculateFailureScore(level: string, duration: string): number {
  const levelScores: Record<string, number> = {
    'ほとんどない': 1,
    '稀にある': 2,
    '時々ある': 4,
    '頻繁にある': 7
  }

  const durationFactors: Record<string, number> = {
    '5%': 0.5,
    '10%': 0.7,
    '15%': 0.8,
    '20%': 0.9,
    '40%': 1.0,
    '60%': 1.2,
    '80%': 1.5
  }

  const baseScore = levelScores[level] || 1
  const factor = durationFactors[duration] || 1.0

  return Math.min(Math.ceil(baseScore * factor), 10)
}

function calculateMentalFactorScore(
  level: string,
  duration: string,
  scoreMapping: Record<string, number>
): number {
  const durationFactors: Record<string, number> = {
    '5%': 0.5,
    '10%': 0.7,
    '15%': 0.8,
    '20%': 0.9,
    '40%': 1.0,
    '60%': 1.2,
    '80%': 1.5
  }

  const baseScore = scoreMapping[level] || 1
  const factor = durationFactors[duration] || 1.0

  return Math.min(Math.ceil(baseScore * factor), 10)
}

function calculateConcentrationScore(level: string, duration: string): number {
  return calculateMentalFactorScore(level, duration, {
    'ほとんど集中を要しない': 1,
    '軽度の集中を要する': 2,
    '中程度の集中を要する': 4,
    '高度な集中を要する': 7,
    '極めて高度な集中を要する': 10
  })
}

function calculateCognitiveLoadScore(level: string, duration: string): number {
  return calculateMentalFactorScore(level, duration, {
    'ない': 1,
    'あまりない': 1,
    'どちらとも言えない': 2,
    '比較的ある': 4,
    'ある': 7
  })
}

function calculateEmotionalBurdenScore(level: string, duration: string): number {
  return calculateMentalFactorScore(level, duration, {
    'ない': 1,
    'あまりない': 1,
    'どちらとも言えない': 2,
    '比較的ある': 4,
    'ある': 7
  })
}

function calculateSkillUtilizationScore(level: string, duration: string): number {
  return calculateMentalFactorScore(level, duration, {
    '高い': 1,
    'やや高い': 2,
    'どちらとも言えない': 4,
    'やや低い': 7,
    '低い': 10
  })
}

function calculateWorkControlScore(level: string, duration: string): number {
  return calculateMentalFactorScore(level, duration, {
    '高い': 1,
    'やや高い': 2,
    'どちらとも言えない': 4,
    'やや低い': 7,
    '低い': 10
  })
}

function calculateChemicalScore(measuredValue: number, permissibleConcentration: number): number {
  const ratio = measuredValue / permissibleConcentration

  if (ratio >= 2.0) return 10
  if (ratio >= 1.5) return 7
  if (ratio >= 1.0) return 4
  if (ratio >= 0.5) return 2
  return 1
}

function calculateTemperatureScore(temperature: number): number {
  if (temperature >= 35) {
    // 高温環境
    if (temperature >= 40) return 10
    if (temperature >= 38) return 7
    if (temperature >= 36) return 4
    return 2
  } else if (temperature <= 5) {
    // 低温環境
    if (temperature <= -10) return 10
    if (temperature <= 0) return 7
    if (temperature <= 3) return 4
    return 2
  }
  return 1
}

function calculateNoiseScore(noise: number): number {
  if (noise >= 90) return 10
  if (noise >= 85) return 7
  if (noise >= 80) return 4
  if (noise >= 75) return 2
  return 1
}

function calculateDustScore(dust: number): number {
  if (dust >= 10) return 10
  if (dust >= 5) return 7
  if (dust >= 2) return 4
  if (dust >= 1) return 2
  return 1
}

function calculateVibrationScore(vibration: number): number {
  if (vibration >= 5) return 10
  if (vibration >= 3) return 7
  if (vibration >= 1.5) return 4
  if (vibration >= 0.5) return 2
  return 1
}

function calculateContaminationScore(contamination: string): number {
  const scores: Record<string, number> = {
    '極めて汚い': 10,
    '汚い': 7,
    'やや汚い': 4,
    '少し汚い': 2,
    'きれい': 1
  }
  return scores[contamination] || 1
}

function calculateRiskScore(
  encounterFrequency: number,
  dangerPossibility: number,
  occurrencePossibility: number,
  harmSeverity: number
): number {
  // リスクポイント = 発生可能性 × 重篤度
  const riskPoint = occurrencePossibility * harmSeverity

  if (riskPoint >= 16) return 10 // 致命的
  if (riskPoint >= 10) return 7  // 高リスク
  if (riskPoint >= 5) return 4   // 中リスク
  if (riskPoint >= 1) return 2   // 低リスク
  return 1
}