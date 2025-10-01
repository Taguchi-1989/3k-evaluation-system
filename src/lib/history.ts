/**
 * 評価履歴管理サービス
 * 3K指数評価の変更履歴の保存、取得、比較機能を提供
 */

import type {
  Posture} from '../types/evaluation';

export interface EvaluationHistory {
  id: string;
  factorTable: string;
  factorId: string;
  detailsBefore: Record<string, unknown>;
  scoreBefore: number;
  detailsAfter?: Record<string, unknown>;
  scoreAfter?: number;
  updatedBy: string;
  archivedAt: Date;
}

export interface PostureHistory {
  id: string;
  postureId: string;
  postureNameBefore: string;
  rulaScoreBefore: number;
  owasScoreBefore: number;
  detailsBefore: Record<string, unknown>;
  wristAnglesBefore: Record<string, unknown>;
  postureNameAfter?: string;
  rulaScoreAfter?: number;
  owasScoreAfter?: number;
  detailsAfter?: Record<string, unknown>;
  wristAnglesAfter?: Record<string, unknown>;
  updatedBy: string;
  archivedAt: Date;
}

export interface HistoryComparison {
  field: string;
  beforeValue: unknown;
  afterValue: unknown;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  impact: 'high' | 'medium' | 'low';
}

export interface VersionComparison {
  evaluationId: string;
  fromVersion: Date;
  toVersion: Date;
  changes: HistoryComparison[];
  scoreChanges: {
    physical?: { before: number; after: number };
    mental?: { before: number; after: number };
    environmental?: { before: number; after: number };
    hazard?: { before: number; after: number };
    final?: { before: number; after: number };
  };
  summary: {
    totalChanges: number;
    significantChanges: number;
    scoreImprovement: boolean;
  };
}

