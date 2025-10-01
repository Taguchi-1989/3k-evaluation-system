/**
 * Electron Storage実装
 * Electron版（オフライン）で使用
 * electron-storeを使用したローカルファイル永続化
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComprehensiveEvaluation = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvaluationSummary = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IEvaluationStorage = any;

// Window型拡張
declare global {
  interface Window {
    electron?: {
      store: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
      };
    };
  }
}

export class ElectronStorage implements IEvaluationStorage {
  private readonly STORAGE_KEY = 'evaluations';

  private async getEvaluations(): Promise<ComprehensiveEvaluation[]> {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    const data = await window.electron.store.get(this.STORAGE_KEY);
    if (!data) return [];

    // Date型を復元
    return data.map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      physical: { ...e.physical, evaluatedAt: new Date(e.physical.evaluatedAt) },
      mental: { ...e.mental, evaluatedAt: new Date(e.mental.evaluatedAt) },
      environmental: { ...e.environmental, evaluatedAt: new Date(e.environmental.evaluatedAt) },
      hazard: { ...e.hazard, evaluatedAt: new Date(e.hazard.evaluatedAt) },
      workTime: { ...e.workTime, evaluatedAt: new Date(e.workTime.evaluatedAt) },
    }));
  }

  private async saveEvaluations(evaluations: ComprehensiveEvaluation[]): Promise<void> {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }
    await window.electron.store.set(this.STORAGE_KEY, evaluations);
  }

  async save(evaluation: ComprehensiveEvaluation): Promise<string> {
    const evaluations = await this.getEvaluations();
    const id = evaluation.id || this.generateId();
    const newEvaluation = {
      ...evaluation,
      id,
      createdAt: evaluation.createdAt || new Date(),
      updatedAt: new Date(),
    };

    evaluations.push(newEvaluation);
    await this.saveEvaluations(evaluations);

    return id;
  }

  async get(id: string): Promise<ComprehensiveEvaluation | null> {
    const evaluations = await this.getEvaluations();
    return evaluations.find(e => e.id === id) || null;
  }

  async getAll(): Promise<ComprehensiveEvaluation[]> {
    return this.getEvaluations();
  }

  async update(id: string, updates: Partial<ComprehensiveEvaluation>): Promise<void> {
    const evaluations = await this.getEvaluations();
    const index = evaluations.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    evaluations[index] = {
      ...evaluations[index],
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveEvaluations(evaluations);
  }

  async delete(id: string): Promise<void> {
    const evaluations = await this.getEvaluations();
    const filtered = evaluations.filter(e => e.id !== id);

    if (filtered.length === evaluations.length) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    await this.saveEvaluations(filtered);
  }

  async getSummary(): Promise<EvaluationSummary> {
    const evaluations = await this.getEvaluations();

    const completed = evaluations.filter(e => e.status === 'completed').length;
    const inProgress = evaluations.filter(e => e.status === 'in_progress').length;
    const notStarted = evaluations.filter(e => e.status === 'not_started').length;

    const totalScore = evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0);
    const averageScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;

    // 最新5件を取得
    const latestEvaluations = [...evaluations]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    return {
      total: evaluations.length,
      completed,
      inProgress,
      notStarted,
      averageScore,
      latestEvaluations,
    };
  }

  private generateId(): string {
    return `eval_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}