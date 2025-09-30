import { describe, it, expect } from 'vitest'
import {
  calculatePhysicalScore,
  calculateMentalScore,
  calculateEnvironmentalScore,
  calculateHazardScore,
  calculateFinal3KIndex
} from './score-calculator'
import type {
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  Posture,
  EnvironmentalSubstance
} from '../domain/evaluation'

describe('score-calculator', () => {
  describe('calculatePhysicalScore', () => {
    it('両手で重量物を扱う場合のスコア計算', () => {
      const details: PhysicalDetails = {
        targetWeight: {
          bothHands: { kg: 30 }
        },
        checkboxes: {
          weightBoth: true,
          weightSingle: false,
          muscle: false,
          gear: false,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details)

      // 30kgは25kg以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.weight).toBe(7)
    })

    it('片手で重量物を扱う場合のスコア計算', () => {
      const details: PhysicalDetails = {
        targetWeight: {
          singleHand: { kg: 15 }
        },
        checkboxes: {
          weightBoth: false,
          weightSingle: true,
          muscle: false,
          gear: false,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details)

      // 15kgは12kg以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.weight).toBe(7)
    })

    it('筋力スコアの計算', () => {
      const details: PhysicalDetails = {
        muscleForce: { kg: 40 },
        checkboxes: {
          weightBoth: false,
          weightSingle: false,
          muscle: true,
          gear: false,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details)

      // 40kgは30kg以上なのでスコア4
      expect(result.score).toBe(4)
      expect(result.factors.muscle).toBe(4)
    })

    it('保護具着用率スコアの計算', () => {
      const details: PhysicalDetails = {
        protectiveGear: { percentage: 85 },
        checkboxes: {
          weightBoth: false,
          weightSingle: false,
          muscle: false,
          gear: true,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details)

      // 85%は80%以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.gear).toBe(7)
    })

    it('RULA姿勢評価スコアの計算', () => {
      const details: PhysicalDetails = {
        checkboxes: {
          weightBoth: false,
          weightSingle: false,
          muscle: false,
          gear: false,
          eye: false
        }
      }
      const postures: Posture[] = [
        {
          postureName: '立位作業',
          rulaScore: 6,
          owasCategory: 2
        }
      ]

      const result = calculatePhysicalScore(details, postures)

      // RULAスコア6は5以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.posture).toBe(7)
    })

    it('作業時間ファクターの適用', () => {
      const details: PhysicalDetails = {
        muscleForce: { kg: 40 },
        checkboxes: {
          weightBoth: false,
          weightSingle: false,
          muscle: true,
          gear: false,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details, [], { workTimeFactor: 1.5 })

      // 基本スコア4 × 1.5 = 6
      expect(result.score).toBe(6)
    })

    it('スコア上限は10', () => {
      const details: PhysicalDetails = {
        targetWeight: {
          bothHands: { kg: 50 }
        },
        checkboxes: {
          weightBoth: true,
          weightSingle: false,
          muscle: false,
          gear: false,
          eye: false
        }
      }

      const result = calculatePhysicalScore(details, [], { workTimeFactor: 2.0 })

      // 基本スコア10 × 2.0 = 20だが、上限10
      expect(result.score).toBe(10)
    })
  })

  describe('calculateMentalScore', () => {
    it('失敗リスクスコアの計算', () => {
      const details: MentalDetails = {
        workQuality: {
          failure: {
            level: '頻繁にある',
            duration: '40%'
          }
        }
      }

      const result = calculateMentalScore(details)

      // '頻繁にある'(7) × 40%(1.0) = 7
      expect(result.score).toBe(7)
      expect(result.factors.failure).toBe(7)
    })

    it('集中力スコアの計算', () => {
      const details: MentalDetails = {
        workQuality: {
          concentration: {
            level: '高度な集中を要する',
            duration: '60%'
          }
        }
      }

      const result = calculateMentalScore(details)

      // '高度な集中を要する'(7) × 60%(1.2) = 9
      expect(result.score).toBe(9)
      expect(result.factors.concentration).toBe(9)
    })

    it('認知負荷スコアの計算', () => {
      const details: MentalDetails = {
        workQuality: {
          cognitiveLoad: {
            level: 'ある',
            duration: '40%'
          }
        }
      }

      const result = calculateMentalScore(details)

      // 'ある'(7) × 40%(1.0) = 7
      expect(result.score).toBe(7)
      expect(result.factors.cognitive).toBe(7)
    })

    it('技能活用度スコアの計算（低い = 高スコア）', () => {
      const details: MentalDetails = {
        workQuality: {
          skillUtilization: {
            level: '低い',
            duration: '40%'
          }
        }
      }

      const result = calculateMentalScore(details)

      // '低い'(10) × 40%(1.0) = 10
      expect(result.score).toBe(10)
      expect(result.factors.skill).toBe(10)
    })

    it('複数ファクターの最大値採用', () => {
      const details: MentalDetails = {
        workQuality: {
          failure: {
            level: '稀にある',
            duration: '10%'
          },
          concentration: {
            level: '高度な集中を要する',
            duration: '40%'
          }
        }
      }

      const result = calculateMentalScore(details)

      // failure: 2×0.7=2, concentration: 7×1.0=7
      // 最大値7を採用
      expect(result.score).toBe(7)
    })
  })

  describe('calculateEnvironmentalScore', () => {
    it('化学物質スコアの計算', () => {
      const details: EnvironmentalDetails = {}
      const substances: EnvironmentalSubstance[] = [
        {
          substanceName: 'トルエン',
          measuredValue: 150,
          permissibleConcentration: 100,
          thresholdValue: 100
        }
      ]

      const result = calculateEnvironmentalScore(details, substances)

      // 150/100 = 1.5 なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.substances).toBe(7)
    })

    it('温度スコアの計算（高温）', () => {
      const details: EnvironmentalDetails = {
        temperature: 39
      }

      const result = calculateEnvironmentalScore(details)

      // 39度は38度以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.temperature).toBe(7)
    })

    it('温度スコアの計算（低温）', () => {
      const details: EnvironmentalDetails = {
        temperature: -5
      }

      const result = calculateEnvironmentalScore(details)

      // -5度は0度以下なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.temperature).toBe(7)
    })

    it('騒音スコアの計算', () => {
      const details: EnvironmentalDetails = {
        noise: 88
      }

      const result = calculateEnvironmentalScore(details)

      // 88dBは85dB以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.noise).toBe(7)
    })

    it('粉じんスコアの計算', () => {
      const details: EnvironmentalDetails = {
        dust: 7
      }

      const result = calculateEnvironmentalScore(details)

      // 7mg/m³は5以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.dust).toBe(7)
    })

    it('振動スコアの計算', () => {
      const details: EnvironmentalDetails = {
        vibration: 4
      }

      const result = calculateEnvironmentalScore(details)

      // 4m/s²は3以上なのでスコア7
      expect(result.score).toBe(7)
      expect(result.factors.vibration).toBe(7)
    })

    it('汚染レベルスコアの計算', () => {
      const details: EnvironmentalDetails = {
        contamination: '汚い'
      }

      const result = calculateEnvironmentalScore(details)

      // '汚い'はスコア7
      expect(result.score).toBe(7)
      expect(result.factors.contamination).toBe(7)
    })
  })

  describe('calculateHazardScore', () => {
    it('リスクスコアの計算（高リスク）', () => {
      const details: HazardDetails = {
        hazardEvents: [
          {
            hazardEvent: '転倒・転落',
            encounterFrequency: 5,
            dangerPossibility: 4,
            occurrencePossibility: 4,
            harmSeverity: 4
          }
        ]
      }

      const result = calculateHazardScore(details)

      // リスクポイント = 4 × 4 = 16 なのでスコア10
      expect(result.score).toBe(10)
      expect(result.factors.hazard).toBe(10)
    })

    it('リスクスコアの計算（中リスク）', () => {
      const details: HazardDetails = {
        hazardEvents: [
          {
            hazardEvent: '切創',
            encounterFrequency: 3,
            dangerPossibility: 2,
            occurrencePossibility: 2,
            harmSeverity: 3
          }
        ]
      }

      const result = calculateHazardScore(details)

      // リスクポイント = 2 × 3 = 6 なのでスコア4
      expect(result.score).toBe(4)
      expect(result.factors.hazard).toBe(4)
    })

    it('複数ハザードの最大値採用', () => {
      const details: HazardDetails = {
        hazardEvents: [
          {
            hazardEvent: '軽微な切創',
            encounterFrequency: 2,
            dangerPossibility: 1,
            occurrencePossibility: 2,
            harmSeverity: 1
          },
          {
            hazardEvent: '重大な転倒',
            encounterFrequency: 4,
            dangerPossibility: 3,
            occurrencePossibility: 3,
            harmSeverity: 4
          }
        ]
      }

      const result = calculateHazardScore(details)

      // 軽微: 2×1=2 (スコア2), 重大: 3×4=12 (スコア7)
      // 最大値7を採用
      expect(result.score).toBe(7)
    })
  })

  describe('calculateFinal3KIndex', () => {
    it('3K指数A判定（7点以上）', () => {
      const result = calculateFinal3KIndex(7, 8, 6, 9)

      expect(result.final3KIndex).toBe('A')
      expect(result.finalKitsusaScore).toBe(9)
    })

    it('3K指数B判定（4-6点）', () => {
      const result = calculateFinal3KIndex(4, 5, 3, 6)

      expect(result.final3KIndex).toBe('B')
      expect(result.finalKitsusaScore).toBe(6)
    })

    it('3K指数C判定（2-3点）', () => {
      const result = calculateFinal3KIndex(2, 3, 2, 2)

      expect(result.final3KIndex).toBe('C')
      expect(result.finalKitsusaScore).toBe(3)
    })

    it('3K指数D判定（1点）', () => {
      const result = calculateFinal3KIndex(1, 1, 1, 1)

      expect(result.final3KIndex).toBe('D')
      expect(result.finalKitsusaScore).toBe(1)
    })

    it('作業時間ファクター適用後の3K指数計算', () => {
      const result = calculateFinal3KIndex(4, 5, 3, 4, 1.5)

      // 各スコアが1.5倍: 6, 8, 5, 6
      // 最大値8 → A判定
      expect(result.final3KIndex).toBe('A')
      expect(result.finalKitsusaScore).toBe(8)
      expect(result.physicalScore).toBe(6)
      expect(result.mentalScore).toBe(8)
    })

    it('スコア上限チェック（10を超えない）', () => {
      const result = calculateFinal3KIndex(10, 10, 10, 10, 2.0)

      // 各スコア10のまま（上限適用）
      expect(result.physicalScore).toBe(10)
      expect(result.mentalScore).toBe(10)
      expect(result.environmentalScore).toBe(10)
      expect(result.hazardScore).toBe(10)
      expect(result.finalKitsusaScore).toBe(10)
    })

    it('計算詳細の確認', () => {
      const result = calculateFinal3KIndex(5, 6, 4, 7, 1.2)

      expect(result.calculationDetails).toBeDefined()
      expect(result.calculationDetails.originalScores).toEqual({
        physical: 5,
        mental: 6,
        environmental: 4,
        hazard: 7
      })
      expect(result.calculationDetails.workTimeFactor).toBe(1.2)
      expect(result.calculationDetails.adjustedScores).toEqual({
        physical: 6,
        mental: 8,
        environmental: 5,
        hazard: 9
      })
    })
  })
})