/**
 * スコア計算エンジン
 * 3K指数評価アプリの各因子スコア計算と最終3K指数算出を担当
 */

import { standardsService, EvaluationStandardsService } from './standards';
import { 
  matrixCalculator, 
  MatrixCalculator, 
  PhysicalMatrixInput,
  MentalMatrixInput,
  EnvironmentalMatrixInput,
  HazardMatrixInput 
} from './matrixCalculator';
import { 
  PhysicalDetails, MentalDetails, EnvironmentalDetails, HazardDetails, 
  Posture, HazardEvent, EnvironmentalSubstance, WorkTimeFactor 
} from '../types/evaluation';

export interface ScoreCalculationResult {
  score: number;
  details: Record<string, any>;
  factors?: Record<string, number>;
}

export interface FinalScoreResult {
  physicalScore: number;
  mentalScore: number;
  environmentalScore: number;
  hazardScore: number;
  workTimeScore: number;
  final3KIndex: string;
  finalKitsusaScore: number;
  calculationDetails: Record<string, any>;
}

export class ScoreCalculationEngine {
  private static instance: ScoreCalculationEngine;
  private standardsService: EvaluationStandardsService;
  private matrixCalculator: MatrixCalculator;

  private constructor() {
    this.standardsService = standardsService;
    this.matrixCalculator = matrixCalculator;
  }

  public static getInstance(): ScoreCalculationEngine {
    if (!ScoreCalculationEngine.instance) {
      ScoreCalculationEngine.instance = new ScoreCalculationEngine();
    }
    return ScoreCalculationEngine.instance;
  }

