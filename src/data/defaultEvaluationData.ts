/**
 * 3K評価システム デフォルトデータ・基準書実装
 * 評価基準、凡例、サンプルデータを含む包括的なデータセット
 */

import { 
  PhysicalDetails, MentalDetails, EnvironmentalDetails, HazardDetails,
  Posture, EnvironmentalSubstance, WorkTimeFactor 
} from '@/types/evaluation'

// 評価基準・凡例データ
export const EVALUATION_STANDARDS = {
  // 肉体因子評価基準
  physical: {
    title: '肉体因子評価基準',
    description: 'OWAS法・RULA法に基づく作業姿勢および重量物取扱いの評価',
    scales: {
      rula: {
        name: 'RULA（Rapid Upper Limb Assessment）',
        description: '上肢作業負荷評価法',
        scale: [
          { score: 1, level: '低リスク', color: '#22c55e', description: '現在の姿勢は許容可能' },
          { score: 2, level: '低リスク', color: '#22c55e', description: '現在の姿勢は許容可能' },
          { score: 3, level: '中リスク', color: '#eab308', description: '詳細な調査が必要、変更を検討' },
          { score: 4, level: '中リスク', color: '#eab308', description: '詳細な調査が必要、変更を検討' },
          { score: 5, level: '高リスク', color: '#f97316', description: '速やかに調査し改善が必要' },
          { score: 6, level: '高リスク', color: '#f97316', description: '速やかに調査し改善が必要' },
          { score: 7, level: '最高リスク', color: '#dc2626', description: '直ちに調査し改善が必要' }
        ]
      },
      owas: {
        name: 'OWAS（Ovako Working Posture Analysis System）',
        description: '全身作業姿勢評価法',
        scale: [
          { category: 1, level: '正常', color: '#22c55e', description: '問題なし、対策不要' },
          { category: 2, level: '軽度', color: '#eab308', description: '将来的に対策が必要' },
          { category: 3, level: '重度', color: '#f97316', description: '近い将来対策が必要' },
          { category: 4, level: '極度', color: '#dc2626', description: '直ちに対策が必要' }
        ]
      },
      weight: {
        name: '重量物取扱い基準',
        description: '厚生労働省基準に基づく重量制限',
        limits: {
          bothHands: {
            male: { light: 20, moderate: 30, heavy: 40, maximum: 50 },
            female: { light: 15, moderate: 20, heavy: 25, maximum: 30 },
            general: { light: 15, moderate: 25, heavy: 35, maximum: 45 }
          },
          singleHand: {
            male: { light: 10, moderate: 15, heavy: 20, maximum: 25 },
            female: { light: 8, moderate: 12, heavy: 15, maximum: 18 },
            general: { light: 8, moderate: 12, heavy: 18, maximum: 23 }
          }
        }
      }
    }
  },

  // 精神因子評価基準
  mental: {
    title: '精神因子評価基準',
    description: '作業の精神的負荷を6つの観点から5段階で評価',
    factors: [
      {
        id: 'complexity',
        name: '作業の複雑性',
        description: '作業手順の複雑さ、判断の必要性',
        scale: [
          { level: 1, description: '単純反復作業', examples: ['単純な組立作業', 'ライン作業'] },
          { level: 2, description: '軽度の判断を要する', examples: ['簡単な検査作業', '定型的事務作業'] },
          { level: 3, description: '中程度の判断を要する', examples: ['品質管理', '機械操作'] },
          { level: 4, description: '複雑な判断を要する', examples: ['設計業務', '複雑な検査'] },
          { level: 5, description: '高度な専門判断を要する', examples: ['研究開発', '高度技術業務'] }
        ]
      },
      {
        id: 'concentration',
        name: '集中力の要求度',
        description: '持続的注意力の必要性',
        scale: [
          { level: 1, description: '集中力をあまり要さない', examples: ['単純作業', '軽作業'] },
          { level: 2, description: '軽度の集中力を要する', examples: ['一般事務', '簡単な組立'] },
          { level: 3, description: '中程度の集中力を要する', examples: ['精密組立', '計算業務'] },
          { level: 4, description: '高度な集中力を要する', examples: ['精密検査', '危険作業監視'] },
          { level: 5, description: '極度の集中力を要する', examples: ['手術補助', '航空管制'] }
        ]
      },
      {
        id: 'responsibility',
        name: '責任の重さ',
        description: 'ミスが与える影響の大きさ',
        scale: [
          { level: 1, description: '責任は軽微', examples: ['個人作業', 'サポート業務'] },
          { level: 2, description: '部分的責任', examples: ['チーム作業', '一般業務'] },
          { level: 3, description: '中程度の責任', examples: ['品質管理', '顧客対応'] },
          { level: 4, description: '重大な責任', examples: ['安全管理', '重要業務'] },
          { level: 5, description: '極めて重大な責任', examples: ['生命に関わる業務', '重大設備管理'] }
        ]
      },
      {
        id: 'pressure',
        name: '時間的切迫感',
        description: '納期・時間制約によるプレッシャー',
        scale: [
          { level: 1, description: '時間的余裕がある', examples: ['ゆとりのある作業'] },
          { level: 2, description: '軽度の時間制約', examples: ['標準的な納期'] },
          { level: 3, description: '中程度の時間制約', examples: ['やや厳しい納期'] },
          { level: 4, description: '厳しい時間制約', examples: ['緊急対応業務'] },
          { level: 5, description: '極度の時間制約', examples: ['危機対応', '緊急事態'] }
        ]
      },
      {
        id: 'communication',
        name: 'コミュニケーション負荷',
        description: '対人関係・意思疎通の困難さ',
        scale: [
          { level: 1, description: '最小限のコミュニケーション', examples: ['個人作業中心'] },
          { level: 2, description: '日常的なコミュニケーション', examples: ['チーム内連携'] },
          { level: 3, description: '積極的なコミュニケーション', examples: ['部門間調整'] },
          { level: 4, description: '困難なコミュニケーション', examples: ['クレーム対応'] },
          { level: 5, description: '極めて困難なコミュニケーション', examples: ['交渉業務', '危機対応'] }
        ]
      },
      {
        id: 'decision',
        name: '意思決定の重要性',
        description: '判断・決定が与える影響の重要度',
        scale: [
          { level: 1, description: '定型的判断のみ', examples: ['マニュアル通り作業'] },
          { level: 2, description: '軽微な判断', examples: ['日常的な選択'] },
          { level: 3, description: '中程度の判断', examples: ['作業手順の選択'] },
          { level: 4, description: '重要な判断', examples: ['品質判定', '安全判断'] },
          { level: 5, description: '極めて重要な判断', examples: ['経営判断', '緊急時判断'] }
        ]
      }
    ]
  },

  // 環境因子評価基準
  environmental: {
    title: '環境因子評価基準',
    description: '化学的・物理的・生物学的環境要因の評価',
    categories: {
      chemical: {
        name: '化学的要因',
        substances: [
          {
            name: 'アンモニア',
            standardValue: 25,
            unit: 'ppm',
            healthEffects: ['刺激性', '呼吸器影響'],
            protectionMeasures: ['換気設備', '呼吸器保護具']
          },
          {
            name: '一般化学物質',
            standardValue: 100,
            unit: 'ppm',
            healthEffects: ['刺激性', '中毒'],
            protectionMeasures: ['局所排気', '保護手袋']
          },
          {
            name: '有機溶剤',
            standardValue: 200,
            unit: 'ppm',
            healthEffects: ['中枢神経影響', '皮膚刺激'],
            protectionMeasures: ['密閉作業', '有機溶剤用マスク']
          },
          {
            name: '粉塵',
            standardValue: 2,
            unit: 'mg/m³',
            healthEffects: ['肺機能影響', 'じん肺'],
            protectionMeasures: ['防塵マスク', '湿式作業']
          }
        ]
      },
      physical: {
        name: '物理的要因',
        conditions: [
          {
            type: 'temperature',
            name: '作業環境温度',
            optimalRange: { min: 18, max: 28 },
            unit: '°C',
            wbgtLimits: { light: 30, moderate: 27, heavy: 25 }
          },
          {
            type: 'humidity',
            name: '相対湿度',
            optimalRange: { min: 40, max: 70 },
            unit: '%',
            effects: ['不快感', '作業効率低下']
          },
          {
            type: 'lighting',
            name: '照度',
            standards: {
              roughWork: 150,
              normalWork: 300,
              precisionWork: 750,
              veryPrecisionWork: 1500
            },
            unit: 'lux'
          },
          {
            type: 'noise',
            name: '騒音レベル',
            limits: {
              continuous: 85,
              impulsive: 130,
              comfortable: 60
            },
            unit: 'dB',
            healthEffects: ['聴力低下', 'ストレス', '集中力低下']
          },
          {
            type: 'vibration',
            name: '振動',
            limits: {
              wholeBody: 0.5,
              handArm: 2.5
            },
            unit: 'm/s²',
            healthEffects: ['振動障害', '疲労増加']
          }
        ]
      }
    }
  },

  // 危険因子評価基準
  hazard: {
    title: '危険因子評価基準',
    description: 'リスクアセスメントによる危険要因の評価',
    riskMatrix: {
      title: 'リスクマトリクス',
      description: '遭遇頻度×危険可能性によるリスクレベル判定',
      frequency: [
        { level: 1, description: '稀に発生', examples: ['年1回未満'] },
        { level: 2, description: '時々発生', examples: ['年数回'] },
        { level: 3, description: '時々発生', examples: ['月数回'] },
        { level: 4, description: 'よく発生', examples: ['週数回'] },
        { level: 5, description: 'よく発生', examples: ['毎日'] }
      ],
      severity: [
        { level: 1, description: '軽微', examples: ['軽傷'] },
        { level: 2, description: '軽度', examples: ['休業1日'] },
        { level: 3, description: '中度', examples: ['休業1週間'] },
        { level: 4, description: '重度', examples: ['休業1ヶ月以上'] },
        { level: 5, description: '致命的', examples: ['死亡・重篤な障害'] }
      ],
      riskLevels: [
        { range: [1, 2], level: '低リスク', color: '#22c55e', action: '現状維持、定期確認' },
        { range: [3, 6], level: '中リスク', color: '#eab308', action: '改善計画の策定' },
        { range: [8, 12], level: '高リスク', color: '#f97316', action: '速やかな改善実施' },
        { range: [15, 25], level: '極高リスク', color: '#dc2626', action: '即座の改善・作業停止検討' }
      ]
    },
    hazardTypes: [
      {
        category: '機械的危険',
        items: ['切断・切傷', '挟まれ・巻き込まれ', '衝突', '飛来・落下']
      },
      {
        category: '電気的危険', 
        items: ['感電', '静電気', '電気火災']
      },
      {
        category: '火災・爆発',
        items: ['可燃物火災', 'ガス爆発', '粉塵爆発']
      },
      {
        category: '墜落・転落',
        items: ['高所からの墜落', '同一平面での転倒', '階段での転落']
      }
    ]
  },

  // 作業時間評価基準
  workTime: {
    title: '作業時間評価基準',
    description: '労働時間・疲労度による作業時間分類',
    timeClasses: [
      { 
        class: 'A', 
        range: '< 0.25h', 
        description: '極短時間作業', 
        fatigueFactor: 1.0,
        examples: ['点検作業', '短時間補助']
      },
      { 
        class: 'B', 
        range: '0.25 - 1h', 
        description: '短時間作業', 
        fatigueFactor: 1.1,
        examples: ['準備作業', '清掃作業']
      },
      { 
        class: 'C', 
        range: '1 - 3h', 
        description: '中短時間作業', 
        fatigueFactor: 1.3,
        examples: ['部分的な作業', '間欠作業']
      },
      { 
        class: 'D', 
        range: '3 - 6.5h', 
        description: '中時間作業', 
        fatigueFactor: 1.7,
        examples: ['半日作業', '午前または午後作業']
      },
      { 
        class: 'E', 
        range: '> 6.5h', 
        description: '長時間作業', 
        fatigueFactor: 2.5,
        examples: ['終日作業', '標準勤務']
      }
    ],
    fatigueAssessment: {
      title: '疲労度評価',
      factors: [
        { factor: '作業時間', weight: 0.4 },
        { factor: '作業強度', weight: 0.3 },
        { factor: '休憩時間', weight: 0.2 },
        { factor: '環境条件', weight: 0.1 }
      ]
    }
  }
}