export class EvaluationHistoryService {
  private static instance: EvaluationHistoryService;
  private histories: Map<string, EvaluationHistory[]> = new Map();
  private postureHistories: Map<string, PostureHistory[]> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): EvaluationHistoryService {
    if (!EvaluationHistoryService.instance) {
      EvaluationHistoryService.instance = new EvaluationHistoryService();
    }
    return EvaluationHistoryService.instance;
  }

  /**
   * 評価変更履歴を保存
   */
  public async saveHistory(
    factorTable: string,
    factorId: string,
    detailsBefore: Record<string, unknown>,
    scoreBefore: number,
    detailsAfter: Record<string, unknown>,
    scoreAfter: number,
    updatedBy: string
  ): Promise<string> {
    const historyId = this.generateId();
    const history: EvaluationHistory = {
      id: historyId,
      factorTable,
      factorId,
      detailsBefore,
      scoreBefore,
      detailsAfter,
      scoreAfter,
      updatedBy,
      archivedAt: new Date()
    };

    // メモリ内ストレージ（実際の実装ではデータベースに保存）
    if (!this.histories.has(factorId)) {
      this.histories.set(factorId, []);
    }
    this.histories.get(factorId)!.push(history);

    return historyId;
  }

  /**
   * 姿勢変更履歴を保存
   */
  public async savePostureHistory(
    postureId: string,
    postureBefore: Partial<Posture>,
    postureAfter: Partial<Posture>,
    updatedBy: string
  ): Promise<string> {
    const historyId = this.generateId();
    const history: PostureHistory = {
      id: historyId,
      postureId,
      postureNameBefore: postureBefore.postureName || '',
      rulaScoreBefore: postureBefore.rulaScore || 0,
      owasScoreBefore: postureBefore.owasCategory || 0,
      detailsBefore: postureBefore.details || {},
      wristAnglesBefore: postureBefore.wristAngles || {},
      postureNameAfter: postureAfter.postureName,
      rulaScoreAfter: postureAfter.rulaScore,
      owasScoreAfter: postureAfter.owasCategory,
      detailsAfter: postureAfter.details,
      wristAnglesAfter: postureAfter.wristAngles,
      updatedBy,
      archivedAt: new Date()
    };

    // メモリ内ストレージ
    if (!this.postureHistories.has(postureId)) {
      this.postureHistories.set(postureId, []);
    }
    this.postureHistories.get(postureId)!.push(history);

    return historyId;
  }

  /**
   * 特定因子の履歴を取得
   */
  public async getHistory(factorId: string): Promise<EvaluationHistory[]> {
    return this.histories.get(factorId) || [];
  }

  /**
   * 特定姿勢の履歴を取得
   */
  public async getPostureHistory(postureId: string): Promise<PostureHistory[]> {
    return this.postureHistories.get(postureId) || [];
  }

  /**
   * 評価全体の履歴を取得（日付範囲指定）
   */
  public async getEvaluationHistory(
    evaluationId: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Promise<EvaluationHistory[]> {
    const allHistories: EvaluationHistory[] = [];
    
    // 全ての因子履歴を収集
    for (const histories of this.histories.values()) {
      allHistories.push(...histories);
    }

    let filteredHistories = allHistories;

    // 日付フィルタリング
    if (fromDate) {
      filteredHistories = filteredHistories.filter(h => h.archivedAt >= fromDate);
    }
    if (toDate) {
      filteredHistories = filteredHistories.filter(h => h.archivedAt <= toDate);
    }

    // 日付順でソート
    return filteredHistories.sort((a, b) => b.archivedAt.getTime() - a.archivedAt.getTime());
  }

  /**
   * バージョン間の比較を実行
   */
  public async compareVersions(
    evaluationId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<VersionComparison> {
    const histories = await this.getEvaluationHistory(evaluationId, fromDate, toDate);
    const changes: HistoryComparison[] = [];
    const scoreChanges: VersionComparison['scoreChanges'] = {};

    for (const history of histories) {
      if (history.detailsAfter) {
        const fieldChanges = this.compareObjects(
          history.detailsBefore,
          history.detailsAfter
        );
        changes.push(...fieldChanges);
      }

      // スコア変更の記録
      if (history.scoreBefore !== history.scoreAfter && history.scoreAfter !== undefined) {
        const factorType = this.getFactorTypeFromTable(history.factorTable);
        if (factorType) {
          scoreChanges[factorType] = {
            before: history.scoreBefore,
            after: history.scoreAfter
          };
        }
      }
    }

    // 変更サマリー生成
    const significantChanges = changes.filter(c => c.impact === 'high').length;
    const scoreImprovement = this.calculateScoreImprovement(scoreChanges);

    return {
      evaluationId,
      fromVersion: fromDate,
      toVersion: toDate,
      changes,
      scoreChanges,
      summary: {
        totalChanges: changes.length,
        significantChanges,
        scoreImprovement
      }
    };
  }

  /**
   * 履歴の統計情報を取得
   */
  public async getHistoryStatistics(evaluationId: string): Promise<{
    totalChanges: number;
    changesByFactor: Record<string, number>;
    changesByUser: Record<string, number>;
    lastModified: Date | null;
    mostActiveFactors: string[];
  }> {
    const histories = await this.getEvaluationHistory(evaluationId);
    
    const changesByFactor: Record<string, number> = {};
    const changesByUser: Record<string, number> = {};
    let lastModified: Date | null = null;

    for (const history of histories) {
      // 因子別変更回数
      changesByFactor[history.factorTable] = 
        (changesByFactor[history.factorTable] || 0) + 1;

      // ユーザー別変更回数
      changesByUser[history.updatedBy] = 
        (changesByUser[history.updatedBy] || 0) + 1;

      // 最終更新日時
      if (!lastModified || history.archivedAt > lastModified) {
        lastModified = history.archivedAt;
      }
    }

    // 最も活発な因子（変更回数順）
    const mostActiveFactors = Object.entries(changesByFactor)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([factor]) => factor);

    return {
      totalChanges: histories.length,
      changesByFactor,
      changesByUser,
      lastModified,
      mostActiveFactors
    };
  }

  /**
   * 変更履歴をエクスポート（CSV形式）
   */
  public async exportHistory(evaluationId: string): Promise<string> {
    const histories = await this.getEvaluationHistory(evaluationId);
    
    const csvHeader = [
      'Date',
      'Factor',
      'Score Before',
      'Score After',
      'Updated By',
      'Change Summary'
    ].join(',');

    const csvRows = histories.map(history => {
      const changeSummary = this.generateChangeSummary(history);
      return [
        history.archivedAt.toISOString(),
        history.factorTable,
        history.scoreBefore,
        history.scoreAfter || '',
        history.updatedBy,
        `"${changeSummary}"`
      ].join(',');
    });

    return [csvHeader, ...csvRows].join('\n');
  }

  /**
   * 古い履歴をクリーンアップ（保持期間外のデータを削除）
   */
  public async cleanupOldHistory(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;

    // 評価履歴のクリーンアップ
    for (const [factorId, histories] of this.histories.entries()) {
      const filteredHistories = histories.filter(h => h.archivedAt >= cutoffDate);
      const deleted = histories.length - filteredHistories.length;
      deletedCount += deleted;
      
      if (filteredHistories.length === 0) {
        this.histories.delete(factorId);
      } else {
        this.histories.set(factorId, filteredHistories);
      }
    }

    // 姿勢履歴のクリーンアップ
    for (const [postureId, histories] of this.postureHistories.entries()) {
      const filteredHistories = histories.filter(h => h.archivedAt >= cutoffDate);
      const deleted = histories.length - filteredHistories.length;
      deletedCount += deleted;
      
      if (filteredHistories.length === 0) {
        this.postureHistories.delete(postureId);
      } else {
        this.postureHistories.set(postureId, filteredHistories);
      }
    }

    return deletedCount;
  }

  // プライベートヘルパーメソッド

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private compareObjects(
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): HistoryComparison[] {
    const changes: HistoryComparison[] = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      const beforeValue: unknown = before[key]
      const afterValue: unknown = after[key]

      if (beforeValue === undefined && afterValue !== undefined) {
        changes.push({
          field: key,
          beforeValue: null,
          afterValue,
          changeType: 'added',
          impact: this.assessChangeImpact(key, beforeValue, afterValue)
        });
      } else if (beforeValue !== undefined && afterValue === undefined) {
        changes.push({
          field: key,
          beforeValue,
          afterValue: null,
          changeType: 'removed',
          impact: this.assessChangeImpact(key, beforeValue, afterValue)
        });
      } else if (beforeValue !== afterValue) {
        changes.push({
          field: key,
          beforeValue,
          afterValue,
          changeType: 'modified',
          impact: this.assessChangeImpact(key, beforeValue, afterValue)
        });
      }
    }

    return changes;
  }

  private assessChangeImpact(
    field: string,
    beforeValue: unknown,
    afterValue: unknown
  ): 'high' | 'medium' | 'low' {
    // スコア関連の変更は高影響
    if (field.includes('score') || field.includes('Score')) {
      return 'high';
    }

    // 重量、濃度、時間などの数値的変更
    if (typeof beforeValue === 'number' && typeof afterValue === 'number') {
      const changeRatio = Math.abs(afterValue - beforeValue) / Math.abs(beforeValue || 1);
      if (changeRatio > 0.5) return 'high';
      if (changeRatio > 0.2) return 'medium';
      return 'low';
    }

    // テキスト変更（レベル変更など）
    if (typeof beforeValue === 'string' && typeof afterValue === 'string') {
      const criticalTerms = ['きつい', '高い', '危険', '重要'];
      const isCritical = criticalTerms.some(term => 
        beforeValue.includes(term) || afterValue.includes(term)
      );
      return isCritical ? 'high' : 'medium';
    }

    return 'low';
  }

  private getFactorTypeFromTable(tableName: string): keyof VersionComparison['scoreChanges'] | null {
    if (tableName.includes('physical')) return 'physical';
    if (tableName.includes('mental')) return 'mental';
    if (tableName.includes('environmental')) return 'environmental';
    if (tableName.includes('hazard')) return 'hazard';
    return null;
  }

  private calculateScoreImprovement(scoreChanges: VersionComparison['scoreChanges']): boolean {
    const improvements = Object.values(scoreChanges).filter(change => 
      change && change.after < change.before // スコアが下がった（改善）
    );
    const deteriorations = Object.values(scoreChanges).filter(change => 
      change && change.after > change.before // スコアが上がった（悪化）
    );

    return improvements.length > deteriorations.length;
  }

  private generateChangeSummary(history: EvaluationHistory): string {
    if (!history.detailsAfter) {
      return 'Data archived';
    }

    const changes = this.compareObjects(history.detailsBefore, history.detailsAfter);
    const significantChanges = changes.filter(c => c.impact === 'high');

    if (significantChanges.length > 0) {
      return significantChanges.map(c => `${c.field}: ${c.beforeValue} → ${c.afterValue}`).join('; ');
    }

    return `${changes.length} field(s) updated`;
  }
}

// シングルトンインスタンスをエクスポート
export const historyService = EvaluationHistoryService.getInstance();