  /**
   * 肉体因スコアを計算（マトリックス対応版）
   */
  public calculatePhysicalScore(
    details: PhysicalDetails, 
    postures: Posture[] = [],
    workTimeFactor: number = 1.0,
    useMatrixCalculation: boolean = true
  ): ScoreCalculationResult {
    let totalScore = 1;
    const factors: Record<string, number> = {};
    const calculationDetails: Record<string, any> = {};

    // 重量取扱いスコア計算
    if (details.targetWeight) {
      let weightScore = 1;
      
      if (details.targetWeight.bothHands && details.checkboxes?.weightBoth) {
        const bothHandsScore = this.standardsService.calculateWeightScore(
          details.targetWeight.bothHands.kg,
          'both_hands',
          'moderate_work', // デフォルト値
          'occasional',    // デフォルト値
          'good'          // デフォルト値
        );
        weightScore = Math.max(weightScore, bothHandsScore);
      }

      if (details.targetWeight.singleHand && details.checkboxes?.weightSingle) {
        const singleHandScore = this.standardsService.calculateWeightScore(
          details.targetWeight.singleHand.kg,
          'single_hand',
          'moderate_work',
          'occasional',
          'good'
        );
        weightScore = Math.max(weightScore, singleHandScore);
      }

      factors.weight = weightScore;
      calculationDetails.weightCalculation = {
        bothHands: details.targetWeight.bothHands,
        singleHand: details.targetWeight.singleHand,
        score: weightScore
      };
    }

    // 筋力スコア計算
    if (details.muscleForce && details.checkboxes?.muscle) {
      const muscleScore = this.calculateMuscleForceScore(details.muscleForce.kg);
      factors.muscle = muscleScore;
      calculationDetails.muscleCalculation = {
        force: details.muscleForce.kg,
        score: muscleScore
      };
    }

    // 保護具スコア計算
    if (details.protectiveGear && details.checkboxes?.gear) {
      const gearScore = this.calculateProtectiveGearScore(details.protectiveGear.percentage);
      factors.gear = gearScore;
      calculationDetails.gearCalculation = {
        percentage: details.protectiveGear.percentage,
        score: gearScore
      };
    }

    // 目の疲労スコア計算
    if (details.eyeStrain && details.checkboxes?.eye) {
      const eyeScore = this.calculateEyeStrainScore(details.eyeStrain.percentage);
      factors.eye = eyeScore;
      calculationDetails.eyeCalculation = {
        percentage: details.eyeStrain.percentage,
        score: eyeScore
      };
    }

    // 姿勢評価スコア計算（マトリックス対応）
    if (postures.length > 0) {
      const postureScores = postures.map(posture => {
        let postureScore: number;
        let calculationMethod: string;
        
        if (useMatrixCalculation && details.manualInput) {
          // マトリックス計算を使用
          try {
            const strengthLevel = this.parseStrengthLevel(details.manualInput.strength);
            const durationPercentage = this.parseDurationPercentage(details.manualInput.duration);
            
            const matrixInput = this.matrixCalculator.convertPostureToMatrixInput(
              posture.rulaScore,
              posture.owasCategory,
              durationPercentage,
              strengthLevel
            );
            
            const matrixResult = this.matrixCalculator.calculatePhysicalMatrix(matrixInput);
            postureScore = matrixResult.score;
            calculationMethod = 'matrix';
            
          } catch (error) {
            // マトリックス計算に失敗した場合は従来の方法にフォールバック
            const rulaEval = this.standardsService.getRulaEvaluation(posture.rulaScore);
            const owasEval = this.standardsService.getOwasEvaluation(posture.owasCategory);
            postureScore = Math.max(rulaEval.score, owasEval.score);
            calculationMethod = 'traditional';
          }
        } else {
          // 従来の計算方法
          const rulaEval = this.standardsService.getRulaEvaluation(posture.rulaScore);
          const owasEval = this.standardsService.getOwasEvaluation(posture.owasCategory);
          postureScore = Math.max(rulaEval.score, owasEval.score);
          calculationMethod = 'traditional';
        }
        
        return {
          postureName: posture.postureName,
          rulaScore: posture.rulaScore,
          owasCategory: posture.owasCategory,
          finalScore: postureScore,
          calculationMethod
        };
      });

      const maxPostureScore = Math.max(...postureScores.map(p => p.finalScore));
      factors.posture = maxPostureScore;
      calculationDetails.postureCalculation = {
        postures: postureScores,
        maxScore: maxPostureScore,
        matrixUsed: useMatrixCalculation
      };
    }

    // 手動入力による強度・持続時間の考慮
    if (details.manualInput) {
      const manualScore = this.calculateManualInputScore(
        details.manualInput.strength,
        details.manualInput.duration
      );
      factors.manualInput = manualScore;
      calculationDetails.manualInputCalculation = {
        strength: details.manualInput.strength,
        duration: details.manualInput.duration,
        score: manualScore
      };
    }

    // 最大値を基本スコアとして採用
    const factorScores = Object.values(factors);
    const baseScore = factorScores.length > 0 ? Math.max(...factorScores) : 1;

    // 作業時間ファクターを適用
    totalScore = Math.ceil(baseScore * workTimeFactor);
    totalScore = Math.min(totalScore, 10); // 最大値は10

    return {
      score: totalScore,
      details: calculationDetails,
      factors
    };
  }

