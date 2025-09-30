/**
 * 評価マトリックス定義
 * 各因子の評価マトリックスをJSON形式で管理
 */

export interface MatrixCell {
  value: number;
  color: string;
  description?: string;
}

export interface MatrixAxis {
  id: string;
  label: string;
  description?: string;
  order: number;
}

export interface EvaluationMatrix {
  id: string;
  name: string;
  description: string;
  category: 'physical' | 'mental' | 'environmental' | 'hazard';
  version: string;
  effectiveDate: string;
  xAxis: {
    name: string;
    description: string;
    values: MatrixAxis[];
  };
  yAxis: {
    name: string;
    description: string;
    values: MatrixAxis[];
  };
  matrix: Record<string, Record<string, MatrixCell>>;
  colorScheme: {
    [key: number]: {
      background: string;
      text: string;
      level: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  rules?: {
    calculation?: string;
    validation?: string[];
    notes?: string[];
  };
}

// 肉体因評価マトリックス（姿勢×持続時間×強度）
export const physicalFactorMatrix: EvaluationMatrix = {
  id: 'physical_posture_duration_strength',
  name: '肉体因評価マトリックス',
  description: '姿勢評価、負荷持続時間、作業強度による3次元評価マトリックス',
  category: 'physical',
  version: '1.0',
  effectiveDate: '2024-08-20',
  xAxis: {
    name: '作業強度',
    description: '作業者が感じる主観的な作業強度レベル',
    values: [
      { id: '1', label: '軽い', description: '軽い作業', order: 1 },
      { id: '2', label: '少しきつい', description: '少しきつい作業', order: 2 },
      { id: '3', label: 'きつい', description: 'きつい作業', order: 3 },
      { id: '4', label: 'とてもきつい', description: 'とてもきつい作業', order: 4 },
      { id: '5', label: '限界', description: '限界レベルの作業', order: 5 }
    ]
  },
  yAxis: {
    name: '姿勢評価×持続時間',
    description: '姿勢評価レベルと負荷持続時間の組み合わせ',
    values: [
      { id: '1-1', label: '良い〜 <10%', description: '良好な姿勢、持続時間10%未満', order: 1 },
      { id: '1-2', label: '良い〜 10-50%', description: '良好な姿勢、持続時間10-50%', order: 2 },
      { id: '1-3', label: '良い〜 >50%', description: '良好な姿勢、持続時間50%超過', order: 3 },
      { id: '2-1', label: '悪い <10%', description: '悪い姿勢、持続時間10%未満', order: 4 },
      { id: '2-2', label: '悪い 10-50%', description: '悪い姿勢、持続時間10-50%', order: 5 },
      { id: '2-3', label: '悪い >50%', description: '悪い姿勢、持続時間50%超過', order: 6 },
      { id: '3-1', label: 'とても悪い <10%', description: 'とても悪い姿勢、持続時間10%未満', order: 7 },
      { id: '3-2', label: 'とても悪い 10-50%', description: 'とても悪い姿勢、持続時間10-50%', order: 8 },
      { id: '3-3', label: 'とても悪い >50%', description: 'とても悪い姿勢、持続時間50%超過', order: 9 }
    ]
  },
  matrix: {
    '1-1': { '1': { value: 1, color: 'blue-100' }, '2': { value: 1, color: 'blue-100' }, '3': { value: 2, color: 'blue-200' }, '4': { value: 4, color: 'blue-300' }, '5': { value: 7, color: 'blue-400' } },
    '1-2': { '1': { value: 1, color: 'blue-100' }, '2': { value: 2, color: 'blue-200' }, '3': { value: 4, color: 'blue-300' }, '4': { value: 7, color: 'blue-400' }, '5': { value: 10, color: 'blue-500' } },
    '1-3': { '1': { value: 2, color: 'blue-200' }, '2': { value: 4, color: 'blue-300' }, '3': { value: 7, color: 'blue-400' }, '4': { value: 10, color: 'blue-500' }, '5': { value: 10, color: 'blue-500' } },
    '2-1': { '1': { value: 1, color: 'blue-100' }, '2': { value: 2, color: 'blue-200' }, '3': { value: 4, color: 'blue-300' }, '4': { value: 7, color: 'blue-400' }, '5': { value: 10, color: 'blue-500' } },
    '2-2': { '1': { value: 2, color: 'blue-200' }, '2': { value: 4, color: 'blue-300' }, '3': { value: 7, color: 'blue-400' }, '4': { value: 10, color: 'blue-500' }, '5': { value: 10, color: 'blue-500' } },
    '2-3': { '1': { value: 4, color: 'blue-300' }, '2': { value: 7, color: 'blue-400' }, '3': { value: 10, color: 'blue-500' }, '4': { value: 10, color: 'blue-500' }, '5': { value: 10, color: 'blue-500' } },
    '3-1': { '1': { value: 1, color: 'blue-100' }, '2': { value: 2, color: 'blue-200' }, '3': { value: 4, color: 'blue-300' }, '4': { value: 7, color: 'blue-400' }, '5': { value: 10, color: 'blue-500' } },
    '3-2': { '1': { value: 4, color: 'blue-300' }, '2': { value: 7, color: 'blue-400' }, '3': { value: 10, color: 'blue-500' }, '4': { value: 10, color: 'blue-500' }, '5': { value: 10, color: 'blue-500' } },
    '3-3': { '1': { value: 7, color: 'blue-400' }, '2': { value: 10, color: 'blue-500' }, '3': { value: 10, color: 'blue-500' }, '4': { value: 10, color: 'blue-500' }, '5': { value: 10, color: 'blue-500' } }
  },
  colorScheme: {
    1: { background: 'bg-blue-100', text: 'text-blue-800', level: 'low' },
    2: { background: 'bg-blue-200', text: 'text-blue-800', level: 'low' },
    4: { background: 'bg-blue-300', text: 'text-blue-900', level: 'medium' },
    7: { background: 'bg-blue-400', text: 'text-white', level: 'high' },
    10: { background: 'bg-blue-500', text: 'text-white', level: 'critical' }
  },
  rules: {
    calculation: 'matrix[posture_duration_key][strength_key].value',
    validation: [
      '姿勢評価は1-3の範囲で入力',
      '持続時間は1-3の範囲で入力（<10%, 10-50%, >50%）',
      '作業強度は1-5の範囲で入力'
    ],
    notes: [
      '姿勢評価は RULA/OWAS スコアから算出',
      '持続時間は作業時間全体に対する割合',
      '最終スコアは最も厳しい条件を採用'
    ]
  }
};

// 精神因評価マトリックス（仕事の質×影響度×持続時間）
export const mentalFactorMatrix: EvaluationMatrix = {
  id: 'mental_work_quality_impact',
  name: '精神因評価マトリックス',
  description: '仕事の質、失敗影響度、持続時間による精神的負荷評価',
  category: 'mental',
  version: '1.0',
  effectiveDate: '2024-08-20',
  xAxis: {
    name: '失敗影響度',
    description: '失敗時の影響の大きさ',
    values: [
      { id: '1', label: '軽微', description: '軽微な影響（<10万円、<1時間）', order: 1 },
      { id: '2', label: '中程度', description: '中程度の影響（10-100万円、1-8時間）', order: 2 },
      { id: '3', label: '重大', description: '重大な影響（100-1000万円、8-40時間）', order: 3 },
      { id: '4', label: '致命的', description: '致命的な影響（>1000万円、>40時間）', order: 4 }
    ]
  },
  yAxis: {
    name: '失敗頻度×持続時間',
    description: '失敗発生頻度と作業時間割合の組み合わせ',
    values: [
      { id: '1-1', label: 'ほとんどない 短時間', description: '失敗頻度：ほとんどない、持続時間：短時間', order: 1 },
      { id: '1-2', label: 'ほとんどない 長時間', description: '失敗頻度：ほとんどない、持続時間：長時間', order: 2 },
      { id: '2-1', label: '稀にある 短時間', description: '失敗頻度：稀にある、持続時間：短時間', order: 3 },
      { id: '2-2', label: '稀にある 長時間', description: '失敗頻度：稀にある、持続時間：長時間', order: 4 },
      { id: '3-1', label: '時々ある 短時間', description: '失敗頻度：時々ある、持続時間：短時間', order: 5 },
      { id: '3-2', label: '時々ある 長時間', description: '失敗頻度：時々ある、持続時間：長時間', order: 6 },
      { id: '4-1', label: '頻繁にある 短時間', description: '失敗頻度：頻繁にある、持続時間：短時間', order: 7 },
      { id: '4-2', label: '頻繁にある 長時間', description: '失敗頻度：頻繁にある、持続時間：長時間', order: 8 }
    ]
  },
  matrix: {
    '1-1': { '1': { value: 1, color: 'green-100' }, '2': { value: 1, color: 'green-100' }, '3': { value: 2, color: 'yellow-100' }, '4': { value: 4, color: 'orange-200' } },
    '1-2': { '1': { value: 1, color: 'green-100' }, '2': { value: 2, color: 'yellow-100' }, '3': { value: 4, color: 'orange-200' }, '4': { value: 7, color: 'red-300' } },
    '2-1': { '1': { value: 1, color: 'green-100' }, '2': { value: 2, color: 'yellow-100' }, '3': { value: 4, color: 'orange-200' }, '4': { value: 7, color: 'red-300' } },
    '2-2': { '1': { value: 2, color: 'yellow-100' }, '2': { value: 4, color: 'orange-200' }, '3': { value: 7, color: 'red-300' }, '4': { value: 10, color: 'red-500' } },
    '3-1': { '1': { value: 2, color: 'yellow-100' }, '2': { value: 4, color: 'orange-200' }, '3': { value: 7, color: 'red-300' }, '4': { value: 10, color: 'red-500' } },
    '3-2': { '1': { value: 4, color: 'orange-200' }, '2': { value: 7, color: 'red-300' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' } },
    '4-1': { '1': { value: 4, color: 'orange-200' }, '2': { value: 7, color: 'red-300' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' } },
    '4-2': { '1': { value: 7, color: 'red-300' }, '2': { value: 10, color: 'red-500' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' } }
  },
  colorScheme: {
    1: { background: 'bg-green-100', text: 'text-green-800', level: 'low' },
    2: { background: 'bg-yellow-100', text: 'text-yellow-800', level: 'low' },
    4: { background: 'bg-orange-200', text: 'text-orange-900', level: 'medium' },
    7: { background: 'bg-red-300', text: 'text-red-900', level: 'high' },
    10: { background: 'bg-red-500', text: 'text-white', level: 'critical' }
  }
};

// 環境因評価マトリックス（物質濃度×曝露時間）
export const environmentalFactorMatrix: EvaluationMatrix = {
  id: 'environmental_concentration_exposure',
  name: '環境因評価マトリックス',
  description: '環境物質濃度と曝露時間による環境リスク評価',
  category: 'environmental',
  version: '1.0',
  effectiveDate: '2024-08-20',
  xAxis: {
    name: '曝露時間',
    description: '有害物質への曝露時間',
    values: [
      { id: '1', label: '短時間', description: '<1時間', order: 1 },
      { id: '2', label: '中時間', description: '1-4時間', order: 2 },
      { id: '3', label: '長時間', description: '4-8時間', order: 3 },
      { id: '4', label: '超長時間', description: '>8時間', order: 4 }
    ]
  },
  yAxis: {
    name: '濃度レベル',
    description: '許容濃度に対する実測濃度の割合',
    values: [
      { id: '1', label: '25%未満', description: '許容濃度の25%未満', order: 1 },
      { id: '2', label: '25-50%', description: '許容濃度の25-50%', order: 2 },
      { id: '3', label: '50-75%', description: '許容濃度の50-75%', order: 3 },
      { id: '4', label: '75-100%', description: '許容濃度の75-100%', order: 4 },
      { id: '5', label: '100%超過', description: '許容濃度の100%超過', order: 5 }
    ]
  },
  matrix: {
    '1': { '1': { value: 1, color: 'blue-100' }, '2': { value: 1, color: 'blue-100' }, '3': { value: 2, color: 'yellow-100' }, '4': { value: 4, color: 'orange-200' } },
    '2': { '1': { value: 1, color: 'blue-100' }, '2': { value: 2, color: 'yellow-100' }, '3': { value: 4, color: 'orange-200' }, '4': { value: 7, color: 'red-300' } },
    '3': { '1': { value: 2, color: 'yellow-100' }, '2': { value: 4, color: 'orange-200' }, '3': { value: 7, color: 'red-300' }, '4': { value: 10, color: 'red-500' } },
    '4': { '1': { value: 4, color: 'orange-200' }, '2': { value: 7, color: 'red-300' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' } },
    '5': { '1': { value: 7, color: 'red-300' }, '2': { value: 10, color: 'red-500' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' } }
  },
  colorScheme: {
    1: { background: 'bg-blue-100', text: 'text-blue-800', level: 'low' },
    2: { background: 'bg-yellow-100', text: 'text-yellow-800', level: 'low' },
    4: { background: 'bg-orange-200', text: 'text-orange-900', level: 'medium' },
    7: { background: 'bg-red-300', text: 'text-red-900', level: 'high' },
    10: { background: 'bg-red-500', text: 'text-white', level: 'critical' }
  }
};

// 危険因評価マトリックス（発生頻度×重大性）
export const hazardFactorMatrix: EvaluationMatrix = {
  id: 'hazard_frequency_severity',
  name: '危険因評価マトリックス',
  description: '危険事象の発生頻度と重大性によるリスク評価',
  category: 'hazard',
  version: '1.0',
  effectiveDate: '2024-08-20',
  xAxis: {
    name: '重大性',
    description: '危険事象発生時の被害の重大性',
    values: [
      { id: '1', label: '軽微', description: '軽微（応急処置）', order: 1 },
      { id: '2', label: '軽度', description: '軽度（医師の処置）', order: 2 },
      { id: '3', label: '中程度', description: '中程度（入院）', order: 3 },
      { id: '4', label: '重度', description: '重度（後遺症）', order: 4 },
      { id: '5', label: '致命的', description: '致命的（死亡）', order: 5 }
    ]
  },
  yAxis: {
    name: '発生頻度',
    description: '危険事象の発生可能性',
    values: [
      { id: '1', label: 'ほぼない', description: 'ほとんど発生しない', order: 1 },
      { id: '2', label: '稀', description: '稀に発生', order: 2 },
      { id: '3', label: '時々', description: '時々発生', order: 3 },
      { id: '4', label: '頻繁', description: '頻繁に発生', order: 4 },
      { id: '5', label: '常時', description: '常に発生', order: 5 }
    ]
  },
  matrix: {
    '1': { '1': { value: 1, color: 'green-100' }, '2': { value: 2, color: 'yellow-100' }, '3': { value: 4, color: 'orange-200' }, '4': { value: 7, color: 'red-300' }, '5': { value: 10, color: 'red-500' } },
    '2': { '1': { value: 1, color: 'green-100' }, '2': { value: 2, color: 'yellow-100' }, '3': { value: 4, color: 'orange-200' }, '4': { value: 7, color: 'red-300' }, '5': { value: 10, color: 'red-500' } },
    '3': { '1': { value: 2, color: 'yellow-100' }, '2': { value: 4, color: 'orange-200' }, '3': { value: 7, color: 'red-300' }, '4': { value: 10, color: 'red-500' }, '5': { value: 10, color: 'red-500' } },
    '4': { '1': { value: 4, color: 'orange-200' }, '2': { value: 7, color: 'red-300' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' }, '5': { value: 10, color: 'red-500' } },
    '5': { '1': { value: 7, color: 'red-300' }, '2': { value: 10, color: 'red-500' }, '3': { value: 10, color: 'red-500' }, '4': { value: 10, color: 'red-500' }, '5': { value: 10, color: 'red-500' } }
  },
  colorScheme: {
    1: { background: 'bg-green-100', text: 'text-green-800', level: 'low' },
    2: { background: 'bg-yellow-100', text: 'text-yellow-800', level: 'low' },
    4: { background: 'bg-orange-200', text: 'text-orange-900', level: 'medium' },
    7: { background: 'bg-red-300', text: 'text-red-900', level: 'high' },
    10: { background: 'bg-red-500', text: 'text-white', level: 'critical' }
  }
};

// すべてのマトリックスを管理するコレクション
export const evaluationMatrices: Record<string, EvaluationMatrix> = {
  physical: physicalFactorMatrix,
  mental: mentalFactorMatrix,
  environmental: environmentalFactorMatrix,
  hazard: hazardFactorMatrix
};

// マトリックス取得関数
export function getMatrix(category: 'physical' | 'mental' | 'environmental' | 'hazard'): EvaluationMatrix | null {
  return evaluationMatrices[category] || null;
}

// マトリックス一覧取得
export function getAllMatrices(): EvaluationMatrix[] {
  return Object.values(evaluationMatrices);
}

// マトリックス検索
export function findMatrixById(id: string): EvaluationMatrix | null {
  return Object.values(evaluationMatrices).find(matrix => matrix.id === id) || null;
}