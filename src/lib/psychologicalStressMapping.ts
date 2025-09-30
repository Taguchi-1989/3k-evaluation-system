/**
 * 厚生労働省「心理的負荷による精神障害の認定基準」準拠
 * 心理的負荷強度マッピングシステム
 *
 * 厚労省基準（強・中・弱）⇔ 5段階評価（1-5点、5点=最高リスク）
 */

import type { PsychologicalStressEvent, HarassmentAssessment } from '@/types/evaluation';

// 厚生労働省基準の心理的負荷強度
export type StressIntensityLevel = 'strong' | 'moderate' | 'weak';

// 5段階評価スコア範囲
export interface FiveStageScoreRange {
  min: number;
  max: number;
  typical: number;
  description: string;
  urgency: 'immediate' | 'priority' | 'monitor' | 'routine';
}

/**
 * 厚労省基準 → 5段階評価マッピング定義
 */
export const STRESS_INTENSITY_MAPPING: Record<StressIntensityLevel, FiveStageScoreRange> = {
  strong: {
    min: 4,
    max: 5,
    typical: 5,
    description: '最高リスク・緊急対応必要',
    urgency: 'immediate'
  },
  moderate: {
    min: 2,
    max: 3,
    typical: 3,
    description: '中程度リスク・注意深い監視',
    urgency: 'priority'
  },
  weak: {
    min: 1,
    max: 2,
    typical: 1,
    description: '低リスク・定期的な観察',
    urgency: 'monitor'
  }
};

/**
 * 厚生労働省別表1準拠：業務による出来事と心理的負荷強度
 */
export const WORKPLACE_STRESS_EVENTS = {
  // 1. 事故や災害の体験
  accidentDisaster: {
    category: '事故や災害の体験',
    events: [
      {
        eventType: '重大な人身事故・重大事故',
        legalBasis: '別表1-1-(1)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '生命の危険を感じるような、または極度の恐怖を感じるような事故災害の体験'
      },
      {
        eventType: '軽微な事故・災害',
        legalBasis: '別表1-1-(2)',
        defaultIntensity: 'weak' as StressIntensityLevel,
        description: '軽微な事故災害の体験'
      }
    ]
  },

  // 2. 仕事の失敗、過重な責任の発生等
  workFailureResponsibility: {
    category: '仕事の失敗、過重な責任の発生等',
    events: [
      {
        eventType: '会社経営に影響する重大なミス',
        legalBasis: '別表1-2-(1)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '会社の経営に影響するなどの重大な仕事上のミス'
      },
      {
        eventType: '横領等金銭関連事件',
        legalBasis: '別表1-2-(2)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '横領など金銭に関わる事件を起こした'
      },
      {
        eventType: '軽微なミス・失敗',
        legalBasis: '別表1-2-(3)',
        defaultIntensity: 'weak' as StressIntensityLevel,
        description: '軽微な仕事上のミス・失敗'
      }
    ]
  },

  // 3. 仕事の量・質の変化
  workloadChange: {
    category: '仕事の量・質の変化',
    events: [
      {
        eventType: '月100時間以上の時間外労働',
        legalBasis: '別表1-3-(1)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '時間外労働が月100時間以上となった'
      },
      {
        eventType: '月80時間以上の時間外労働',
        legalBasis: '別表1-3-(2)',
        defaultIntensity: 'moderate' as StressIntensityLevel,
        description: '時間外労働が月80時間以上となった'
      },
      {
        eventType: '2週間以上の連続勤務',
        legalBasis: '別表1-3-(3)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '2週間以上にわたって連続勤務を行った'
      },
      {
        eventType: '日常的な長時間労働',
        legalBasis: '別表1-3-(4)',
        defaultIntensity: 'weak' as StressIntensityLevel,
        description: '1日10時間程度の業務が2週間程度続いた'
      }
    ]
  },

  // 4. 対人関係
  interpersonalRelations: {
    category: '対人関係',
    events: [
      {
        eventType: 'パワーハラスメント',
        legalBasis: '別表1-4-(1)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '上司等から身体的攻撃、精神的攻撃等のパワーハラスメントを受けた'
      },
      {
        eventType: 'セクシャルハラスメント',
        legalBasis: '別表1-4-(2)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: 'セクシャルハラスメントを受けた'
      },
      {
        eventType: '同僚からの嫌がらせ・いじめ',
        legalBasis: '別表1-4-(3)',
        defaultIntensity: 'strong' as StressIntensityLevel,
        description: '同僚等から著しい嫌がらせ、いじめ、又は暴行を受けた'
      },
      {
        eventType: '軽微な人間関係の問題',
        legalBasis: '別表1-4-(4)',
        defaultIntensity: 'weak' as StressIntensityLevel,
        description: '職場の人間関係に軽微な問題が生じた'
      }
    ]
  }
};

