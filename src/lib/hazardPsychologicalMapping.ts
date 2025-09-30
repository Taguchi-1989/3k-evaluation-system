/**
 * 危険因子への心理的要素統合マッピングシステム
 *
 * 労災履歴・安全管理ストレス・未解消リスクを危険因子軸で評価
 * 4つの評価軸の独立性を保ちながら、危険因子内で心理的要素を統合
 */

import type {
  AccidentHistoryAssessment,
  AccidentHistoryEvent,
  SafetyManagementStressAssessment,
  SafetyGapAssessment,
  OngoingRiskAssessment
} from '@/types/evaluation';

// 労災履歴リスクレベル評価マッピング
export const ACCIDENT_HISTORY_RISK_MAPPING = {
  none: {
    score: 1,
    level: 'low' as const,
    description: '労災履歴なし・低リスク',
    monitoringFrequency: 'quarterly'
  },
  minor_single: {
    score: 2,
    level: 'low' as const,
    description: '軽微な単発事故・継続監視',
    monitoringFrequency: 'monthly'
  },
  moderate_single: {
    score: 3,
    level: 'moderate' as const,
    description: '中程度単発事故・注意深い監視',
    monitoringFrequency: 'monthly'
  },
  serious_single: {
    score: 4,
    level: 'high' as const,
    description: '重大単発事故・積極的対策必要',
    monitoringFrequency: 'weekly'
  },
  recurring_pattern: {
    score: 5,
    level: 'critical' as const,
    description: '再発パターン・緊急対策必要',
    monitoringFrequency: 'daily'
  },
  fatal_history: {
    score: 5,
    level: 'critical' as const,
    description: '死亡事故履歴・最高レベル対策',
    monitoringFrequency: 'daily'
  }
};

// 安全管理適切度スコアマッピング
export const SAFETY_MANAGEMENT_SCORE_MAPPING = {
  excellent: {
    score: 1,
    description: '優秀な安全管理・継続維持',
    urgency: 'routine' as const
  },
  adequate: {
    score: 2,
    description: '適切な安全管理・改善余地あり',
    urgency: 'monitor' as const
  },
  minimal: {
    score: 3,
    description: '最低限の安全管理・改善必要',
    urgency: 'priority' as const
  },
  inadequate: {
    score: 4,
    description: '不適切な安全管理・緊急改善',
    urgency: 'immediate' as const
  },
  non_compliant: {
    score: 5,
    description: '法令違反・即座の是正必要',
    urgency: 'immediate' as const
  }
};

/**
 * 労災履歴から危険因子スコアを算出
 */
export function assessAccidentHistoryRisk(
  accidentHistory: AccidentHistoryEvent[]
): AccidentHistoryAssessment {
  if (accidentHistory.length === 0) {
    return {
      hasAccidentHistory: false,
      accidentTypes: [],
      totalAccidentCount: 0,
      recurrenceRisk: 'low',
      fiveStageScore: 1,
      mitigationMeasures: ['基本的な安全対策の継続'],
      remainingRisks: []
    };
  }

  // 事故重篤度の最高レベルを特定
  const maxSeverity = accidentHistory.reduce((max, event) => {
    const severityOrder = { minor: 1, moderate: 2, serious: 3, fatal: 4 };
    return severityOrder[event.severity] > severityOrder[max] ? event.severity : max;
  }, 'minor' as const);

  // 再発パターンの検出
  const accidentTypes = [...new Set(accidentHistory.map(e => e.accidentType))];
  const hasRecurringPattern = accidentTypes.some(type =>
    accidentHistory.filter(e => e.accidentType === type).length > 1
  );

  // 最近の事故（1年以内）
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentAccidents = accidentHistory.filter(e => e.accidentDate > oneYearAgo);

  // スコア算出ロジック
  let baseScore = 1;
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';

  if (maxSeverity === 'fatal') {
    baseScore = 5;
    riskLevel = 'critical';
  } else if (hasRecurringPattern) {
    baseScore = 5;
    riskLevel = 'critical';
  } else if (maxSeverity === 'serious') {
    baseScore = 4;
    riskLevel = 'high';
  } else if (maxSeverity === 'moderate' || recentAccidents.length > 0) {
    baseScore = 3;
    riskLevel = 'moderate';
  } else if (accidentHistory.length > 0) {
    baseScore = 2;
    riskLevel = 'low';
  }

  // 防止策の効果による調整
  const effectivePreventionCount = accidentHistory.filter(e =>
    e.effectiveness === 'effective' || e.effectiveness === 'highly_effective'
  ).length;

  if (effectivePreventionCount > 0 && baseScore > 1) {
    baseScore = Math.max(1, baseScore - 0.5);
  }

  // 未解消リスクの特定
  const remainingRisks = accidentHistory
    .filter(e => e.effectiveness === 'ineffective' || e.effectiveness === 'partial')
    .map(e => `${e.accidentType}: ${e.rootCause}`);

  return {
    hasAccidentHistory: true,
    accidentTypes: accidentHistory,
    totalAccidentCount: accidentHistory.length,
    recentAccidentDate: new Date(Math.max(...accidentHistory.map(e => e.accidentDate.getTime()))),
    recurrenceRisk: riskLevel,
    fiveStageScore: Math.round(baseScore * 10) / 10,
    mitigationMeasures: [...new Set(accidentHistory.flatMap(e => e.preventiveMeasures))],
    remainingRisks
  };
}

