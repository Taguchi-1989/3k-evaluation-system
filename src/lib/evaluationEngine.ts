/**
 * 評価エンジン統合クラス
 * 基準値管理、スコア計算、履歴管理を統合したAPIを提供
 */

import type { EvaluationStandardsService } from './standards';
import { standardsService } from './standards';
import type { ScoreCalculationEngine, FinalScoreResult } from './calculation';
import { calculationEngine } from './calculation';
import type { EvaluationHistoryService } from './history';
import { historyService } from './history';
import type { MatrixCalculator, MatrixCalculationResult, PhysicalMatrixInput, MentalMatrixInput, EnvironmentalMatrixInput, HazardMatrixInput } from './matrixCalculator';
import { matrixCalculator } from './matrixCalculator';
import { getMatrix } from '../data/evaluationMatrices';
import type {
  PhysicalDetails, MentalDetails, EnvironmentalDetails, HazardDetails,
  Posture, EnvironmentalSubstance, WorkTimeFactor,
  PhysicalFactor, MentalFactor, EnvironmentalFactor, HazardFactor
} from '../types/evaluation';

export interface CompleteEvaluationData {
  evaluationId: string;
  workName: string;
  factoryName: string;
  processName: string;
  physicalDetails?: PhysicalDetails;
  mentalDetails?: MentalDetails;
  environmentalDetails?: EnvironmentalDetails;
  hazardDetails?: HazardDetails;
  postures?: Posture[];
  environmentalSubstances?: EnvironmentalSubstance[];
  workTimeFactor?: WorkTimeFactor;
  updatedBy: string;
  additionalParams?: {
    useMatrixCalculation?: boolean;
    [key: string]: unknown;
  };
}

export interface EvaluationResult {
  evaluationId: string;
  scores: {
    physical: number;
    mental: number;
    environmental: number;
    hazard: number;
    workTime: number;
  };
  finalResult: FinalScoreResult;
  calculationDetails: Record<string, unknown>;
  timestamp: Date;
  calculatedBy: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingData: string[];
}

export class EvaluationEngine {
  private static instance: EvaluationEngine;
  private standardsService: EvaluationStandardsService;
  private calculationEngine: ScoreCalculationEngine;
  private historyService: EvaluationHistoryService;
  private matrixCalculator: MatrixCalculator;

  private constructor() {
    this.standardsService = standardsService;
    this.calculationEngine = calculationEngine;
    this.historyService = historyService;
    this.matrixCalculator = matrixCalculator;
  }

  public static getInstance(): EvaluationEngine {
    if (!EvaluationEngine.instance) {
      EvaluationEngine.instance = new EvaluationEngine();
    }
    return EvaluationEngine.instance;
  }

