'use client'

/**
 * useEvaluation - @3k/coreの評価計算ロジックを使用するカスタムフック
 */

import { useCallback } from 'react'
import type {
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  Posture,
  EnvironmentalSubstance,
  FinalScoreResult
} from '@3k/core'

export function useEvaluation(): {
  calculatePhysical: (details: PhysicalDetails, postures?: Posture[], workTimeFactor?: number) => Promise<unknown>
  calculateMental: (details: MentalDetails, workTimeFactor?: number) => Promise<unknown>
  calculateEnvironmental: (details: EnvironmentalDetails, substances?: EnvironmentalSubstance[]) => Promise<unknown>
  calculateHazard: (details: HazardDetails) => Promise<unknown>
  calculateFinal3K: (physicalScore: number, mentalScore: number, environmentalScore: number, hazardScore: number, workTimeFactor?: number) => Promise<FinalScoreResult>
} {
  const calculatePhysical = useCallback(
    async (details: PhysicalDetails, postures: Posture[] = [], workTimeFactor: number = 1.0) => {
      const { calculatePhysicalScore } = await import('@3k/core')
      return calculatePhysicalScore(details, postures, { workTimeFactor })
    },
    []
  )

  const calculateMental = useCallback(
    async (details: MentalDetails, workTimeFactor: number = 1.0) => {
      const { calculateMentalScore } = await import('@3k/core')
      return calculateMentalScore(details, { workTimeFactor })
    },
    []
  )

  const calculateEnvironmental = useCallback(
    async (details: EnvironmentalDetails, substances: EnvironmentalSubstance[] = []) => {
      const { calculateEnvironmentalScore } = await import('@3k/core')
      return calculateEnvironmentalScore(details, substances)
    },
    []
  )

  const calculateHazard = useCallback(async (details: HazardDetails) => {
    const { calculateHazardScore } = await import('@3k/core')
    return calculateHazardScore(details)
  }, [])

  const calculateFinal3K = useCallback(
    async (
      physicalScore: number,
      mentalScore: number,
      environmentalScore: number,
      hazardScore: number,
      workTimeFactor: number = 1.0
    ): Promise<FinalScoreResult> => {
      const { calculateFinal3KIndex } = await import('@3k/core')
      return calculateFinal3KIndex(
        physicalScore,
        mentalScore,
        environmentalScore,
        hazardScore,
        workTimeFactor
      )
    },
    []
  )

  return {
    calculatePhysical,
    calculateMental,
    calculateEnvironmental,
    calculateHazard,
    calculateFinal3K
  }
}