// デフォルト評価データセット
export const DEFAULT_EVALUATION_DATA = {
  // 肉体因子デフォルトデータ
  physicalDefaults: {
    workName: 'サンプル作業',
    factoryName: '第1工場',
    processName: '組立工程',
    checkboxes: {
      weightBoth: false,
      weightSingle: false,
      repetitive: true,
      posture: true,
      walking: false,
      standing: true
    },
    targetWeight: {
      bothHands: 0,
      singleHand: 0
    },
    postures: [
      {
        id: 'posture_1',
        postureName: '標準作業姿勢',
        rulaScore: 3,
        owasCategory: 2,
        duration: 60,
        frequency: 8,
        description: '通常の立位作業姿勢'
      }
    ] as unknown as Posture[]
  } as unknown as PhysicalDetails,

  // 精神因子デフォルトデータ
  mentalDefaults: {
    complexity: 3,
    concentration: 2,
    responsibility: 3,
    pressure: 2,
    communication: 2,
    decision: 2,
    continuousTime: 4,
    mentalLoad: 2.5
  } as MentalDetails,

  // 精神因子カテゴリデータ
  mentalFactor: {
    categories: [
      {
        name: '作業の複雑性',
        type: 'complexity',
        defaultSelected: true,
        hasSubItems: false,
        defaultSeverity: '中程度'
      },
      {
        name: '集中度・注意力',
        type: 'concentration', 
        defaultSelected: true,
        hasSubItems: false,
        defaultSeverity: '軽微'
      },
      {
        name: '責任の重さ',
        type: 'responsibility',
        defaultSelected: true,
        hasSubItems: false,
        defaultSeverity: '中程度'
      },
      {
        name: '時間的プレッシャー',
        type: 'pressure',
        defaultSelected: false,
        hasSubItems: false,
        defaultSeverity: '軽微'
      },
      {
        name: 'コミュニケーション負荷',
        type: 'communication',
        defaultSelected: false,
        hasSubItems: false,
        defaultSeverity: '軽微'
      },
      {
        name: '意思決定の頻度',
        type: 'decision',
        defaultSelected: false,
        hasSubItems: false,
        defaultSeverity: '軽微'
      }
    ]
  },

  // 環境因子デフォルトデータ
  environmentalDefaults: {
    checkboxes: {
      chemicals: true,
      temperature: true,
      noise: false,
      vibration: false,
      lighting: true,
      dust: false,
      humidity: false,
      ventilation: true
    },
    substances: [
      {
        id: 'substance_1',
        substanceName: 'アンモニア',
        category: 'chemical' as const,
        standardValue: 25,
        measuredValue: 15,
        measurementUnit: 'ppm',
        exposureTime: 6,
        protectionLevel: 'medium' as const,
        riskLevel: 2
      }
    ] as unknown as EnvironmentalSubstance[]
  } as EnvironmentalDetails,

  // 危険因子デフォルトデータ
  hazardDefaults: {
    hazardEvents: [
      {
        id: 'hazard_1',
        hazardEvent: '機械への挟まれ',
        encounterFrequency: 2,
        dangerPossibility: 3,
        riskLevel: 6,
        protectionMeasures: ['安全カバー', '緊急停止装置'],
        description: '組立機械使用時の挟まれリスク'
      },
      {
        id: 'hazard_2', 
        hazardEvent: '重量物落下',
        encounterFrequency: 1,
        dangerPossibility: 4,
        riskLevel: 4,
        protectionMeasures: ['安全帽着用', '作業区域設定'],
        description: 'クレーン作業時の落下物リスク'
      }
    ]
  } as unknown as HazardDetails,

  // 作業時間デフォルトデータ
  workTimeDefaults: {
    workHours: 8.0,
    breakHours: 1.0,
    overtimeHours: 0.5,
    nightShiftHours: 0,
    timeClass: 'E' as const,
    fatigueIndex: 7.5,
    workIntensity: 3
  } as unknown as WorkTimeFactor
}

