// 評価システムの型定義
export interface Evaluation {
  id: string;
  workName: string;
  factoryName: string;
  processName: string;
  mainPhotoUrl?: string;
  workHearing?: string;
  remarks?: string;
  finalScoreKitsusa: number;
  finalScore3K: string;
  status: EvaluationStatus;
  creatorId: string;
  checkerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EvaluationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface PhysicalFactor {
  id: string;
  evaluationId: string;
  score: number;
  details: PhysicalDetails;
  strengthScore: number;
  durationScore: number;
  postureEvaluation: string;
}

export interface PhysicalDetails {
  targetWeight?: {
    bothHands?: { kg: number; percentage: number };
    singleHand?: { kg: number; percentage: number };
  };
  muscleForce?: { kg: number; percentage: number };
  protectiveGear?: { percentage: number };
  eyeStrain?: { percentage: number };
  manualInput?: {
    strength: string;
    duration: string;
  };
  checkboxes?: {
    weightBoth: boolean;
    weightSingle: boolean;
    muscle: boolean;
    gear: boolean;
    eye: boolean;
  };
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

export interface MentalFactor {
  id: string;
  evaluationId: string;
  score: number;
  details: MentalDetails;
  strengthScore: number;
  durationScore: number;
}

export interface MentalDetails {
  workQuality?: {
    failure?: { level: string; duration: string };
    concentration?: { level: string; duration: string };
    cognitiveLoad?: { level: string; duration: string };
    emotionalBurden?: { level: string; duration: string };
    skillUtilization?: { level: string; duration: string };
    workControl?: { level: string; duration: string };
  };
  // 厚生労働省基準準拠の心理的負荷評価
  psychologicalStress?: {
    workloadChanges?: PsychologicalStressEvent[];
    harassmentEvents?: PsychologicalStressEvent[];
    interpersonalIssues?: PsychologicalStressEvent[];
    workResponsibility?: PsychologicalStressEvent[];
    workEnvironmentChanges?: PsychologicalStressEvent[];
    accidentTrauma?: PsychologicalStressEvent[];
  };
  // 時間外労働評価
  overtimeWork?: {
    monthlyOvertimeHours: number;
    consecutiveWorkDays: number;
    nightShiftFrequency: number;
  };
  // ハラスメント評価
  harassment?: {
    powerHarassment?: HarassmentAssessment;
    sexualHarassment?: HarassmentAssessment;
    workplaceBullying?: HarassmentAssessment;
  };
  manualInput?: {
    strength: string;
    duration: string;
  };
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

// 厚生労働省「心理的負荷による精神障害の認定基準」準拠
export interface PsychologicalStressEvent {
  eventType: string; // 出来事の種類
  eventDescription: string; // 具体的な出来事
  startDate: Date; // 発生日
  duration: number; // 継続期間（日数）
  stressIntensity: 'strong' | 'moderate' | 'weak'; // 厚労省基準：強・中・弱
  fiveStageScore: number; // 5段階評価：1-5点（5点=最高リスク）
  legalBasis: string; // 法的根拠（別表1の項目番号等）
  mitigatingFactors?: string[]; // 緩衝要因
  aggravatingFactors?: string[]; // 悪化要因
}

// ハラスメント評価
export interface HarassmentAssessment {
  occurred: boolean; // 発生有無
  frequency: 'single' | 'occasional' | 'frequent' | 'continuous'; // 頻度
  severity: 'mild' | 'moderate' | 'severe'; // 重篤度
  duration: number; // 継続期間（日数）
  reportedToAuthority: boolean; // 当局への報告有無
  witnessesPresent: boolean; // 目撃者の有無
  organizationalResponse: string; // 組織の対応
  stressIntensity: 'strong' | 'moderate' | 'weak'; // 心理的負荷強度
  fiveStageScore: number; // 5段階評価スコア
}

export interface EnvironmentalFactor {
  id: string;
  evaluationId: string;
  score: number;
  details: EnvironmentalDetails;
  sdsUrl?: string;
}

export interface EnvironmentalDetails {
  substances?: EnvironmentalSubstance[];
  temperature?: number;
  noise?: number;
  dust?: number;
  vibration?: number;
  contamination?: number;
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

export interface EnvironmentalSubstance {
  id: string;
  environmentalFactorId: string;
  substanceType: string;
  substanceName: string;
  permissibleConcentration: number;
  concentrationUnit: string;
  environmentalConcentration: number;
  pollutionLevel?: number;
  thresholdValue: number;
  measuredValue: number;
  measurementUnit: string;
  substanceDetails: Record<string, unknown>;
  isActive: boolean;
}

export interface HazardFactor {
  id: string;
  evaluationId: string;
  score: number;
  details: HazardDetails;
  ohsmsUrl?: string;
}

export interface HazardDetails {
  hazardEvents?: HazardEvent[];
  // 労災履歴・安全管理ストレス要素（危険因子内で評価）
  accidentHistory?: AccidentHistoryAssessment;
  safetyManagementStress?: SafetyManagementStressAssessment;
  // 現在進行中のリスク・再発可能性評価
  ongoingRisks?: OngoingRiskAssessment[];
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

export interface HazardEvent {
  id: string;
  hazardFactorId: string;
  hazardEvent: string;
  encounterFrequency: number;
  dangerPossibility: number;
  occurrencePossibility: number;
  harmSeverity: number;
  riskPoint: number;
  riskLevel: string;
}

// 労災履歴評価（危険因子軸で評価）
export interface AccidentHistoryAssessment {
  hasAccidentHistory: boolean; // 労災履歴の有無
  accidentTypes: AccidentHistoryEvent[]; // 過去の労災事故詳細
  totalAccidentCount: number; // 総事故件数
  recentAccidentDate?: Date; // 最新事故日
  recurrenceRisk: 'low' | 'moderate' | 'high' | 'critical'; // 再発リスク
  fiveStageScore: number; // 5段階評価：1-5点（5点=最高リスク）
  mitigationMeasures?: string[]; // 実施済み対策
  remainingRisks?: string[]; // 未解消のリスク
}

// 労災事故履歴詳細
export interface AccidentHistoryEvent {
  accidentDate: Date; // 事故発生日
  accidentType: string; // 事故の種類
  severity: 'minor' | 'moderate' | 'serious' | 'fatal'; // 重篤度
  rootCause: string; // 根本原因
  preventiveMeasures: string[]; // 実施済み防止策
  effectiveness: 'ineffective' | 'partial' | 'effective' | 'highly_effective'; // 防止策の効果
  isRecurring: boolean; // 同種事故の再発有無
}

// 安全管理ストレス評価（危険因子軸で評価）
export interface SafetyManagementStressAssessment {
  managementGaps: SafetyGapAssessment[]; // 安全管理の欠陥
  complianceLevel: 'non_compliant' | 'partially_compliant' | 'compliant' | 'excellent'; // 法令順守度
  safetyTrainingAdequacy: 'inadequate' | 'minimal' | 'adequate' | 'excellent'; // 安全教育充実度
  incidentReportingSystem: 'none' | 'basic' | 'adequate' | 'comprehensive'; // インシデント報告制度
  riskAssessmentFrequency: 'never' | 'annual' | 'semi_annual' | 'quarterly' | 'monthly'; // リスク評価頻度
  fiveStageScore: number; // 5段階評価：1-5点（5点=最高リスク）
  urgentImprovements: string[]; // 緊急改善が必要な項目
}

// 安全管理欠陥評価
export interface SafetyGapAssessment {
  gapType: string; // 欠陥の種類
  description: string; // 具体的な内容
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'; // リスクレベル
  legalRequirement: boolean; // 法的要求事項か
  timeToCorrect: number; // 是正に要する期間（日数）
}

// 現在進行中のリスク評価（未解消リスク・再発可能性）
export interface OngoingRiskAssessment {
  riskId: string; // リスクID
  riskDescription: string; // リスクの内容
  originDate: Date; // 発生・発見日
  riskCategory: 'equipment' | 'environment' | 'human_factor' | 'process' | 'external'; // リスク分類
  currentStatus: 'unaddressed' | 'in_progress' | 'partially_mitigated' | 'monitored'; // 現在の状況
  recurrenceProbability: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'; // 再発確率
  potentialImpact: 'minor' | 'moderate' | 'major' | 'catastrophic'; // 潜在的影響度
  fiveStageScore: number; // 5段階評価：1-5点（5点=最高リスク）
  mitigationActions: string[]; // 実施済み緩和策
  monitoringFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'; // 監視頻度
  escalationTriggers: string[]; // エスカレーション条件
}

export interface WorkTimeFactor {
  id: string;
  evaluationId: string;
  workHours: number;
  timeCategory: string;
  workerDetails: Record<string, unknown>;
}

export interface Posture {
  id: string;
  physicalFactorId: string;
  postureName: string;
  photoUrl?: string;
  details: Record<string, unknown>;
  rulaScore: number;
  owasCategory: number;
  wristAngles: Record<string, unknown>;
}

export interface PostureEvaluation {
  id: string;
  postureId: string;
  evaluationType: string;
  evaluationData: Record<string, unknown>;
  analysisFileUrl?: string;
}

export interface EvaluationStandard {
  id: string;
  standardCategory: string;
  standardType: string;
  substanceName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  standardValues: Record<string, any>;
  unit: string;
  referenceSource: string;
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  version: number;
}

export interface CalculationRule {
  ruleName: string;
  version: number;
  ruleData: Record<string, unknown>;
  isActive: boolean;
  ruleType: string;
  referenceUrl?: string;
  description?: string;
  createdAt: Date;
}

// フォーム用の型
export interface EvaluationForm {
  workName: string;
  factoryName: string;
  processName: string;
  workHearing?: string;
  remarks?: string;
  physicalFactor?: Partial<PhysicalDetails>;
  mentalFactor?: Partial<MentalDetails>;
  environmentalFactor?: Partial<EnvironmentalDetails>;
  hazardFactor?: Partial<HazardDetails>;
  workTime?: {
    duration: number;
    category: string;
  };
}

// API レスポンス用の型
export interface EvaluationResponse {
  evaluation: Evaluation;
  physicalFactor?: PhysicalFactor;
  mentalFactor?: MentalFactor;
  environmentalFactor?: EnvironmentalFactor;
  hazardFactor?: HazardFactor;
  workTimeFactor?: WorkTimeFactor;
  postures?: Posture[];
  uploadedFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  evaluationId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  uploadedAt: Date;
}