  /**
   * 精神因スコアを計算（マトリックス対応版）
   */
  public calculateMentalScore(
    details: MentalDetails, 
    workTimeFactor: number = 1.0,
    useMatrixCalculation: boolean = true
  ): ScoreCalculationResult {
    let totalScore = 1;
    const factors: Record<string, number> = {};
    const calculationDetails: Record<string, any> = {};

    if (details.workQuality) {
      const workQuality = details.workQuality;

      // 失敗リスクスコア（マトリックス対応）
      if (workQuality.failure) {
        let failureScore: number;
        let calculationMethod: string;
        
        if (useMatrixCalculation) {
          try {
            const failureFrequency = this.parseFailureLevel(workQuality.failure.level);
            const durationLevel = this.parseMentalDurationLevel(workQuality.failure.duration);
            const impactLevel = this.parseImpactLevel('中程度'); // デフォルト値、実際は詳細データから取得
            
            const matrixInput: MentalMatrixInput = {
              failureFrequency,
              durationLevel,
              impactLevel
            };
            
            const matrixResult = this.matrixCalculator.calculateMentalMatrix(matrixInput);
            failureScore = matrixResult.score;
            calculationMethod = 'matrix';
          } catch (error) {
            failureScore = this.calculateFailureScore(
              workQuality.failure.level,
              workQuality.failure.duration
            );
            calculationMethod = 'traditional';
          }
        } else {
          failureScore = this.calculateFailureScore(
            workQuality.failure.level,
            workQuality.failure.duration
          );
          calculationMethod = 'traditional';
        }
        
        factors.failure = failureScore;
        calculationDetails.failureCalculation = {
          level: workQuality.failure.level,
          duration: workQuality.failure.duration,
          score: failureScore,
          calculationMethod
        };
      }

      // 集中力スコア
      if (workQuality.concentration) {
        const concentrationScore = this.calculateConcentrationScore(
          workQuality.concentration.level,
          workQuality.concentration.duration
        );
        factors.concentration = concentrationScore;
        calculationDetails.concentrationCalculation = {
          level: workQuality.concentration.level,
          duration: workQuality.concentration.duration,
          score: concentrationScore
        };
      }

      // 認知負荷スコア
      if (workQuality.cognitiveLoad) {
        const cognitiveScore = this.calculateCognitiveLoadScore(
          workQuality.cognitiveLoad.level,
          workQuality.cognitiveLoad.duration
        );
        factors.cognitive = cognitiveScore;
        calculationDetails.cognitiveCalculation = {
          level: workQuality.cognitiveLoad.level,
          duration: workQuality.cognitiveLoad.duration,
          score: cognitiveScore
        };
      }

      // 感情負担スコア
      if (workQuality.emotionalBurden) {
        const emotionalScore = this.calculateEmotionalBurdenScore(
          workQuality.emotionalBurden.level,
          workQuality.emotionalBurden.duration
        );
        factors.emotional = emotionalScore;
        calculationDetails.emotionalCalculation = {
          level: workQuality.emotionalBurden.level,
          duration: workQuality.emotionalBurden.duration,
          score: emotionalScore
        };
      }

      // 技能活用度スコア
      if (workQuality.skillUtilization) {
        const skillScore = this.calculateSkillUtilizationScore(
          workQuality.skillUtilization.level,
          workQuality.skillUtilization.duration
        );
        factors.skill = skillScore;
        calculationDetails.skillCalculation = {
          level: workQuality.skillUtilization.level,
          duration: workQuality.skillUtilization.duration,
          score: skillScore
        };
      }

      // 作業統制度スコア
      if (workQuality.workControl) {
        const controlScore = this.calculateWorkControlScore(
          workQuality.workControl.level,
          workQuality.workControl.duration
        );
        factors.control = controlScore;
        calculationDetails.controlCalculation = {
          level: workQuality.workControl.level,
          duration: workQuality.workControl.duration,
          score: controlScore
        };
      }
    }

    // 手動入力スコア
    if (details.manualInput) {
      const manualScore = this.calculateManualInputScore(
        details.manualInput.strength,
        details.manualInput.duration
      );
      factors.manualInput = manualScore;
      calculationDetails.manualInputCalculation = {
        strength: details.manualInput.strength,
        duration: details.manualInput.duration,
        score: manualScore
      };
    }

    // 最大値を基本スコアとして採用
    const factorScores = Object.values(factors);
    const baseScore = factorScores.length > 0 ? Math.max(...factorScores) : 1;

    // 作業時間ファクターを適用
    totalScore = Math.ceil(baseScore * workTimeFactor);
    totalScore = Math.min(totalScore, 10);

    return {
      score: totalScore,
      details: calculationDetails,
      factors
    };
  }

