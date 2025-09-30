// アプリケーション定数
export const EVALUATION_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const FACTOR_TYPES = {
  PHYSICAL: 'physical',
  MENTAL: 'mental',
  ENVIRONMENTAL: 'environmental',
  HAZARD: 'hazard',
  WORK_TIME: 'work_time',
} as const;

export const SCORE_RANGES = {
  MIN: 1,
  MAX: 10,
} as const;

export const INDEX_3K = {
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
} as const;

export const TIME_CATEGORIES = {
  A: { symbol: 'a', description: '1時間未満', factor: 0.5 },
  B: { symbol: 'b', description: '1-4時間', factor: 0.7 },
  C: { symbol: 'c', description: '4-8時間', factor: 1.0 },
  D: { symbol: 'd', description: '8時間以上', factor: 1.5 },
} as const;

export const RULA_LEVELS = {
  ACCEPTABLE: { range: [1, 2], description: '許容可能', color: 'green' },
  INVESTIGATE: { range: [3, 4], description: '調査必要', color: 'yellow' },
  CHANGE_SOON: { range: [5, 6], description: '速やかに改善', color: 'orange' },
  CHANGE_IMMEDIATELY: { range: [7, 7], description: '即座に改善', color: 'red' },
} as const;

export const OWAS_CATEGORIES = {
  1: { description: '作業してよい', color: 'green' },
  2: { description: '要改善', color: 'yellow' },
  3: { description: '早期に要改善', color: 'orange' },
  4: { description: '即時要改善', color: 'red' },
} as const;

export const RISK_LEVELS = {
  LOW: { range: [1, 4], description: '低リスク', color: 'green', action: '現状維持' },
  MEDIUM: { range: [5, 9], description: '中リスク', color: 'yellow', action: '注意・監視' },
  HIGH: { range: [10, 15], description: '高リスク', color: 'orange', action: '改善必要' },
  CRITICAL: { range: [16, 25], description: '極高リスク', color: 'red', action: '即時対応' },
} as const;

export const FILE_TYPES = {
  PHOTO: 'photo',
  SDS: 'sds',
  REPORT: 'report',
  ANALYSIS: 'analysis',
} as const;

export const API_ENDPOINTS = {
  EVALUATIONS: '/api/evaluations',
  STANDARDS: '/api/standards',
  CALCULATE: '/api/calculate',
  UPLOAD: '/api/upload',
} as const;

export const VALIDATION_RULES = {
  WORK_NAME: {
    minLength: 1,
    maxLength: 100,
  },
  FACTORY_NAME: {
    minLength: 1,
    maxLength: 100,
  },
  PROCESS_NAME: {
    minLength: 1,
    maxLength: 100,
  },
  SCORE: {
    min: 1,
    max: 10,
  },
} as const;