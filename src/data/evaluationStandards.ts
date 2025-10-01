// 基準値データを読み込むためのユーティリティ
import evaluationStandardsBase from '@/ref/evaluation_standards_base.json';
import referenceExamples from '@/ref/evaluation_reference_examples.json';
import workCaseExamples from '@/ref/work_case_examples.json';
import type {
  StandardsData,
  ReferenceExamples,
  WorkCaseExamples,
  ChemicalSubstance,
  RulaScoreRange,
  OwasCategory,
  RiskLevel,
  ScoringPattern,
  WorkCase
} from '@/types/evaluation-standards';

// 型アサーション（JSONファイルが型定義に準拠していることを保証）
const standardsData = evaluationStandardsBase as StandardsData;
const referenceData = referenceExamples as ReferenceExamples;
const workCaseData = workCaseExamples as WorkCaseExamples;

// 基準値データを取得
export function getEvaluationStandards(): StandardsData {
  return standardsData;
}

// 参照例データを取得
export function getReferenceExamples(): ReferenceExamples {
  return referenceData;
}

// 作業事例データを取得
export function getWorkCaseExamples(): WorkCaseExamples {
  return workCaseData;
}

// 特定の基準値を取得
export function getStandardByCategory(
  category: keyof StandardsData['evaluation_standards'],
  type?: string
): unknown {
  const standards = getEvaluationStandards();
  const categoryData = standards.evaluation_standards[category];

  if (!categoryData) return null;

  if (type && typeof categoryData === 'object' && categoryData !== null) {
    return (categoryData as Record<string, unknown>)[type] ?? null;
  }

  return categoryData;
}

// 化学物質基準を取得
export function getChemicalStandard(substanceName: string): ChemicalSubstance | null {
  const standards = getEvaluationStandards();
  const chemicalSubstances = standards.evaluation_standards.environmental_factors.chemical_substances;

  if (!chemicalSubstances) return null;

  // 一般化学物質から検索
  const substances = chemicalSubstances.general_chemicals?.substances;
  if (substances && substanceName in substances) {
    return substances[substanceName];
  }

  // アンモニアの場合（将来の拡張用）
  if (substanceName.toLowerCase() === 'ammonia' || substanceName === 'アンモニア') {
    const ammonia = chemicalSubstances.ammonia;
    if (ammonia && typeof ammonia === 'object' && 'substance_name' in ammonia) {
      return ammonia as ChemicalSubstance;
    }
  }

  return null;
}

// RULAスコア評価を取得
export function getRulaEvaluation(score: number): RulaScoreRange | null {
  const standards = getEvaluationStandards();
  const physicalFactors = standards.evaluation_standards.physical_factors;

  if (!physicalFactors?.rula_assessment) return null;

  const ranges = physicalFactors.rula_assessment.score_ranges;
  if (!ranges) return null;

  if (score >= 1 && score <= 2) return ranges['1_2'];
  if (score >= 3 && score <= 4) return ranges['3_4'];
  if (score >= 5 && score <= 6) return ranges['5_6'];
  if (score === 7) return ranges['7'];

  return null;
}

// OWASカテゴリ評価を取得
export function getOwasEvaluation(category: number): OwasCategory | null {
  const standards = getEvaluationStandards();
  const physicalFactors = standards.evaluation_standards.physical_factors;

  if (!physicalFactors?.owas_assessment) return null;

  const categories = physicalFactors.owas_assessment.categories;
  if (!categories) return null;

  const categoryKey = category.toString() as '1' | '2' | '3' | '4';
  return categories[categoryKey] ?? null;
}

// リスク評価を取得
export function getRiskEvaluation(riskPoint: number): RiskLevel | null {
  const standards = getEvaluationStandards();
  const hazardFactors = standards.evaluation_standards.hazard_factors;

  if (!hazardFactors?.risk_assessment) return null;

  const matrix = hazardFactors.risk_assessment.risk_matrix;
  if (!matrix) return null;

  if (riskPoint >= 1 && riskPoint <= 4) return matrix.low_risk;
  if (riskPoint >= 5 && riskPoint <= 9) return matrix.medium_risk;
  if (riskPoint >= 10 && riskPoint <= 15) return matrix.high_risk;
  if (riskPoint >= 16 && riskPoint <= 25) return matrix.critical_risk;

  return null;
}

// 参照例を検索
export function findReferenceExample(category: string, subcategory: string): ScoringPattern | null {
  const examples = getReferenceExamples();
  const generalPatterns = examples.reference_examples.general_scoring_patterns;

  const categoryData = generalPatterns[category];
  if (!categoryData) return null;

  return categoryData[subcategory] ?? null;
}

// 作業事例を検索
export function findWorkCaseExample(caseId: string): WorkCase | null {
  const cases = getWorkCaseExamples();
  const individualCases = cases.work_case_examples.individual_work_cases;

  return individualCases[caseId] ?? null;
}