  /**
   * 環境因スコアを計算（マトリックス対応版）
   */
  public calculateEnvironmentalScore(
    details: EnvironmentalDetails,
    substances: EnvironmentalSubstance[] = [],
    useMatrixCalculation: boolean = true
  ): ScoreCalculationResult {
    let totalScore = 1;
    const factors: Record<string, number> = {};
    const calculationDetails: Record<string, any> = {};

    // 化学物質スコア計算（マトリックス対応）
    if (substances.length > 0) {
      const substanceScores = substances.map(substance => {
        let score: number;
        let calculationMethod: string;
        
        if (useMatrixCalculation) {
          try {
            const matrixInput = this.matrixCalculator.convertConcentrationToMatrixInput(
              substance.measuredValue,
              substance.permissibleConcentration,
              8 // デフォルト8時間、実際は詳細データから取得
            );
            
            const matrixResult = this.matrixCalculator.calculateEnvironmentalMatrix(matrixInput);
            score = matrixResult.score;
            calculationMethod = 'matrix';
          } catch (error) {
            score = this.standardsService.calculateChemicalScore(
              substance.substanceName,
              substance.measuredValue
            );
            calculationMethod = 'traditional';
          }
        } else {
          score = this.standardsService.calculateChemicalScore(
            substance.substanceName,
            substance.measuredValue
          );
          calculationMethod = 'traditional';
        }
        
        return {
          substanceName: substance.substanceName,
          measuredValue: substance.measuredValue,
          thresholdValue: substance.thresholdValue,
          score: score,
          calculationMethod
        };
      });

      const maxSubstanceScore = Math.max(...substanceScores.map(s => s.score));
      factors.substances = maxSubstanceScore;
      calculationDetails.substancesCalculation = {
        substances: substanceScores,
        maxScore: maxSubstanceScore,
        matrixUsed: useMatrixCalculation
      };
    }

    // 温度スコア計算
    if (details.temperature !== undefined) {
      const tempScore = this.calculateTemperatureScore(details.temperature);
      factors.temperature = tempScore;
      calculationDetails.temperatureCalculation = {
        temperature: details.temperature,
        score: tempScore
      };
    }

    // 騒音スコア計算
    if (details.noise !== undefined) {
      const noiseScore = this.standardsService.calculateNoiseScore(details.noise, 'continuous');
      factors.noise = noiseScore;
      calculationDetails.noiseCalculation = {
        noise: details.noise,
        score: noiseScore
      };
    }

    // 粉じんスコア計算
    if (details.dust !== undefined) {
      const dustScore = this.standardsService.calculateDustScore(details.dust);
      factors.dust = dustScore;
      calculationDetails.dustCalculation = {
        dust: details.dust,
        score: dustScore
      };
    }

    // 振動スコア計算
    if (details.vibration !== undefined) {
      const vibrationScore = this.standardsService.calculateVibrationScore(details.vibration, 'whole_body');
      factors.vibration = vibrationScore;
      calculationDetails.vibrationCalculation = {
        vibration: details.vibration,
        score: vibrationScore
      };
    }

    // 汚染レベルスコア計算
    if (details.contamination !== undefined) {
      const contaminationScore = this.standardsService.getContaminationScore(details.contamination);
      factors.contamination = contaminationScore;
      calculationDetails.contaminationCalculation = {
        level: details.contamination,
        score: contaminationScore
      };
    }

    // 最大値を採用
    const factorScores = Object.values(factors);
    totalScore = factorScores.length > 0 ? Math.max(...factorScores) : 1;

    return {
      score: totalScore,
      details: calculationDetails,
      factors
    };
  }

  /**
   * 危険因スコアを計算（マトリックス対応版）
   */
  public calculateHazardScore(details: HazardDetails, useMatrixCalculation: boolean = true): ScoreCalculationResult {
    let totalScore = 1;
    const factors: Record<string, number> = {};
    const calculationDetails: Record<string, any> = {};

    if (details.hazardEvents && details.hazardEvents.length > 0) {
      const hazardScores = details.hazardEvents.map(event => {
        let riskScore: number;
        let calculationMethod: string;
        
        if (useMatrixCalculation) {
          try {
            const matrixInput: HazardMatrixInput = {
              frequency: event.occurrencePossibility as 1 | 2 | 3 | 4 | 5,
              severity: event.harmSeverity as 1 | 2 | 3 | 4 | 5
            };
            
            const matrixResult = this.matrixCalculator.calculateHazardMatrix(matrixInput);
            riskScore = matrixResult.score;
            calculationMethod = 'matrix';
          } catch (error) {
            riskScore = this.standardsService.calculateRiskScore(
              event.encounterFrequency,
              event.dangerPossibility,
              event.occurrencePossibility,
              event.harmSeverity
            );
            calculationMethod = 'traditional';
          }
        } else {
          riskScore = this.standardsService.calculateRiskScore(
            event.encounterFrequency,
            event.dangerPossibility,
            event.occurrencePossibility,
            event.harmSeverity
          );
          calculationMethod = 'traditional';
        }

        return {
          hazardEvent: event.hazardEvent,
          encounterFrequency: event.encounterFrequency,
          dangerPossibility: event.dangerPossibility,
          occurrencePossibility: event.occurrencePossibility,
          harmSeverity: event.harmSeverity,
          riskScore: riskScore,
          calculationMethod
        };
      });

      const maxHazardScore = Math.max(...hazardScores.map(h => h.riskScore));
      factors.hazard = maxHazardScore;
      totalScore = maxHazardScore;

      calculationDetails.hazardCalculation = {
        events: hazardScores,
        maxScore: maxHazardScore,
        matrixUsed: useMatrixCalculation
      };
    }

    return {
      score: totalScore,
      details: calculationDetails,
      factors
    };
  }

