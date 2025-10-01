/**
 * マトリックス計算エンジン
 * JSON定義されたマトリックスを使用してスコア計算を実行
 */

import type { 
  EvaluationMatrix, 
  MatrixCell} from '../data/evaluationMatrices';
import { 
  getMatrix, 
  findMatrixById,
  evaluationMatrices 
} from '../data/evaluationMatrices';

export interface MatrixCalculationInput {
  matrixId?: string;
  category?: 'physical' | 'mental' | 'environmental' | 'hazard';
  xValue: string;
  yValue: string;
  additionalParams?: Record<string, unknown>;
}

export interface MatrixCalculationResult {
  score: number;
  cell: MatrixCell;
  matrix: EvaluationMatrix;
  coordinates: {
    x: string;
    y: string;
  };
  metadata: {
    level: 'low' | 'medium' | 'high' | 'critical';
    color: string;
    description?: string;
    recommendations?: string[];
  };
}

export interface PhysicalMatrixInput {
  postureLevel: 1 | 2 | 3; // 1: 良い, 2: 悪い, 3: とても悪い
  durationLevel: 1 | 2 | 3; // 1: <10%, 2: 10-50%, 3: >50%
  strengthLevel: 1 | 2 | 3 | 4 | 5; // 1: 軽い, 2: 少しきつい, 3: きつい, 4: とてもきつい, 5: 限界
}

export interface MentalMatrixInput {
  failureFrequency: 1 | 2 | 3 | 4; // 1: ほとんどない, 2: 稀にある, 3: 時々ある, 4: 頻繁にある
  durationLevel: 1 | 2; // 1: 短時間, 2: 長時間
  impactLevel: 1 | 2 | 3 | 4; // 1: 軽微, 2: 中程度, 3: 重大, 4: 致命的
}

export interface EnvironmentalMatrixInput {
  concentrationLevel: 1 | 2 | 3 | 4 | 5; // 1: 25%未満, 2: 25-50%, 3: 50-75%, 4: 75-100%, 5: 100%超過
  exposureTime: 1 | 2 | 3 | 4; // 1: 短時間, 2: 中時間, 3: 長時間, 4: 超長時間
}

export interface HazardMatrixInput {
  frequency: 1 | 2 | 3 | 4 | 5; // 1: ほぼない, 2: 稀, 3: 時々, 4: 頻繁, 5: 常時
  severity: 1 | 2 | 3 | 4 | 5; // 1: 軽微, 2: 軽度, 3: 中程度, 4: 重度, 5: 致命的
}

export class MatrixCalculator {
  private static instance: MatrixCalculator;

  private constructor() {}

  public static getInstance(): MatrixCalculator {
    if (!MatrixCalculator.instance) {
      MatrixCalculator.instance = new MatrixCalculator();
    }
    return MatrixCalculator.instance;
  }

  /**
   * 汎用マトリックス計算
   */
  public calculateFromMatrix(input: MatrixCalculationInput): MatrixCalculationResult {
    let matrix: EvaluationMatrix | null = null;

    // マトリックスを取得
    if (input.matrixId) {
      matrix = findMatrixById(input.matrixId);
    } else if (input.category) {
      matrix = getMatrix(input.category);
    }

    if (!matrix) {
      throw new Error('Matrix not found');
    }

    // 座標の検証
    const cell = matrix.matrix[input.yValue]?.[input.xValue];
    if (!cell) {
      throw new Error(`Invalid coordinates: y=${input.yValue}, x=${input.xValue}`);
    }

    // カラースキームから詳細情報を取得
    const colorInfo = matrix.colorScheme[cell.value];
    
    const recommendations = this.generateRecommendations(matrix.category, cell.value, input);

    return {
      score: cell.value,
      cell,
      matrix,
      coordinates: {
        x: input.xValue,
        y: input.yValue
      },
      metadata: {
        level: colorInfo?.level || 'low',
        color: cell.color,
        description: cell.description,
        recommendations
      }
    };
  }

  /**
   * 肉体因マトリックス計算
   */
  public calculatePhysicalMatrix(input: PhysicalMatrixInput): MatrixCalculationResult {
    const yValue = `${input.postureLevel}-${input.durationLevel}`;
    const xValue = input.strengthLevel.toString();

    return this.calculateFromMatrix({
      category: 'physical',
      xValue,
      yValue,
      additionalParams: { ...input }
    });
  }