// サンプル作業データセット
export const SAMPLE_WORK_ITEMS = [
  {
    id: 'work_001',
    workName: '精密部品組立作業',
    factoryName: '第1工場',
    processName: '精密組立工程',
    description: '電子部品の精密組立および検査作業',
    estimatedDuration: 480, // 分
    riskLevel: 'medium' as const,
    requiredSkills: ['精密作業', '品質管理'],
    physicalDemand: 3,
    mentalDemand: 4,
    environmentalRisk: 2,
    hazardRisk: 3
  },
  {
    id: 'work_002',
    workName: '重量物運搬作業',
    factoryName: '第2工場',
    processName: '物流工程',
    description: '原材料・製品の運搬およびフォークリフト操作',
    estimatedDuration: 420,
    riskLevel: 'high' as const,
    requiredSkills: ['フォークリフト運転', '安全管理'],
    physicalDemand: 4,
    mentalDemand: 2,
    environmentalRisk: 2,
    hazardRisk: 4
  },
  {
    id: 'work_003',
    workName: '品質検査作業',
    factoryName: '第1工場',
    processName: '品質管理工程',
    description: '製品の外観・寸法検査および不良品判定',
    estimatedDuration: 360,
    riskLevel: 'low' as const,
    requiredSkills: ['検査技術', '計測技術'],
    physicalDemand: 2,
    mentalDemand: 4,
    environmentalRisk: 1,
    hazardRisk: 2
  },
  {
    id: 'work_004',
    workName: '溶接作業',
    factoryName: '第3工場', 
    processName: '溶接工程',
    description: 'アルミニウム材の溶接加工作業',
    estimatedDuration: 300,
    riskLevel: 'high' as const,
    requiredSkills: ['溶接技術', '安全管理'],
    physicalDemand: 3,
    mentalDemand: 3,
    environmentalRisk: 4,
    hazardRisk: 4
  },
  {
    id: 'work_005',
    workName: '機械保全作業',
    factoryName: '全工場',
    processName: '保全工程',
    description: '生産設備の定期点検・修理・予防保全',
    estimatedDuration: 240,
    riskLevel: 'medium' as const,
    requiredSkills: ['機械保全', '電気保全', '安全管理'],
    physicalDemand: 3,
    mentalDemand: 3,
    environmentalRisk: 3,
    hazardRisk: 3
  }
]

