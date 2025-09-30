/**
 * AI機能テスト用のサンプルデータ
 */

import { WorkAnalysisInput } from '@/lib/aiAssistant'

export const aiTestWorkScenarios: WorkAnalysisInput[] = [
  {
    workName: '重量物運搬作業',
    workDescription: '10キロの部品を1日に50回程度持ち上げて運搬します。腰をかがめて持ち上げることが多く、作業場は騒音があります。',
    factoryType: '製造工場',
    processType: '組立ライン',
    workHours: 8,
    workerCount: 2
  },
  {
    workName: 'プレス機械操作',
    workDescription: '金属プレス機械を操作して部品の成形を行います。高い集中力が必要で、機械の騒音が95デシベル程度あります。',
    factoryType: '金属加工工場',
    processType: 'プレス加工',
    workHours: 8,
    workerCount: 1
  },
  {
    workName: '溶接作業',
    workDescription: '鋼材の溶接作業を行います。高温環境で保護具を着用し、有害ガスが発生する可能性があります。',
    factoryType: '鉄工所',
    processType: '溶接・組立',
    workHours: 6,
    workerCount: 3
  },
  {
    workName: 'デスクワーク・品質検査',
    workDescription: 'コンピューター画面で製品の品質データを確認し、不良品の判定を行います。長時間の集中が必要です。',
    factoryType: '品質管理センター',
    processType: '検査・分析',
    workHours: 8,
    workerCount: 1
  },
  {
    workName: '化学薬品調合',
    workDescription: '化学薬品を正確に計量・調合します。防護服を着用し、換気設備のある環境で作業します。',
    factoryType: '化学工場',
    processType: '調合・混合',
    workHours: 6,
    workerCount: 2
  },
  {
    workName: '高所メンテナンス',
    workDescription: '高さ5メートルの足場で機械の保守点検を行います。安全帯を使用し、工具を持って作業します。',
    factoryType: '設備保全',
    processType: 'メンテナンス',
    workHours: 4,
    workerCount: 2
  }
]

export const aiTestImageScenarios = [
  {
    fileName: 'factory_worker_lifting.jpg',
    description: '工場作業者が重量物を持ち上げている写真',
    expectedDetections: ['person', 'tool', 'machine'],
    expectedWorkType: '重量物運搬',
    expectedRisks: ['物理的負荷', 'エルゴノミクスリスク']
  },
  {
    fileName: 'office_computer_work.jpg', 
    description: 'オフィスでコンピューター作業をしている写真',
    expectedDetections: ['person', 'computer', 'chair'],
    expectedWorkType: 'デスクワーク',
    expectedRisks: ['長時間座位', '眼精疲労']
  },
  {
    fileName: 'welding_work.jpg',
    description: '溶接作業を行っている作業者の写真',
    expectedDetections: ['person', 'welding_tool', 'protective_gear'],
    expectedWorkType: '溶接作業',
    expectedRisks: ['高温', '有害ガス', '火傷リスク']
  },
  {
    fileName: 'chemical_handling.jpg',
    description: '化学薬品を扱う作業者の写真',
    expectedDetections: ['person', 'chemical_container', 'protective_suit'],
    expectedWorkType: '化学作業',
    expectedRisks: ['化学物質暴露', '皮膚接触リスク']
  }
]

export const aiTestVoiceInputs = [
  '私は毎日重い荷物を運ぶ仕事をしています。20キロくらいの箱を1日100回くらい持ち上げて運びます。腰が痛くなることがあります。',
  '機械を操作する仕事で、とても集中力が必要です。ミスをすると大変なことになるので、いつも緊張しています。騒音もうるさいです。',
  '化学工場で薬品を混ぜる作業をしています。匂いがきつくて、防護マスクをつけて作業しています。目がチカチカすることがあります。',
  'コンピューターで品質チェックの仕事をしています。1日8時間画面を見続けるので、目と肩が疲れます。細かい作業で神経を使います。'
]

// AI分析結果の期待値データ
export const expectedAnalysisResults = {
  heavyLifting: {
    physicalDemand: 'high',
    mentalDemand: 'low',
    environmentalRisk: 'medium', 
    hazardLevel: 'medium',
    estimatedScores: {
      physical: 7,
      mental: 2,
      environmental: 4,
      hazard: 5,
      final3K: 'A'
    }
  },
  computerWork: {
    physicalDemand: 'low',
    mentalDemand: 'high',
    environmentalRisk: 'low',
    hazardLevel: 'low',
    estimatedScores: {
      physical: 2,
      mental: 6,
      environmental: 1,
      hazard: 1,
      final3K: 'B'
    }
  },
  chemicalWork: {
    physicalDemand: 'medium',
    mentalDemand: 'medium',
    environmentalRisk: 'high',
    hazardLevel: 'high',
    estimatedScores: {
      physical: 3,
      mental: 4,
      environmental: 8,
      hazard: 7,
      final3K: 'A'
    }
  }
}

// テスト用のモック画像ファイル生成ヘルパー
export function createMockImageFile(fileName: string, mimeType: string = 'image/jpeg'): File {
  // 1x1ピクセルの透明なPNG画像データ（Base64）
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return new File([bytes], fileName, { type: mimeType })
}

// AI機能のテストケース
export const aiTestCases = [
  {
    name: '重量物運搬作業の分析',
    input: aiTestWorkScenarios[0],
    expectedResult: expectedAnalysisResults.heavyLifting,
    description: '重量物を扱う作業の物理的リスクが正しく評価されることを確認'
  },
  {
    name: 'デスクワークの分析', 
    input: aiTestWorkScenarios[3],
    expectedResult: expectedAnalysisResults.computerWork,
    description: '長時間のコンピューター作業の精神的負荷が正しく評価されることを確認'
  },
  {
    name: '化学作業の分析',
    input: aiTestWorkScenarios[4], 
    expectedResult: expectedAnalysisResults.chemicalWork,
    description: '化学物質を扱う作業の環境リスクが正しく評価されることを確認'
  }
]

// 統合テストシナリオ
export const integrationTestScenarios = [
  {
    name: '音声入力→AI分析→推奨適用の流れ',
    steps: [
      '音声入力で作業内容を説明',
      'AI分析を実行',
      '推奨設定を確認',
      '評価フォームに適用'
    ],
    testData: {
      voiceInput: aiTestVoiceInputs[0],
      expectedWorkType: '重量物運搬',
      expectedRecommendations: ['物理因子の評価', '姿勢リスクの確認']
    }
  },
  {
    name: '画像アップロード→解析→評価の流れ',
    steps: [
      '作業写真をアップロード',
      '画像解析を実行', 
      '検出結果を確認',
      'AI推奨を生成'
    ],
    testData: {
      imageFile: 'factory_worker_lifting.jpg',
      expectedDetections: ['person', 'tool', 'machine'],
      expectedRiskFactors: 2
    }
  },
  {
    name: '複合データ分析の流れ',
    steps: [
      '音声とテキストで作業説明',
      '複数画像をアップロード',
      '統合AI分析を実行',
      '総合的な推奨事項を確認'
    ],
    testData: {
      multipleInputs: true,
      expectedConfidence: 0.85,
      expectedRecommendationCount: 3
    }
  }
]