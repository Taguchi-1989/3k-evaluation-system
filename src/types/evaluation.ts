/**
 * 3K評価システム - 型定義
 *
 * 3K: きつい（Kitsui）・汚い（Kitanai）・危険（Kiken）
 */

// ========================================
// 基本型定義
// ========================================

/**
 * 評価レベル（1-5段階）
 */
export type EvaluationLevel = 1 | 2 | 3 | 4 | 5;

/**
 * 評価ステータス
 */
export type EvaluationStatus = 'not_started' | 'in_progress' | 'completed';

// ========================================
// 肉体因子評価（Physical Factor）
// ========================================

export interface PhysicalEvaluation {
  id?: string;
  // 重量物取扱い（1: 軽い～5: 非常に重い）
  weightHandling: EvaluationLevel;
  // 作業姿勢（1: 楽な姿勢～5: 無理な姿勢）
  workPosture: EvaluationLevel;
  // 反復動作（1: 少ない～5: 非常に多い）
  repetitiveMotion: EvaluationLevel;
  // 振動暴露（1: なし～5: 非常に強い）
  vibrationExposure: EvaluationLevel;
  // 温度環境（1: 快適～5: 極端）
  temperatureEnvironment: EvaluationLevel;
  // メモ
  notes?: string;
  // 評価日時
  evaluatedAt: Date;
}

// ========================================
// 精神因子評価（Mental Factor）
// ========================================

export interface MentalEvaluation {
  id?: string;
  // 時間的プレッシャー（1: 少ない～5: 非常に高い）
  timePressure: EvaluationLevel;
  // 精神的負荷（1: 軽い～5: 非常に重い）
  mentalLoad: EvaluationLevel;
  // 対人ストレス（1: 少ない～5: 非常に高い）
  interpersonalStress: EvaluationLevel;
  // 責任の重さ（1: 軽い～5: 非常に重い）
  responsibility: EvaluationLevel;
  // 単調さ（1: 変化あり～5: 非常に単調）
  monotony: EvaluationLevel;
  // メモ
  notes?: string;
  // 評価日時
  evaluatedAt: Date;
}

// ========================================
// 環境因子評価（Environmental Factor）
// ========================================

export interface EnvironmentalEvaluation {
  id?: string;
  // 騒音レベル（1: 静か～5: 非常にうるさい）
  noiseLevel: EvaluationLevel;
  // 照明状態（1: 良好～5: 非常に悪い）
  lightingCondition: EvaluationLevel;
  // 空気清浄度（1: 清潔～5: 非常に汚い）
  airQuality: EvaluationLevel;
  // 作業スペース（1: 広い～5: 非常に狭い）
  workSpace: EvaluationLevel;
  // 衛生状態（1: 清潔～5: 非常に不潔）
  hygiene: EvaluationLevel;
  // メモ
  notes?: string;
  // 評価日時
  evaluatedAt: Date;
}

// ========================================
// 危険因子評価（Hazard Factor）
// ========================================

export interface HazardEvaluation {
  id?: string;
  // 機械的危険（1: 低い～5: 非常に高い）
  mechanicalHazard: EvaluationLevel;
  // 化学物質暴露（1: なし～5: 非常に高い）
  chemicalExposure: EvaluationLevel;
  // 転倒・転落リスク（1: 低い～5: 非常に高い）
  fallRisk: EvaluationLevel;
  // 火災・爆発リスク（1: 低い～5: 非常に高い）
  fireExplosionRisk: EvaluationLevel;
  // 電気的危険（1: 低い～5: 非常に高い）
  electricalHazard: EvaluationLevel;
  // メモ
  notes?: string;
  // 評価日時
  evaluatedAt: Date;
}

// ========================================
// 作業時間評価（Work Time Factor）
// ========================================

export interface WorkTimeEvaluation {
  id?: string;
  // 労働時間（時間/日）
  dailyWorkHours: number;
  // 残業時間（時間/月）
  overtimeHours: number;
  // 休憩時間の充足度（1: 十分～5: 不足）
  breakAdequacy: EvaluationLevel;
  // 夜勤頻度（1: なし～5: 非常に多い）
  nightShiftFrequency: EvaluationLevel;
  // 休日数（日/月）
  daysOffPerMonth: number;
  // メモ
  notes?: string;
  // 評価日時
  evaluatedAt: Date;
}

// ========================================
// 総合評価
// ========================================

export interface ComprehensiveEvaluation {
  id?: string;
  // 職場名
  workplaceName: string;
  // 職種
  occupation: string;
  // 各因子評価
  physical: PhysicalEvaluation;
  mental: MentalEvaluation;
  environmental: EnvironmentalEvaluation;
  hazard: HazardEvaluation;
  workTime: WorkTimeEvaluation;
  // 総合スコア（計算値）
  totalScore?: number;
  // 3K分類（計算値）
  classification?: '良好' | '普通' | '注意' | '改善要' | '危険';
  // 評価ステータス
  status: EvaluationStatus;
  // 作成日時
  createdAt: Date;
  // 更新日時
  updatedAt: Date;
}

// ========================================
// 評価サマリー（ダッシュボード用）
// ========================================

export interface EvaluationSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageScore: number;
  latestEvaluations: ComprehensiveEvaluation[];
}

// ========================================
// ストレージインターフェース
// ========================================

export interface IEvaluationStorage {
  // 評価の保存
  save(evaluation: ComprehensiveEvaluation): Promise<string>;
  // 評価の取得
  get(id: string): Promise<ComprehensiveEvaluation | null>;
  // 全評価の取得
  getAll(): Promise<ComprehensiveEvaluation[]>;
  // 評価の更新
  update(id: string, evaluation: Partial<ComprehensiveEvaluation>): Promise<void>;
  // 評価の削除
  delete(id: string): Promise<void>;
  // サマリー取得
  getSummary(): Promise<EvaluationSummary>;
}