// 工場・部門マスターデータ
export const FACTORY_MASTER_DATA = {
  factories: [
    {
      id: 'factory_01',
      name: '第1工場',
      location: '東京都',
      type: '組立工場',
      processes: ['精密組立工程', '品質管理工程', '包装工程']
    },
    {
      id: 'factory_02', 
      name: '第2工場',
      location: '愛知県',
      type: '製造工場',
      processes: ['物流工程', '加工工程', '塗装工程']
    },
    {
      id: 'factory_03',
      name: '第3工場',
      location: '大阪府',
      type: '加工工場',
      processes: ['溶接工程', '機械加工工程', '熱処理工程']
    }
  ],
  departments: [
    {
      id: 'dept_production',
      name: '生産技術部',
      responsibilities: ['生産計画', '工程管理', '品質管理']
    },
    {
      id: 'dept_safety',
      name: '安全管理部',
      responsibilities: ['安全教育', 'リスク管理', '事故調査']
    },
    {
      id: 'dept_quality',
      name: '品質保証部',
      responsibilities: ['品質システム', '検査管理', '改善活動']
    }
  ]
}

// 評価テンプレートデータ
export const EVALUATION_TEMPLATES = {
  standard: {
    name: '標準評価テンプレート',
    description: '一般的な製造業作業向けの基本評価',
    includedFactors: ['physical', 'mental', 'environmental', 'hazard'],
    defaultSettings: {
      enableRealTimeValidation: true,
      showWarnings: true,
      autoSave: true
    }
  },
  heavy: {
    name: '重労働評価テンプレート',
    description: '重量物取扱い・高負荷作業向け評価',
    includedFactors: ['physical', 'workTime', 'hazard'],
    defaultSettings: {
      physicalWeight: 2.0, // 肉体因子の重み付け増加
      enableRealTimeValidation: true
    }
  },
  precision: {
    name: '精密作業評価テンプレート',
    description: '精密・高集中作業向け評価',
    includedFactors: ['mental', 'environmental'],
    defaultSettings: {
      mentalWeight: 2.0, // 精神因子の重み付け増加
      environmentalFocus: ['lighting', 'noise']
    }
  },
  chemical: {
    name: '化学物質取扱評価テンプレート',
    description: '化学物質使用作業向け評価',
    includedFactors: ['environmental', 'hazard'],
    defaultSettings: {
      environmentalWeight: 2.0,
      chemicalFocus: true
    }
  }
}