/**
 * LocalStorage実装
 * Web版（Vercel）で使用
 */

import type { Evaluation } from '@/types/evaluation'

// Legacy type aliases for backward compatibility
type ComprehensiveEvaluation = Evaluation & {
  id: string
  createdAt: Date
  updatedAt: Date
  physical?: { evaluatedAt: Date; [key: string]: unknown }
  mental?: { evaluatedAt: Date; [key: string]: unknown }
  environmental?: { evaluatedAt: Date; [key: string]: unknown }
  hazard?: { evaluatedAt: Date; [key: string]: unknown }
  workTime?: { evaluatedAt: Date; [key: string]: unknown }
  totalScore?: number
  status?: 'completed' | 'in_progress' | 'not_started'
}

interface EvaluationSummary {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  averageScore: number
  latestEvaluations: ComprehensiveEvaluation[]
}

interface IEvaluationStorage {
  save(evaluation: ComprehensiveEvaluation): Promise<string>
  get(id: string): Promise<ComprehensiveEvaluation | null>
  getAll(): Promise<ComprehensiveEvaluation[]>
  update(id: string, updates: Partial<ComprehensiveEvaluation>): Promise<void>
  delete(id: string): Promise<void>
  getSummary(): Promise<EvaluationSummary>
}

const STORAGE_KEY = '3k-evaluations';

export class LocalStorage implements IEvaluationStorage {
  private getEvaluations(): ComprehensiveEvaluation[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data) as Array<Record<string, unknown>>;
      // Date型を復元
      return parsed.map((e): ComprehensiveEvaluation => ({
        ...(e as Evaluation),
        id: (e.id as string) || '',
        createdAt: new Date(e.createdAt as string),
        updatedAt: new Date(e.updatedAt as string),
        physical: e.physical ? { ...(e.physical as Record<string, unknown>), evaluatedAt: new Date((e.physical as { evaluatedAt: string }).evaluatedAt) } : undefined,
        mental: e.mental ? { ...(e.mental as Record<string, unknown>), evaluatedAt: new Date((e.mental as { evaluatedAt: string }).evaluatedAt) } : undefined,
        environmental: e.environmental ? { ...(e.environmental as Record<string, unknown>), evaluatedAt: new Date((e.environmental as { evaluatedAt: string }).evaluatedAt) } : undefined,
        hazard: e.hazard ? { ...(e.hazard as Record<string, unknown>), evaluatedAt: new Date((e.hazard as { evaluatedAt: string }).evaluatedAt) } : undefined,
        workTime: e.workTime ? { ...(e.workTime as Record<string, unknown>), evaluatedAt: new Date((e.workTime as { evaluatedAt: string }).evaluatedAt) } : undefined,
        totalScore: e.totalScore as number | undefined,
        status: e.status as 'completed' | 'in_progress' | 'not_started' | undefined,
      }));
    } catch (error) {
      console.error('Failed to parse evaluations from localStorage:', error);
      return [];
    }
  }

  private saveEvaluations(evaluations: ComprehensiveEvaluation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
  }

  async save(evaluation: ComprehensiveEvaluation): Promise<string> {
    const evaluations = this.getEvaluations();
    const id = evaluation.id || this.generateId();
    const newEvaluation = {
      ...evaluation,
      id,
      createdAt: evaluation.createdAt || new Date(),
      updatedAt: new Date(),
    };

    evaluations.push(newEvaluation);
    this.saveEvaluations(evaluations);

    return id;
  }

  async get(id: string): Promise<ComprehensiveEvaluation | null> {
    const evaluations = this.getEvaluations();
    return evaluations.find(e => e.id === id) || null;
  }

  async getAll(): Promise<ComprehensiveEvaluation[]> {
    return this.getEvaluations();
  }

  async update(id: string, updates: Partial<ComprehensiveEvaluation>): Promise<void> {
    const evaluations = this.getEvaluations();
    const index = evaluations.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    evaluations[index] = {
      ...evaluations[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveEvaluations(evaluations);
  }

  async delete(id: string): Promise<void> {
    const evaluations = this.getEvaluations();
    const filtered = evaluations.filter(e => e.id !== id);

    if (filtered.length === evaluations.length) {
      throw new Error(`Evaluation with id ${id} not found`);
    }

    this.saveEvaluations(filtered);
  }

  async getSummary(): Promise<EvaluationSummary> {
    const evaluations = this.getEvaluations();

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