  /**
   * 精神因マトリックス計算
   */
  public calculateMentalMatrix(input: MentalMatrixInput): MatrixCalculationResult {
    const yValue = `${input.failureFrequency}-${input.durationLevel}`;
    const xValue = input.impactLevel.toString();

    return this.calculateFromMatrix({
      category: 'mental',
      xValue,
      yValue,
      additionalParams: { ...input }
    });
  }

  /**
   * 環境因マトリックス計算
   */
  public calculateEnvironmentalMatrix(input: EnvironmentalMatrixInput): MatrixCalculationResult {
    const yValue = input.concentrationLevel.toString();
    const xValue = input.exposureTime.toString();

    return this.calculateFromMatrix({
      category: 'environmental',
      xValue,
      yValue,
      additionalParams: { ...input }
    });
  }

  /**
   * 危険因マトリックス計算
   */
  public calculateHazardMatrix(input: HazardMatrixInput): MatrixCalculationResult {
    const yValue = input.frequency.toString();
    const xValue = input.severity.toString();

    return this.calculateFromMatrix({
      category: 'hazard',
      xValue,
      yValue,
      additionalParams: { ...input }
    });
  }

  /**
   * 複数マトリックス一括計算
   */
  public calculateMultipleMatrices(inputs: {
    physical?: PhysicalMatrixInput;
    mental?: MentalMatrixInput;
    environmental?: EnvironmentalMatrixInput;
    hazard?: HazardMatrixInput;
  }): Record<string, MatrixCalculationResult> {
    const results: Record<string, MatrixCalculationResult> = {};

    if (inputs.physical) {
      results.physical = this.calculatePhysicalMatrix(inputs.physical);
    }
    if (inputs.mental) {
      results.mental = this.calculateMentalMatrix(inputs.mental);
    }
    if (inputs.environmental) {
      results.environmental = this.calculateEnvironmentalMatrix(inputs.environmental);
    }
    if (inputs.hazard) {
      results.hazard = this.calculateHazardMatrix(inputs.hazard);
    }

    return results;
  }

  /**
   * 姿勢評価からマトリックス入力への変換
   */
  public convertPostureToMatrixInput(
    rulaScore: number, 
    owasCategory: number, 
    durationPercentage: number, 
    strengthLevel: 1 | 2 | 3 | 4 | 5
  ): PhysicalMatrixInput {
    // RULA/OWASスコアから姿勢レベルを決定
    let postureLevel: 1 | 2 | 3;
    
    if (rulaScore <= 2 && owasCategory <= 1) {
      postureLevel = 1; // 良い
    } else if (rulaScore <= 4 && owasCategory <= 2) {
      postureLevel = 2; // 悪い
    } else {
      postureLevel = 3; // とても悪い
    }

    // 持続時間レベルを決定
    let durationLevel: 1 | 2 | 3;
    if (durationPercentage < 10) {
      durationLevel = 1; // <10%
    } else if (durationPercentage <= 50) {
      durationLevel = 2; // 10-50%
    } else {
      durationLevel = 3; // >50%
    }

    return {
      postureLevel,
      durationLevel,
      strengthLevel
    };
  }

  /**
   * 化学物質濃度からマトリックス入力への変換
   */
  public convertConcentrationToMatrixInput(
    measuredValue: number,
    permissibleValue: number,
    exposureHours: number
  ): EnvironmentalMatrixInput {
    // 濃度レベルを計算
    const ratio = (measuredValue / permissibleValue) * 100;
    let concentrationLevel: 1 | 2 | 3 | 4 | 5;
    
    if (ratio < 25) concentrationLevel = 1;
    else if (ratio < 50) concentrationLevel = 2;
    else if (ratio < 75) concentrationLevel = 3;
    else if (ratio <= 100) concentrationLevel = 4;
    else concentrationLevel = 5;

    // 曝露時間レベルを決定
    let exposureTime: 1 | 2 | 3 | 4;
    if (exposureHours < 1) exposureTime = 1;
    else if (exposureHours <= 4) exposureTime = 2;
    else if (exposureHours <= 8) exposureTime = 3;
    else exposureTime = 4;

    return {
      concentrationLevel,
      exposureTime
    };
  }