/**
 * 心理的負荷強度を5段階評価スコアに変換
 */
export function mapStressIntensityToFiveStage(
  intensity: StressIntensityLevel,
  modifiers?: {
    mitigatingFactors?: string[];
    aggravatingFactors?: string[];
    duration?: number;
  }
): number {
  const baseMapping = STRESS_INTENSITY_MAPPING[intensity];
  let score = baseMapping.typical;

  // 修正要因を考慮した調整
  if (modifiers) {
    // 緩衝要因による減点
    if (modifiers.mitigatingFactors && modifiers.mitigatingFactors.length > 0) {
      const mitigationReduction = Math.min(modifiers.mitigatingFactors.length * 0.5, 1);
      score = Math.max(score - mitigationReduction, baseMapping.min);
    }

    // 悪化要因による加点
    if (modifiers.aggravatingFactors && modifiers.aggravatingFactors.length > 0) {
      const aggravationIncrease = Math.min(modifiers.aggravatingFactors.length * 0.5, 1);
      score = Math.min(score + aggravationIncrease, baseMapping.max);
    }

    // 継続期間による調整
    if (modifiers.duration && modifiers.duration > 0) {
      if (modifiers.duration >= 30) { // 1ヶ月以上
        score = Math.min(score + 0.5, baseMapping.max);
      } else if (modifiers.duration >= 7) { // 1週間以上
        score = Math.min(score + 0.2, baseMapping.max);
      }
    }
  }

  // 5段階評価の範囲内に制限
  return Math.max(1, Math.min(5, Math.round(score * 10) / 10));
}

/**
 * 複数の心理的負荷事象を統合評価
 */
export function calculateIntegratedStressScore(
  events: PsychologicalStressEvent[]
): {
  totalScore: number;
  highestIntensity: StressIntensityLevel;
  dominantEvent: PsychologicalStressEvent | null;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
} {
  if (events.length === 0) {
    return {
      totalScore: 1,
      highestIntensity: 'weak',
      dominantEvent: null,
      riskLevel: 'low'
    };
  }

  // 最高強度の事象を特定
  const strongEvents = events.filter(e => e.stressIntensity === 'strong');
  const moderateEvents = events.filter(e => e.stressIntensity === 'moderate');

  let totalScore: number;
  let highestIntensity: StressIntensityLevel;
  let dominantEvent: PsychologicalStressEvent;

  if (strongEvents.length > 0) {
    // 「強」の事象が存在する場合は自動的に4-5点
    dominantEvent = strongEvents[0];
    highestIntensity = 'strong';
    totalScore = Math.max(...strongEvents.map(e => e.fiveStageScore));

    // 複数の「強」事象がある場合の加重
    if (strongEvents.length > 1) {
      totalScore = Math.min(5, totalScore + (strongEvents.length - 1) * 0.2);
    }
  } else if (moderateEvents.length > 0) {
    // 「中」の事象のみの場合
    dominantEvent = moderateEvents[0];
    highestIntensity = 'moderate';
    totalScore = Math.max(...moderateEvents.map(e => e.fiveStageScore));

    // 複数の「中」事象がある場合の累積効果
    if (moderateEvents.length > 1) {
      totalScore = Math.min(4, totalScore + (moderateEvents.length - 1) * 0.3);
    }
  } else {
    // 「弱」の事象のみの場合
    const weakEvents = events.filter(e => e.stressIntensity === 'weak');
    dominantEvent = weakEvents[0];
    highestIntensity = 'weak';
    totalScore = Math.max(...weakEvents.map(e => e.fiveStageScore));

    // 「弱」事象の蓄積効果
    if (weakEvents.length >= 3) {
      totalScore = Math.min(3, totalScore + Math.floor(weakEvents.length / 3) * 0.5);
    }
  }

  // リスクレベル判定
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  if (totalScore >= 4.5) {
    riskLevel = 'critical';
  } else if (totalScore >= 3.5) {
    riskLevel = 'high';
  } else if (totalScore >= 2.5) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    highestIntensity,
    dominantEvent,
    riskLevel
  };
}