  /**
   * 最終3K指数を計算
   */
  public calculateFinal3KIndex(
    physicalScore: number,
    mentalScore: number,
    environmentalScore: number,
    hazardScore: number,
    workTimeFactor: number = 1.0
  ): FinalScoreResult {
    // 各因子スコアに作業時間ファクターを適用
    const adjustedPhysicalScore = Math.min(Math.ceil(physicalScore * workTimeFactor), 10);
    const adjustedMentalScore = Math.min(Math.ceil(mentalScore * workTimeFactor), 10);
    const adjustedEnvironmentalScore = Math.min(Math.ceil(environmentalScore * workTimeFactor), 10);
    const adjustedHazardScore = Math.min(Math.ceil(hazardScore * workTimeFactor), 10);

    // 最終キツさスコア（最大値を採用）
    const finalKitsusaScore = Math.max(
      adjustedPhysicalScore,
      adjustedMentalScore,
      adjustedEnvironmentalScore,
      adjustedHazardScore
    );

    // 3K指数の決定
    let final3KIndex: string;
    if (finalKitsusaScore >= 7) {
      final3KIndex = 'A';
    } else if (finalKitsusaScore >= 4) {
      final3KIndex = 'B';
    } else if (finalKitsusaScore >= 2) {
      final3KIndex = 'C';
    } else {
      final3KIndex = 'D';
    }

    const calculationDetails = {
      originalScores: {
        physical: physicalScore,
        mental: mentalScore,
        environmental: environmentalScore,
        hazard: hazardScore
      },
      workTimeFactor: workTimeFactor,
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
    };

    return {
      physicalScore: adjustedPhysicalScore,
      mentalScore: adjustedMentalScore,
      environmentalScore: adjustedEnvironmentalScore,
      hazardScore: adjustedHazardScore,
      workTimeScore: workTimeFactor,
      final3KIndex,
      finalKitsusaScore,
      calculationDetails
    };
  }

  // プライベートヘルパーメソッド

  private calculateMuscleForceScore(force: number): number {
    if (force >= 50) return 7;
    if (force >= 30) return 4;
    if (force >= 15) return 2;
    return 1;
  }

  private calculateProtectiveGearScore(percentage: number): number {
    if (percentage >= 80) return 7;
    if (percentage >= 50) return 4;
    if (percentage >= 20) return 2;
    return 1;
  }

  private calculateEyeStrainScore(percentage: number): number {
    if (percentage >= 70) return 7;
    if (percentage >= 40) return 4;
    if (percentage >= 15) return 2;
    return 1;
  }

  private calculateManualInputScore(strength: string, duration: string): number {
    const strengthScores: Record<string, number> = {
      '軽い': 1,
      '少しきつい': 2,
      'きつい': 4,
      'とてもきつい': 7,
      '限界': 10
    };

    const durationFactors: Record<string, number> = {
      '<10%': 0.7,
      '10-50%': 1.0,
      '>50%': 1.5
    };

    const baseScore = strengthScores[strength] || 1;
    const factor = durationFactors[duration] || 1.0;

    return Math.min(Math.ceil(baseScore * factor), 10);
  }

  private calculateFailureScore(level: string, duration: string): number {
    const levelScores: Record<string, number> = {
      'ほとんどない': 1,
      '稀にある': 2,
      '時々ある': 4,
      '頻繁にある': 7
    };

    const durationFactors: Record<string, number> = {
      '5%': 0.5,
      '10%': 0.7,
      '15%': 0.8,
      '20%': 0.9,
      '40%': 1.0,
      '60%': 1.2,
      '80%': 1.5
    };

    const baseScore = levelScores[level] || 1;
    const factor = durationFactors[duration] || 1.0;

    return Math.min(Math.ceil(baseScore * factor), 10);
  }