  /**
   * マトリックス妥当性検証
   */
  public validateMatrixInput(
    category: 'physical' | 'mental' | 'environmental' | 'hazard',
    xValue: string,
    yValue: string
  ): { isValid: boolean; errors: string[] } {
    const matrix = getMatrix(category);
    const errors: string[] = [];

    if (!matrix) {
      errors.push(`Matrix for category ${category} not found`);
      return { isValid: false, errors };
    }

    // Y軸の検証
    if (!matrix.matrix[yValue]) {
      const validYValues = Object.keys(matrix.matrix);
      errors.push(`Invalid Y value: ${yValue}. Valid values: ${validYValues.join(', ')}`);
    }

    // X軸の検証
    if (matrix.matrix[yValue] && !matrix.matrix[yValue][xValue]) {
      const validXValues = Object.keys(matrix.matrix[yValue] || {});
      errors.push(`Invalid X value: ${xValue}. Valid values: ${validXValues.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * マトリックス統計情報取得
   */
  public getMatrixStatistics(category: 'physical' | 'mental' | 'environmental' | 'hazard'): {
    totalCells: number;
    scoreDistribution: Record<number, number>;
    averageScore: number;
    maxScore: number;
    minScore: number;
    riskLevelDistribution: Record<string, number>;
  } {
    const matrix = getMatrix(category);
    if (!matrix) {
      throw new Error(`Matrix for category ${category} not found`);
    }

    const scores: number[] = [];
    const scoreDistribution: Record<number, number> = {};
    const riskLevelDistribution: Record<string, number> = {};

    // 全セルを走査
    for (const row of Object.values(matrix.matrix)) {
      for (const cell of Object.values(row)) {
        scores.push(cell.value);
        scoreDistribution[cell.value] = (scoreDistribution[cell.value] || 0) + 1;
        
        const colorInfo = matrix.colorScheme[cell.value];
        if (colorInfo) {
          const level = colorInfo.level;
          riskLevelDistribution[level] = (riskLevelDistribution[level] || 0) + 1;
        }
      }
    }

    return {
      totalCells: scores.length,
      scoreDistribution,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      riskLevelDistribution
    };
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(
    category: 'physical' | 'mental' | 'environmental' | 'hazard',
    score: number,
    input: MatrixCalculationInput
  ): string[] {
    const recommendations: string[] = [];

    switch (category) {
      case 'physical':
        if (score >= 7) {
          recommendations.push('作業姿勢の即時改善が必要');
          recommendations.push('作業補助具の導入を検討');
          recommendations.push('定期的な休憩の実施');
        } else if (score >= 4) {
          recommendations.push('作業姿勢の改善を検討');
          recommendations.push('作業者へのトレーニング実施');
        }
        break;

      case 'mental':
        if (score >= 7) {
          recommendations.push('作業手順の簡素化');
          recommendations.push('チェック体制の強化');
          recommendations.push('作業者の負荷軽減策を検討');
        } else if (score >= 4) {
          recommendations.push('作業手順書の見直し');
          recommendations.push('定期的な習熟度確認');
        }
        break;

      case 'environmental':
        if (score >= 7) {
          recommendations.push('局所排気装置の設置・強化');
          recommendations.push('個人保護具の着用徹底');
          recommendations.push('作業時間の短縮');
        } else if (score >= 4) {
          recommendations.push('環境測定の頻度増加');
          recommendations.push('換気設備の点検');
        }
        break;

      case 'hazard':
        if (score >= 7) {
          recommendations.push('安全設備の追加設置');
          recommendations.push('作業手順の根本的見直し');
          recommendations.push('緊急対応手順の策定');
        } else if (score >= 4) {
          recommendations.push('リスク管理体制の強化');
          recommendations.push('定期的な安全教育');
        }
        break;
    }

    return recommendations;
  }

  /**
   * マトリックス情報のエクスポート
   */
  public exportMatrixData(category: 'physical' | 'mental' | 'environmental' | 'hazard'): string {
    const matrix = getMatrix(category);
    if (!matrix) {
      throw new Error(`Matrix for category ${category} not found`);
    }

    const csvHeader = ['Y軸', 'X軸', 'スコア', 'レベル', '色'].join(',');
    const rows: string[] = [csvHeader];

    for (const [yKey, row] of Object.entries(matrix.matrix)) {
      for (const [xKey, cell] of Object.entries(row)) {
        const yLabel = matrix.yAxis.values.find(v => v.id === yKey)?.label || yKey;
        const xLabel = matrix.xAxis.values.find(v => v.id === xKey)?.label || xKey;
        const colorInfo = matrix.colorScheme[cell.value];
        
        rows.push([
          `"${yLabel}"`,
          `"${xLabel}"`,
          cell.value,
          colorInfo?.level || 'unknown',
          `"${cell.color}"`
        ].join(','));
      }
    }

    return rows.join('\n');
  }
}

// シングルトンインスタンスをエクスポート
export const matrixCalculator = MatrixCalculator.getInstance();