/**
 * 時間外労働時間から心理的負荷強度を自動判定
 */
export function assessOvertimeWorkStress(overtimeHours: number): {
  stressIntensity: StressIntensityLevel;
  fiveStageScore: number;
  legalBasis: string;
  urgency: string;
} {
  if (overtimeHours >= 100) {
    return {
      stressIntensity: 'strong',
      fiveStageScore: 5,
      legalBasis: '別表1-3-(1) 月100時間以上の時間外労働',
      urgency: '緊急対応必要'
    };
  } else if (overtimeHours >= 80) {
    return {
      stressIntensity: 'moderate',
      fiveStageScore: 3,
      legalBasis: '別表1-3-(2) 月80時間以上の時間外労働',
      urgency: '注意深い監視必要'
    };
  } else if (overtimeHours >= 45) {
    return {
      stressIntensity: 'weak',
      fiveStageScore: 2,
      legalBasis: '労働基準法36条ガイドライン 月45時間超過',
      urgency: '継続的観察推奨'
    };
  } else {
    return {
      stressIntensity: 'weak',
      fiveStageScore: 1,
      legalBasis: '通常範囲内',
      urgency: '定期確認'
    };
  }
}

/**
 * ハラスメント評価から心理的負荷強度を判定
 */
export function assessHarassmentStress(assessment: HarassmentAssessment): {
  stressIntensity: StressIntensityLevel;
  fiveStageScore: number;
  legalBasis: string;
  recommendations: string[];
} {
  if (!assessment.occurred) {
    return {
      stressIntensity: 'weak',
      fiveStageScore: 1,
      legalBasis: 'ハラスメント事象なし',
      recommendations: ['定期的な職場環境調査の実施']
    };
  }

  // 重篤度と頻度による評価
  let baseIntensity: StressIntensityLevel = 'weak';
  let baseScore = 2;

  if (assessment.severity === 'severe' || assessment.frequency === 'continuous') {
    baseIntensity = 'strong';
    baseScore = 5;
  } else if (assessment.severity === 'moderate' || assessment.frequency === 'frequent') {
    baseIntensity = 'moderate';
    baseScore = 3;
  }

  // 組織対応による修正
  if (assessment.organizationalResponse === 'inadequate' || assessment.organizationalResponse === 'none') {
    baseScore = Math.min(5, baseScore + 0.5);
  }

  const recommendations: string[] = [
    '人事部門への報告',
    '専門カウンセラーへの相談',
    '労働基準監督署への相談',
    '法的対応の検討'
  ];

  return {
    stressIntensity: baseIntensity,
    fiveStageScore: Math.round(baseScore * 10) / 10,
    legalBasis: '別表1-4 対人関係による心理的負荷',
    recommendations
  };
}

/**
 * 法的根拠情報を取得
 */
export function getLegalBasisInfo(legalBasis: string): {
  title: string;
  description: string;
  reference: string;
  lastUpdated: string;
} {
  const legalReferences: Record<string, any> = {
    '別表1-1': {
      title: '事故や災害の体験',
      description: '生命の危険を感じるような、または極度の恐怖を感じるような事故災害',
      reference: '心理的負荷による精神障害の認定基準（令和5年9月1日改正）',
      lastUpdated: '2023-09-01'
    },
    '別表1-3': {
      title: '仕事の量・質の変化',
      description: '時間外労働時間による心理的負荷の評価',
      reference: '心理的負荷による精神障害の認定基準（令和5年9月1日改正）',
      lastUpdated: '2023-09-01'
    },
    '別表1-4': {
      title: '対人関係',
      description: 'パワーハラスメント、セクシャルハラスメント等による心理的負荷',
      reference: '心理的負荷による精神障害の認定基準（令和5年9月1日改正）',
      lastUpdated: '2023-09-01'
    }
  };

  const prefix = legalBasis.split('-(')[0];
  return legalReferences[prefix] || {
    title: '心理的負荷評価',
    description: '労働による心理的負荷の評価',
    reference: '心理的負荷による精神障害の認定基準',
    lastUpdated: '2023-09-01'
  };
}