/**
 * 安全管理体制から危険因子スコアを算出
 */
export function assessSafetyManagementStress(
  complianceLevel: SafetyManagementStressAssessment['complianceLevel'],
  trainingAdequacy: SafetyManagementStressAssessment['safetyTrainingAdequacy'],
  reportingSystem: SafetyManagementStressAssessment['incidentReportingSystem'],
  riskAssessmentFreq: SafetyManagementStressAssessment['riskAssessmentFrequency'],
  managementGaps: SafetyGapAssessment[]
): SafetyManagementStressAssessment {
  // 各要素のスコア算出
  const complianceScore = {
    excellent: 1, compliant: 2, partially_compliant: 4, non_compliant: 5
  }[complianceLevel];

  const trainingScore = {
    excellent: 1, adequate: 2, minimal: 3, inadequate: 4
  }[trainingAdequacy];

  const reportingScore = {
    comprehensive: 1, adequate: 2, basic: 3, none: 5
  }[reportingSystem];

  const assessmentScore = {
    monthly: 1, quarterly: 2, semi_annual: 3, annual: 4, never: 5
  }[riskAssessmentFreq];

  // 管理欠陥による加点
  const gapPenalty = managementGaps.reduce((total, gap) => {
    const gapScore = { low: 0.2, moderate: 0.5, high: 1, critical: 1.5 }[gap.riskLevel];
    return total + gapScore;
  }, 0);

  // 総合スコア算出（最高点優先）
  const maxComponentScore = Math.max(complianceScore, trainingScore, reportingScore, assessmentScore);
  const totalScore = Math.min(5, maxComponentScore + gapPenalty);

  // 緊急改善項目の特定
  const urgentImprovements: string[] = [];

  if (complianceLevel === 'non_compliant') {
    urgentImprovements.push('法令順守体制の確立');
  }

  if (trainingAdequacy === 'inadequate') {
    urgentImprovements.push('安全教育プログラムの改善');
  }

  if (reportingSystem === 'none') {
    urgentImprovements.push('インシデント報告制度の構築');
  }

  managementGaps
    .filter(gap => gap.riskLevel === 'critical' || gap.legalRequirement)
    .forEach(gap => urgentImprovements.push(gap.description));

  return {
    managementGaps,
    complianceLevel,
    safetyTrainingAdequacy: trainingAdequacy,
    incidentReportingSystem: reportingSystem,
    riskAssessmentFrequency: riskAssessmentFreq,
    fiveStageScore: Math.round(totalScore * 10) / 10,
    urgentImprovements
  };
}

/**
 * 現在進行中のリスクを評価
 */
