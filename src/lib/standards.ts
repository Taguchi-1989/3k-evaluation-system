/**
 * 評価基準値管理システム
 * 3K指数評価アプリの基準値とスコア計算ロジックを管理
 */

import { getEvaluationStandards, getStandardByCategory, getChemicalStandard } from '../data/evaluationStandards';
import type { EvaluationStandards as EvalStandards } from '@/types/evaluation-standards';

export interface EvaluationStandards {
  environmental_factors: Record<string, unknown>;
  physical_factors: Record<string, unknown>;
  mental_factors: Record<string, unknown>;
  hazard_factors: Record<string, unknown>;
  work_time_factors: Record<string, unknown>;
}

export interface ChemicalSubstance {
  substance_name: string;
  cas_number?: string;
  permissible_concentration: number;
  unit: string;
  short_term_limit?: number;
  ceiling_limit?: number;
  evaluation_thresholds: {
    low: number;
    medium: number;
    high: number;
    danger: number;
  };
  health_effects: string[];
  reference_source: string;
  effective_date: string;
}

export interface PhysicalStandards {
  rula_assessment: Record<string, unknown>;
  owas_assessment: Record<string, unknown>;
  weight_limits: Record<string, unknown>;
}

export interface EnvironmentalStandards {
  chemical_substances: Record<string, unknown>;
  physical_conditions: Record<string, unknown>;
}

export class EvaluationStandardsService {
  private static instance: EvaluationStandardsService;
  private standards: EvaluationStandards;

  private constructor() {
    this.standards = getEvaluationStandards().evaluation_standards as unknown as EvaluationStandards;
  }

  public static getInstance(): EvaluationStandardsService {
    if (!EvaluationStandardsService.instance) {
      EvaluationStandardsService.instance = new EvaluationStandardsService();
    }
    return EvaluationStandardsService.instance;
  }

  /**
   * 基準値JSONを再読み込み（開発時のホットリロード対応）
   */
  public reloadStandards(): void {
    this.standards = getEvaluationStandards().evaluation_standards as unknown as EvaluationStandards;
  }

  /**
   * 環境因基準値を取得
   */
  public getEnvironmentalStandards(): EnvironmentalStandards {
    return this.standards.environmental_factors as unknown as EnvironmentalStandards;
  }

  /**
   * 肉体因基準値を取得
   */
  public getPhysicalStandards(): PhysicalStandards {
    return this.standards.physical_factors as unknown as PhysicalStandards;
  }

  /**
   * 精神因基準値を取得
   */
  public getMentalStandards(): Record<string, unknown> {
    return this.standards.mental_factors;
  }

  /**
   * 危険因基準値を取得
   */
  public getHazardStandards(): Record<string, unknown> {
    return this.standards.hazard_factors;
  }

  /**
   * 作業時間因基準値を取得
   */
  public getWorkTimeStandards(): Record<string, unknown> {
    return this.standards.work_time_factors;
  }

  /**
   * 化学物質の基準値を取得
   */
  public getChemicalSubstanceStandard(substanceName: string): ChemicalSubstance | null {
    return getChemicalStandard(substanceName) as ChemicalSubstance | null;
  }

  /**
   * 化学物質のスコアを計算
   */
  public calculateChemicalScore(substanceName: string, measuredValue: number): number {
    const standard = this.getChemicalSubstanceStandard(substanceName);
    if (!standard) return 1; // デフォルトスコア

    const thresholds = standard.evaluation_thresholds;
    
    if (measuredValue >= thresholds.danger) return 7;
    if (measuredValue >= thresholds.high) return 4;
    if (measuredValue >= thresholds.medium) return 2;
    if (measuredValue >= thresholds.low) return 1;
    
    return 1;
  }

  /**
   * WBGT温度スコアを計算
   */
  public calculateWBGTScore(wbgtValue: number, workIntensity: 'light_work' | 'moderate_work' | 'heavy_work', restPercentage: 'continuous' | 'rest_25_percent' | 'rest_50_percent' | 'rest_75_percent'): number {
    const tempStandards = (this.standards.environmental_factors as { physical_conditions: { temperature_hot: { work_intensity_thresholds: Record<string, Record<string, number>> } } }).physical_conditions.temperature_hot;
    const threshold = tempStandards.work_intensity_thresholds[workIntensity]?.[restPercentage] ?? 30;

    if (wbgtValue >= threshold) return 7;
    if (wbgtValue >= (threshold - 1)) return 4;
    if (wbgtValue >= (threshold - 3)) return 2;
    return 1;
  }