  private calculateConcentrationScore(level: string, duration: string): number {
    return this.calculateMentalFactorScore(level, duration, {
      'ほとんど集中を要しない': 1,
      '軽度の集中を要する': 2,
      '中程度の集中を要する': 4,
      '高度な集中を要する': 7,
      '極めて高度な集中を要する': 10
    });
  }

  private calculateCognitiveLoadScore(level: string, duration: string): number {
    return this.calculateMentalFactorScore(level, duration, {
      'ない': 1,
      'あまりない': 1,
      'どちらとも言えない': 2,
      '比較的ある': 4,
      'ある': 7
    });
  }

  private calculateEmotionalBurdenScore(level: string, duration: string): number {
    return this.calculateMentalFactorScore(level, duration, {
      'ない': 1,
      'あまりない': 1,
      'どちらとも言えない': 2,
      '比較的ある': 4,
      'ある': 7
    });
  }

  private calculateSkillUtilizationScore(level: string, duration: string): number {
    return this.calculateMentalFactorScore(level, duration, {
      '高い': 1,
      'やや高い': 2,
      'どちらとも言えない': 4,
      'やや低い': 7,
      '低い': 10
    });
  }

  private calculateWorkControlScore(level: string, duration: string): number {
    return this.calculateMentalFactorScore(level, duration, {
      '高い': 1,
      'やや高い': 2,
      'どちらとも言えない': 4,
      'やや低い': 7,
      '低い': 10
    });
  }

  private calculateMentalFactorScore(level: string, duration: string, scoreMapping: Record<string, number>): number {
    const durationFactors: Record<string, number> = {
      '5%': 0.5,
      '10%': 0.7,
      '15%': 0.8,
      '20%': 0.9,
      '40%': 1.0,
      '60%': 1.2,
      '80%': 1.5
    };

    const baseScore = scoreMapping[level] || 1;
    const factor = durationFactors[duration] || 1.0;

    return Math.min(Math.ceil(baseScore * factor), 10);
  }

  private calculateTemperatureScore(temperature: number): number {
    // 温度の場合は、熱いか寒いかで判定
    if (temperature >= 35) {
      // WBGT計算の簡易版（実際の実装では詳細な計算が必要）
      return this.standardsService.calculateWBGTScore(temperature, 'moderate_work', 'continuous');
    } else if (temperature <= 5) {
      return this.standardsService.calculateColdScore(temperature);
    }
    return 1;
  }

  // マトリックス計算用のヘルパーメソッド
  private parseStrengthLevel(strength: string): 1 | 2 | 3 | 4 | 5 {
    const strengthMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
      '軽い': 1,
      '少しきつい': 2,
      'きつい': 3,
      'とてもきつい': 4,
      '限界': 5
    };
    return strengthMap[strength] || 3;
  }

  private parseDurationPercentage(duration: string): number {
    if (duration.includes('<10') || duration.includes('10%未満')) return 5;
    if (duration.includes('10-50') || duration.includes('10～50')) return 30;
    if (duration.includes('>50') || duration.includes('50%超')) return 75;
    return 30; // デフォルト
  }

  private parseFailureLevel(level: string): 1 | 2 | 3 | 4 {
    const levelMap: Record<string, 1 | 2 | 3 | 4> = {
      'ほとんどない': 1,
      '稀にある': 2,
      '時々ある': 3,
      '頻繁にある': 4
    };
    return levelMap[level] || 2;
  }

  private parseMentalDurationLevel(duration: string): 1 | 2 {
    // 精神因の持続時間は短時間/長時間の2段階
    if (duration.includes('20') || duration.includes('40') || duration.includes('60') || duration.includes('80')) {
      return 2; // 長時間
    }
    return 1; // 短時間
  }

  private parseImpactLevel(impact: string): 1 | 2 | 3 | 4 {
    const impactMap: Record<string, 1 | 2 | 3 | 4> = {
      '軽微': 1,
      '中程度': 2,
      '重大': 3,
      '致命的': 4
    };
    return impactMap[impact] || 2;
  }
}

// シングルトンインスタンスをエクスポート
export const calculationEngine = ScoreCalculationEngine.getInstance();