export function assessOngoingRisk(
  riskDescription: string,
  recurrenceProbability: OngoingRiskAssessment['recurrenceProbability'],
  potentialImpact: OngoingRiskAssessment['potentialImpact'],
  currentStatus: OngoingRiskAssessment['currentStatus'],
  mitigationActions: string[]
): OngoingRiskAssessment {
  // 再発確率スコア
  const probabilityScore = {
    very_low: 1, low: 2, moderate: 3, high: 4, very_high: 5
  }[recurrenceProbability];

  // 潜在的影響度スコア
  const impactScore = {
    minor: 1, moderate: 2, major: 4, catastrophic: 5
  }[potentialImpact];

  // 現在の対応状況による調整
  const statusModifier = {
    unaddressed: 1.5, in_progress: 1.2, partially_mitigated: 1.0, monitored: 0.8
  }[currentStatus];

  // 緩和策効果による調整
  const mitigationEffect = mitigationActions.length > 0 ? 0.8 : 1.0;

  // 総合スコア算出
  const rawScore = Math.max(probabilityScore, impactScore) * statusModifier * mitigationEffect;
  const finalScore = Math.max(1, Math.min(5, rawScore));

  // 監視頻度の決定
  let monitoringFrequency: OngoingRiskAssessment['monitoringFrequency'] = 'monthly';
  if (finalScore >= 4.5) {
    monitoringFrequency = 'daily';
  } else if (finalScore >= 3.5) {
    monitoringFrequency = 'weekly';
  } else if (finalScore >= 2.5) {
    monitoringFrequency = 'weekly';
  }

  // エスカレーション条件
  const escalationTriggers: string[] = [];
  if (potentialImpact === 'catastrophic') {
    escalationTriggers.push('任意の変化・即座にエスカレーション');
  }
  if (recurrenceProbability === 'very_high') {
    escalationTriggers.push('類似事象の発生');
  }
  if (currentStatus === 'unaddressed') {
    escalationTriggers.push('30日以内に対応開始されない場合');
  }

  return {
    riskId: `RISK_${Date.now()}`,
    riskDescription,
    originDate: new Date(),
    riskCategory: 'process', // デフォルト値
    currentStatus,
    recurrenceProbability,
    potentialImpact,
    fiveStageScore: Math.round(finalScore * 10) / 10,
    mitigationActions,
    monitoringFrequency,
    escalationTriggers
  };
}

/**
 * 危険因子全体の統合評価
 */
export function calculateIntegratedHazardScore(
  accidentHistory?: AccidentHistoryAssessment,
  safetyManagement?: SafetyManagementStressAssessment,
  ongoingRisks?: OngoingRiskAssessment[]
): {
  totalScore: number;
  dominantRisk: 'accident_history' | 'safety_management' | 'ongoing_risks' | null;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  urgentActions: string[];
} {
  const scores = [];

  if (accidentHistory) scores.push({ type: 'accident_history', score: accidentHistory.fiveStageScore });
  if (safetyManagement) scores.push({ type: 'safety_management', score: safetyManagement.fiveStageScore });
  if (ongoingRisks) {
    const maxOngoingScore = Math.max(...ongoingRisks.map(r => r.fiveStageScore));
    scores.push({ type: 'ongoing_risks', score: maxOngoingScore });
  }

  if (scores.length === 0) {
    return {
      totalScore: 1,
      dominantRisk: null,
      riskLevel: 'low',
      urgentActions: []
    };
  }

  // 最高スコア優先で評価
  const maxScore = Math.max(...scores.map(s => s.score));
  const dominantRisk = scores.find(s => s.score === maxScore)?.type as any;

  // リスクレベル判定
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  if (maxScore >= 4.5) {
    riskLevel = 'critical';
  } else if (maxScore >= 3.5) {
    riskLevel = 'high';
  } else if (maxScore >= 2.5) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 緊急対応が必要な項目
  const urgentActions: string[] = [];

  if (accidentHistory && accidentHistory.fiveStageScore >= 4) {
    urgentActions.push('労災再発防止策の強化');
  }

  if (safetyManagement && safetyManagement.fiveStageScore >= 4) {
    urgentActions.push(...safetyManagement.urgentImprovements);
  }

  if (ongoingRisks) {
    ongoingRisks
      .filter(risk => risk.fiveStageScore >= 4)
      .forEach(risk => urgentActions.push(`未解消リスク: ${risk.riskDescription}`));
  }

  return {
    totalScore: Math.round(maxScore * 10) / 10,
    dominantRisk,
    riskLevel,
    urgentActions
  };
}