  /**
   * 寒冷温度スコアを計算
   */
  public calculateColdScore(temperature: number): number {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const coldStandards = (this.standards.environmental_factors as { physical_conditions: { temperature_cold: Record<string, unknown> } }).physical_conditions.temperature_cold;
    
    if (temperature <= -18) return 7;
    if (temperature <= -12) return 4;
    if (temperature <= -7) return 2;
    return 1;
  }

  /**
   * 騒音スコアを計算
   */
  public calculateNoiseScore(noiseLevel: number, noiseType: 'continuous' | 'impact'): number {
    const envFactors = this.standards.environmental_factors as { physical_conditions: { noise_continuous: Record<string, unknown>; noise_impact: Record<string, unknown> } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const noiseStandards = noiseType === 'continuous'
      ? envFactors.physical_conditions.noise_continuous
      : envFactors.physical_conditions.noise_impact;

    if (noiseType === 'continuous') {
      if (noiseLevel >= 85) return 7;
      if (noiseLevel >= 80) return 4;
      if (noiseLevel >= 75) return 2;
      return 1;
    } else {
      if (noiseLevel >= 135) return 7;
      if (noiseLevel >= 130) return 4;
      if (noiseLevel >= 120) return 2;
      return 1;
    }
  }

  /**
   * 振動スコアを計算
   */
  public calculateVibrationScore(vibrationValue: number, vibrationType: 'whole_body' | 'hand_arm'): number {
    const envFactors = this.standards.environmental_factors as { physical_conditions: { vibration_whole_body: Record<string, unknown>; vibration_hand_arm: Record<string, unknown> } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const vibrationStandards = vibrationType === 'whole_body'
      ? envFactors.physical_conditions.vibration_whole_body
      : envFactors.physical_conditions.vibration_hand_arm;

    const threshold = vibrationType === 'whole_body' ? 0.5 : 2.5;
    const mediumThreshold = vibrationType === 'whole_body' ? 0.35 : 1.75;
    const lowThreshold = vibrationType === 'whole_body' ? 0.25 : 1.25;

    if (vibrationValue >= threshold) return 7;
    if (vibrationValue >= mediumThreshold) return 4;
    if (vibrationValue >= lowThreshold) return 2;
    return 1;
  }

  /**
   * 粉じんスコアを計算
   */
  public calculateDustScore(dustLevel: number): number {
    if (dustLevel >= 3.0) return 7;
    if (dustLevel >= 1.5) return 4;
    if (dustLevel >= 0.75) return 2;
    return 1;
  }

  /**
   * UV線スコアを計算
   */
  public calculateUVScore(uvExposure: number): number {
    if (uvExposure >= 30) return 7;
    if (uvExposure >= 15) return 4;
    if (uvExposure >= 7.5) return 2;
    return 1;
  }

  /**
   * 汚染レベルスコアを取得
   */
  public getContaminationScore(level: number): number {
    const contaminationStandards = (this.standards.environmental_factors as { physical_conditions: { contamination_levels: { levels: Record<string, { score: number }> } } }).physical_conditions.contamination_levels;
    const levelKey = `level_${level}`;
    return contaminationStandards.levels[levelKey]?.score || 1;
  }

  /**
   * RULAスコア評価を取得
   */
  public getRulaEvaluation(score: number): { level: string; score: number; action: string } {
    const rulaStandard = (this.standards.physical_factors as { rula_assessment: { score_ranges: Record<string, { level: string; action: string }> } }).rula_assessment;
    const ranges = rulaStandard.score_ranges;

    if (score >= 1 && score <= 2) return { level: ranges['1_2']?.level ?? 'unknown', score: 1, action: ranges['1_2']?.action ?? 'unknown' };
    if (score >= 3 && score <= 4) return { level: ranges['3_4']?.level ?? 'unknown', score: 2, action: ranges['3_4']?.action ?? 'unknown' };
    if (score >= 5 && score <= 6) return { level: ranges['5_6']?.level ?? 'unknown', score: 4, action: ranges['5_6']?.action ?? 'unknown' };
    if (score === 7) return { level: ranges['7']?.level ?? 'unknown', score: 7, action: ranges['7']?.action ?? 'unknown' };

    return { level: 'unknown', score: 1, action: 'unknown' };
  }

  /**
   * OWASカテゴリ評価を取得
   */
  public getOwasEvaluation(category: number): { level: string; score: number; action: string } {
    const owasStandard = (this.standards.physical_factors as { owas_assessment: { categories: Record<string, { level: string; action: string }> } }).owas_assessment;
    const categories = owasStandard.categories;
    
    const categoryData = categories[category.toString()];
    if (!categoryData) return { level: 'unknown', score: 1, action: 'unknown' };

    // OWASカテゴリをスコアに変換
    const scoreMapping: { [key: number]: number } = { 1: 1, 2: 2, 3: 4, 4: 7 };
    
    return {
      level: categoryData.level,
      score: scoreMapping[category] || 1,
      action: categoryData.action
    };
  }

  /**
   * 重量取扱いスコアを計算
   */
  public calculateWeightScore(weight: number, handType: 'both_hands' | 'single_hand', workType: 'light_work' | 'moderate_work' | 'heavy_work', frequency: 'continuous' | 'frequent' | 'occasional' | 'rare', posture: 'optimal' | 'good' | 'fair' | 'poor'): number {
    const weightStandards = (this.standards.physical_factors as { weight_limits: { lifting_limits: Record<string, Record<string, number>>; frequency_factors: Record<string, number>; posture_factors: Record<string, number> } }).weight_limits;
    const limits = weightStandards.lifting_limits[handType] || {};
    const frequencyFactor = weightStandards.frequency_factors[frequency] || 1;
    const postureFactor = weightStandards.posture_factors[posture] || 1;
    
    // 調整後の制限重量を計算
    const adjustedLimit = (limits[workType] || 25) * frequencyFactor * postureFactor;
    
    // スコア計算
    if (weight >= adjustedLimit * 1.5) return 7;
    if (weight >= adjustedLimit * 1.2) return 4;
    if (weight >= adjustedLimit) return 2;
    return 1;
  }

  /**
   * 精神因の仕事の質スコアを計算
   */
  public calculateWorkQualityScore(failureLevel: 'very_low' | 'low' | 'medium' | 'high', lossLevel: 'minimal' | 'moderate' | 'significant' | 'critical'): number {
    const workQualityStandards = (this.standards.mental_factors as { work_quality_assessment: { failure_assessment: { failure_frequency_levels: Record<string, { score: number }>; loss_impact_levels: Record<string, { score: number }> } } }).work_quality_assessment.failure_assessment;

    const failureScore = workQualityStandards.failure_frequency_levels[failureLevel]?.score ?? 1;
    const lossScore = workQualityStandards.loss_impact_levels[lossLevel]?.score ?? 1;

    // 失敗頻度と損失影響度の積で最終スコアを計算
    return Math.min(failureScore * lossScore, 10);
  }

  /**
   * 精神因の集中度スコアを計算
   */
  public calculateConcentrationScore(concentrationLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'): number {
    const concentrationStandards = (this.standards.mental_factors as { work_quality_assessment: { concentration_levels: Record<string, { score: number }> } }).work_quality_assessment.concentration_levels;
    return concentrationStandards[concentrationLevel]?.score || 1;
  }

  /**
   * 危険因のリスクスコアを計算
   */
  public calculateRiskScore(encounterFrequency: number, dangerPossibility: number, occurrencePossibility: number, harmSeverity: number): number {
    // リスクポイントの計算（最大値を使用）
    const riskPoint = Math.max(encounterFrequency, dangerPossibility, occurrencePossibility, harmSeverity);

    const _riskStandards = this.standards.hazard_factors.risk_assessment;

    if (riskPoint >= 4) return 7;
    if (riskPoint >= 3) return 4;
    if (riskPoint >= 2) return 2;
    return 1;
  }

  /**
   * 作業時間スコアファクターを取得
   */
  public getWorkTimeScoreFactor(hours: number): { category: string; factor: number } {
    const timeStandards = (this.standards.work_time_factors as { time_classification: { time_categories: Record<string, { score_factor: number }> } }).time_classification.time_categories;

    if (hours >= 8) return { category: 'd', factor: timeStandards.d?.score_factor ?? 1.0 };
    if (hours >= 4) return { category: 'c', factor: timeStandards.c?.score_factor ?? 0.75 };
    if (hours >= 1) return { category: 'b', factor: timeStandards.b?.score_factor ?? 0.5 };
    return { category: 'a', factor: timeStandards.a?.score_factor ?? 0.25 };
  }

  /**
   * 全基準値を取得（デバッグ・管理用）
   */
  public getAllStandards(): EvaluationStandards {
    return this.standards;
  }

  /**
   * 特定カテゴリの基準値を検索
   */
  public findStandardsByCategory(category: string): Record<string, unknown> {
    return getStandardByCategory(category as unknown as keyof EvalStandards) as unknown as Record<string, unknown>;
  }
}

// シングルトンインスタンスをエクスポート
export const standardsService = EvaluationStandardsService.getInstance();