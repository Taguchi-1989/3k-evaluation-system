// 基準値データを読み込むためのユーティリティ
import evaluationStandardsBase from '@/ref/evaluation_standards_base.json';
import referenceExamples from '@/ref/evaluation_reference_examples.json';
import workCaseExamples from '@/ref/work_case_examples.json';

export type StandardsData = typeof evaluationStandardsBase;
export type ReferenceExamples = typeof referenceExamples;
export type WorkCaseExamples = typeof workCaseExamples;

// 基準値データを取得
export function getEvaluationStandards(): StandardsData {
  return evaluationStandardsBase;
}

// 参照例データを取得
export function getReferenceExamples(): ReferenceExamples {
  return referenceExamples;
}

// 作業事例データを取得
export function getWorkCaseExamples(): WorkCaseExamples {
  return workCaseExamples;
}

// 特定の基準値を取得
export function getStandardByCategory(category: string, type?: string) {
  const standards = getEvaluationStandards();
  const categoryData = standards.evaluation_standards[category as keyof typeof standards.evaluation_standards];
  
  if (!categoryData) return null;
  
  if (type && typeof categoryData === 'object' && categoryData !== null) {
    return categoryData[type as keyof typeof categoryData] || null;
  }
  
  return categoryData;
}

// 化学物質基準を取得
export function getChemicalStandard(substanceName: string) {
  const environmentalStandards = getStandardByCategory('environmental_factors', 'chemical_substances');
  
  if (!environmentalStandards) return null;
  
  // 一般化学物質から検索
  const generalChemicals = (environmentalStandards as any)?.general_chemicals?.substances;
  if (generalChemicals && substanceName in generalChemicals) {
    return generalChemicals[substanceName as keyof typeof generalChemicals];
  }
  
  // アンモニアの場合
  if (substanceName.toLowerCase() === 'ammonia' || substanceName === 'アンモニア') {
    return (environmentalStandards as any)?.ammonia;
  }
  
  return null;
}

// RULAスコア評価を取得
export function getRulaEvaluation(score: number) {
  const rulaStandard = getStandardByCategory('physical_factors', 'rula_assessment');
  if (!rulaStandard) return null;
  
  const ranges = (rulaStandard as any)?.score_ranges;
  if (!ranges) return null;
  
  if (score >= 1 && score <= 2) return ranges['1_2'];
  if (score >= 3 && score <= 4) return ranges['3_4'];
  if (score >= 5 && score <= 6) return ranges['5_6'];
  if (score === 7) return ranges['7'];
  
  return null;
}

// OWASカテゴリ評価を取得
export function getOwasEvaluation(category: number) {
  const owasStandard = getStandardByCategory('physical_factors', 'owas_assessment');
  if (!owasStandard) return null;
  
  const categories = owasStandard.categories;
  if (!categories) return null;
  
  return categories[category.toString() as keyof typeof categories] || null;
}

// リスク評価を取得
export function getRiskEvaluation(riskPoint: number) {
  const riskStandard = getStandardByCategory('hazard_factors', 'risk_assessment');
  if (!riskStandard) return null;
  
  const matrix = riskStandard.risk_matrix;
  if (!matrix) return null;
  
  if (riskPoint >= 1 && riskPoint <= 4) return matrix.low_risk;
  if (riskPoint >= 5 && riskPoint <= 9) return matrix.medium_risk;
  if (riskPoint >= 10 && riskPoint <= 15) return matrix.high_risk;
  if (riskPoint >= 16 && riskPoint <= 25) return matrix.critical_risk;
  
  return null;
}

// 参照例を検索
export function findReferenceExample(category: string, subcategory: string) {
  const examples = getReferenceExamples();
  const generalPatterns = examples.reference_examples.general_scoring_patterns;
  
  const categoryData = generalPatterns[category as keyof typeof generalPatterns];
  if (!categoryData) return null;
  
  return categoryData[subcategory as keyof typeof categoryData] || null;
}

// 作業事例を検索
export function findWorkCaseExample(caseId: string) {
  const cases = getWorkCaseExamples();
  const individualCases = cases.work_case_examples.individual_work_cases;
  
  return individualCases[caseId as keyof typeof individualCases] || null;
}