  /**
   * 完全評価の実行（すべての因子を計算）
   */
  public async performCompleteEvaluation(data: CompleteEvaluationData): Promise<EvaluationResult> {
    // データ検証
    const validation = this.validateEvaluationData(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // 作業時間ファクターを取得
    let workTimeFactor = 1.0;
    if (data.workTimeFactor) {
      const timeFactorResult = this.standardsService.getWorkTimeScoreFactor(data.workTimeFactor.workHours);
      workTimeFactor = timeFactorResult.factor;
    }

    // 各因子スコアを計算（マトリックス対応）
    const useMatrixCalculation = data.additionalParams?.useMatrixCalculation ?? true;
    
    const physicalResult = data.physicalDetails 
      ? this.calculationEngine.calculatePhysicalScore(
          data.physicalDetails, 
          data.postures, 
          workTimeFactor,
          useMatrixCalculation
        )
      : { score: 1, details: {}, factors: {} };

    const mentalResult = data.mentalDetails
      ? this.calculationEngine.calculateMentalScore(
          data.mentalDetails, 
          workTimeFactor,
          useMatrixCalculation
        )
      : { score: 1, details: {}, factors: {} };

    const environmentalResult = data.environmentalDetails
      ? this.calculationEngine.calculateEnvironmentalScore(
          data.environmentalDetails,
          data.environmentalSubstances,
          useMatrixCalculation
        )
      : { score: 1, details: {}, factors: {} };

    const hazardResult = data.hazardDetails
      ? this.calculationEngine.calculateHazardScore(data.hazardDetails, useMatrixCalculation)
      : { score: 1, details: {}, factors: {} };

    // 最終3K指数を計算
    const finalResult = this.calculationEngine.calculateFinal3KIndex(
      physicalResult.score,
      mentalResult.score,
      environmentalResult.score,
      hazardResult.score,
      workTimeFactor
    );

    const result: EvaluationResult = {
      evaluationId: data.evaluationId,
      scores: {
        physical: physicalResult.score,
        mental: mentalResult.score,
        environmental: environmentalResult.score,
        hazard: hazardResult.score,
        workTime: workTimeFactor
      },
      finalResult,
      calculationDetails: {
        physical: physicalResult.details,
        mental: mentalResult.details,
        environmental: environmentalResult.details,
        hazard: hazardResult.details,
        workTimeCategory: data.workTimeFactor ? this.standardsService.getWorkTimeScoreFactor(data.workTimeFactor.workHours) : null
      },
      timestamp: new Date(),
      calculatedBy: data.updatedBy
    };

    return result;
  }

  /**
   * 個別因子スコア計算
   */
  public async calculateIndividualFactor(
    factorType: 'physical' | 'mental' | 'environmental' | 'hazard',
    data: PhysicalDetails | MentalDetails | EnvironmentalDetails | HazardDetails,
    additionalData?: {
      postures?: Posture[];
      substances?: EnvironmentalSubstance[];
      workTimeFactor?: number;
    }
  ): Promise<{ score: number; details: Record<string, unknown> }> {
    const workTimeFactor = additionalData?.workTimeFactor || 1.0;

    switch (factorType) {
      case 'physical':
        return this.calculationEngine.calculatePhysicalScore(
          data as PhysicalDetails,
          additionalData?.postures,
          workTimeFactor,
          true // マトリックス計算を使用
        );
      case 'mental':
        return this.calculationEngine.calculateMentalScore(
          data as MentalDetails,
          workTimeFactor,
          true // マトリックス計算を使用
        );
      case 'environmental':
        return this.calculationEngine.calculateEnvironmentalScore(
          data as EnvironmentalDetails,
          additionalData?.substances,
          true // マトリックス計算を使用
        );
      case 'hazard':
        return this.calculationEngine.calculateHazardScore(
          data as HazardDetails,
          true // マトリックス計算を使用
        );
      default:
        throw new Error(`Unknown factor type: ${factorType}`);
    }
  }

  /**
   * 評価データの検証
   */
  public validateEvaluationData(data: CompleteEvaluationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    // 基本情報の検証
    if (!data.evaluationId) errors.push('評価IDが必要です');
    if (!data.workName) errors.push('作業名が必要です');
    if (!data.factoryName) errors.push('工場名が必要です');
    if (!data.processName) errors.push('工程名が必要です');
    if (!data.updatedBy) errors.push('更新者IDが必要です');

    // 因子データの存在確認
    if (!data.physicalDetails) missingData.push('肉体因データ');
    if (!data.mentalDetails) missingData.push('精神因データ');
    if (!data.environmentalDetails) missingData.push('環境因データ');
    if (!data.hazardDetails) missingData.push('危険因データ');

    // 肉体因の詳細検証
    if (data.physicalDetails) {
      if (data.physicalDetails.checkboxes?.weightBoth && !data.physicalDetails.targetWeight?.bothHands) {
        warnings.push('両手重量がチェックされていますが、重量値が入力されていません');
      }
      if (data.physicalDetails.checkboxes?.weightSingle && !data.physicalDetails.targetWeight?.singleHand) {
        warnings.push('片手重量がチェックされていますが、重量値が入力されていません');
      }
    }

    // 環境因の詳細検証
    if (data.environmentalDetails && data.environmentalSubstances) {
      for (const substance of data.environmentalSubstances) {
        if (!substance.substanceName) {
          errors.push(`環境物質名が未入力です: ID ${substance.id}`);
        }
        if (substance.measuredValue < 0) {
          errors.push(`測定値が負の数です: ${substance.substanceName}`);
        }
        if (!substance.measurementUnit) {
          warnings.push(`測定単位が未設定です: ${substance.substanceName}`);
        }
      }
    }

    // 危険因の詳細検証
    if (data.hazardDetails?.hazardEvents) {
      for (const event of data.hazardDetails.hazardEvents) {
        if (!event.hazardEvent) {
          errors.push(`危険事象が未入力です: ID ${event.id}`);
        }
        if (event.encounterFrequency < 1 || event.encounterFrequency > 5) {
          errors.push(`遭遇頻度は1-5の範囲で入力してください: ${event.hazardEvent}`);
        }
        if (event.dangerPossibility < 1 || event.dangerPossibility > 5) {
          errors.push(`危険可能性は1-5の範囲で入力してください: ${event.hazardEvent}`);
        }
      }
    }

    // 姿勢データの検証
    if (data.postures) {
      for (const posture of data.postures) {
        if (!posture.postureName) {
          warnings.push(`姿勢名が未入力です: ID ${posture.id}`);
        }
        if (posture.rulaScore < 1 || posture.rulaScore > 7) {
          errors.push(`RULAスコアは1-7の範囲で入力してください: ${posture.postureName}`);
        }
        if (posture.owasCategory < 1 || posture.owasCategory > 4) {
          errors.push(`OWASカテゴリは1-4の範囲で入力してください: ${posture.postureName}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * 評価結果の保存と履歴管理
   */
  public async saveEvaluationWithHistory(
    evaluationResult: EvaluationResult,
    previousData?: {
      physical?: PhysicalFactor;
      mental?: MentalFactor;
      environmental?: EnvironmentalFactor;
      hazard?: HazardFactor;
    }
  ): Promise<void> {
    const _timestamp = new Date();

    // 各因子の履歴を保存
    if (previousData?.physical) {
      await this.historyService.saveHistory(
        'physical_factors',
        previousData.physical.id,
        previousData.physical.details,
        previousData.physical.score,
        evaluationResult.calculationDetails.physical,
        evaluationResult.scores.physical,
        evaluationResult.calculatedBy
      );
    }

    if (previousData?.mental) {
      await this.historyService.saveHistory(
        'mental_factors',
        previousData.mental.id,
        previousData.mental.details,
        previousData.mental.score,
        evaluationResult.calculationDetails.mental,
        evaluationResult.scores.mental,
        evaluationResult.calculatedBy
      );
    }

    if (previousData?.environmental) {
      await this.historyService.saveHistory(
        'environmental_factors',
        previousData.environmental.id,
        previousData.environmental.details,
        previousData.environmental.score,
        evaluationResult.calculationDetails.environmental,
        evaluationResult.scores.environmental,
        evaluationResult.calculatedBy
      );
    }

    if (previousData?.hazard) {
      await this.historyService.saveHistory(
        'hazard_factors',
        previousData.hazard.id,
        previousData.hazard.details,
        previousData.hazard.score,
        evaluationResult.calculationDetails.hazard,
        evaluationResult.scores.hazard,
        evaluationResult.calculatedBy
      );
    }
  }

  /**
   * 基準値の動的更新
   */
  public async updateStandards(): Promise<void> {
    this.standardsService.reloadStandards();
  }

  /**
   * 評価レポートの生成
   */
  public generateEvaluationReport(result: EvaluationResult): {
    summary: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    priorityActions: string[];
  } {
    const { finalResult } = result;
    const { final3KIndex, finalKitsusaScore } = finalResult;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let summary: string;
    const recommendations: string[] = [];
    let priorityActions: string[] = [];

    // リスクレベルの判定
    switch (final3KIndex) {
      case 'A':
        riskLevel = 'critical';
        summary = `この作業は最高リスクレベル（3K指数A：${finalKitsusaScore}点）に分類されます。即座の改善が必要です。`;
        priorityActions = [
          '作業の即時停止または制限を検討',
          '代替作業方法の実装',
          '追加の安全対策の導入'
        ];
        break;
      case 'B':
        riskLevel = 'high';
        summary = `この作業は高リスクレベル（3K指数B：${finalKitsusaScore}点）に分類されます。早急な改善が推奨されます。`;
        priorityActions = [
          '作業プロセスの見直し',
          '作業者への追加トレーニング',
          '定期的なリスク評価の実施'
        ];
        break;
      case 'C':
        riskLevel = 'medium';
        summary = `この作業は中程度のリスクレベル（3K指数C：${finalKitsusaScore}点）に分類されます。継続的な監視が必要です。`;
        break;
      default:
        riskLevel = 'low';
        summary = `この作業は低リスクレベル（3K指数D：${finalKitsusaScore}点）に分類されます。現状維持で問題ありません。`;
    }

    // 因子別推奨事項
    if (result.scores.physical >= 4) {
      recommendations.push('肉体因: 作業姿勢の改善、重量物取扱いの見直し、休憩時間の増加を検討');
    }
    if (result.scores.mental >= 4) {
      recommendations.push('精神因: 作業の複雑度軽減、チェック体制の強化、ストレス要因の除去を検討');
    }
    if (result.scores.environmental >= 4) {
      recommendations.push('環境因: 作業環境の改善、防護設備の充実、環境測定の強化を検討');
    }
    if (result.scores.hazard >= 4) {
      recommendations.push('危険因: リスク管理体制の強化、安全設備の追加、緊急対応手順の見直しを検討');
    }

    return {
      summary,
      recommendations,
      riskLevel,
      priorityActions
    };
  }

  /**
   * 統計情報の取得
   */
  public async getEvaluationStatistics(evaluationId: string): Promise<{
    historyStats: Record<string, unknown>;
    currentStatus: {
      lastCalculated: Date;
      totalCalculations: number;
      averageScore: number;
      trend: 'improving' | 'stable' | 'declining';
    };
    matrixStatistics?: {
      physicalMatrix?: Record<string, unknown>;
      mentalMatrix?: Record<string, unknown>;
      environmentalMatrix?: Record<string, unknown>;
      hazardMatrix?: Record<string, unknown>;
    };
  }> {
    const historyStats = await this.historyService.getHistoryStatistics(evaluationId);
    
    // ここでは簡単な実装。実際にはデータベースから統計を取得
    const currentStatus = {
      lastCalculated: new Date(),
      totalCalculations: historyStats.totalChanges,
      averageScore: 0, // 実際の計算が必要
      trend: 'stable' as const
    };

    // マトリックス統計情報を取得
    const matrixStatistics = {
      physicalMatrix: this.matrixCalculator.getMatrixStatistics('physical'),
      mentalMatrix: this.matrixCalculator.getMatrixStatistics('mental'),
      environmentalMatrix: this.matrixCalculator.getMatrixStatistics('environmental'),
      hazardMatrix: this.matrixCalculator.getMatrixStatistics('hazard')
    };

    return {
      historyStats,
      currentStatus,
      matrixStatistics
    };
  }

  /**
   * マトリックス情報の取得
   */
  public getMatrixInformation(category: 'physical' | 'mental' | 'environmental' | 'hazard'): {
    matrix: ReturnType<typeof getMatrix>;
    statistics: ReturnType<MatrixCalculator['getMatrixStatistics']>;
  } {
    const matrix = getMatrix(category);
    if (!matrix) {
      throw new Error(`Matrix for category ${category} not found`);
    }
    
    return {
      matrix,
      statistics: this.matrixCalculator.getMatrixStatistics(category)
    };
  }

  /**
   * マトリックス計算の実行
   */
  public calculateMatrixScore(
    category: 'physical' | 'mental' | 'environmental' | 'hazard',
    inputs: Record<string, unknown>
  ): MatrixCalculationResult {
    switch (category) {
      case 'physical':
        return this.matrixCalculator.calculatePhysicalMatrix(inputs as unknown as PhysicalMatrixInput);
      case 'mental':
        return this.matrixCalculator.calculateMentalMatrix(inputs as unknown as MentalMatrixInput);
      case 'environmental':
        return this.matrixCalculator.calculateEnvironmentalMatrix(inputs as unknown as EnvironmentalMatrixInput);
      case 'hazard':
        return this.matrixCalculator.calculateHazardMatrix(inputs as unknown as HazardMatrixInput);
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }

  /**
   * マトリックスデータのエクスポート
   */
  public exportMatrixData(category: 'physical' | 'mental' | 'environmental' | 'hazard'): string {
    return this.matrixCalculator.exportMatrixData(category);
  }
}

// シングルトンインスタンスをエクスポート
export const evaluationEngine = EvaluationEngine.getInstance();

// 便利な関数をエクスポート
export const performQuickEvaluation = async (data: CompleteEvaluationData): Promise<EvaluationResult> => {
  return await evaluationEngine.performCompleteEvaluation(data);
};

export const validateEvaluation = (data: CompleteEvaluationData): ValidationResult => {
  return evaluationEngine.validateEvaluationData(data);
};

// マトリックス関連の便利な関数
export const calculateMatrixScore = (category: 'physical' | 'mental' | 'environmental' | 'hazard', inputs: Record<string, unknown>): MatrixCalculationResult => {
  return evaluationEngine.calculateMatrixScore(category, inputs);
};

export const getMatrixInfo = (category: 'physical' | 'mental' | 'environmental' | 'hazard'): ReturnType<typeof evaluationEngine.getMatrixInformation> => {
  return evaluationEngine.getMatrixInformation(category);
};

export const exportMatrix = (category: 'physical' | 'mental' | 'environmental' | 'hazard'): string => {
  return evaluationEngine.exportMatrixData(category);
};