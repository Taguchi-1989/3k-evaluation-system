/**
 * ストレージ操作用カスタムフック
 * Electron/Web環境を意識せずに使用可能
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ComprehensiveEvaluation, EvaluationSummary } from '@/types/storage';
import { getStorageInstance } from '@/lib/storage/adapter';

/** useEvaluations フックの戻り値型 */
export interface UseEvaluationsReturn {
  evaluations: ComprehensiveEvaluation[]
  loading: boolean
  error: Error | null
  saveEvaluation: (evaluation: ComprehensiveEvaluation) => Promise<string>
  updateEvaluation: (id: string, updates: Partial<ComprehensiveEvaluation>) => Promise<void>
  deleteEvaluation: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function useEvaluations(): UseEvaluationsReturn {
  const [evaluations, setEvaluations] = useState<ComprehensiveEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storage = getStorageInstance();

  // 全評価を取得
  const loadEvaluations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await storage.getAll();
      setEvaluations(data);
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('評価の読み込みに失敗しました');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  // 初回ロード
  useEffect(() => {
    void loadEvaluations();
  }, [loadEvaluations]);

  // 評価を保存
  const saveEvaluation = useCallback(
    async (evaluation: ComprehensiveEvaluation): Promise<string> => {
      try {
        const id = await storage.save(evaluation);
        await loadEvaluations(); // 再読み込み
        return id;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('評価の保存に失敗しました');
        setError(errorObj);
        throw errorObj;
      }
    },
    [storage, loadEvaluations]
  );

  // 評価を更新
  const updateEvaluation = useCallback(
    async (id: string, updates: Partial<ComprehensiveEvaluation>): Promise<void> => {
      try {
        await storage.update(id, updates);
        await loadEvaluations(); // 再読み込み
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('評価の更新に失敗しました');
        setError(errorObj);
        throw errorObj;
      }
    },
    [storage, loadEvaluations]
  );

  // 評価を削除
  const deleteEvaluation = useCallback(
    async (id: string): Promise<void> => {
      try {
        await storage.delete(id);
        await loadEvaluations(); // 再読み込み
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('評価の削除に失敗しました');
        setError(errorObj);
        throw errorObj;
      }
    },
    [storage, loadEvaluations]
  );

  return {
    evaluations,
    loading,
    error,
    saveEvaluation,
    updateEvaluation,
    deleteEvaluation,
    reload: loadEvaluations,
  };
}

/** useEvaluation フックの戻り値型 */
export interface UseEvaluationReturn {
  evaluation: ComprehensiveEvaluation | null
  loading: boolean
  error: Error | null
}

export function useEvaluation(id: string | null): UseEvaluationReturn {
  const [evaluation, setEvaluation] = useState<ComprehensiveEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storage = getStorageInstance();

  useEffect(() => {
    if (!id) {
      setEvaluation(null);
      setLoading(false);
      return;
    }

    const loadEvaluation = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await storage.get(id);
        setEvaluation(data);
        setError(null);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('評価の読み込みに失敗しました');
        setError(errorObj);
      } finally {
        setLoading(false);
      }
    };

    void loadEvaluation();
  }, [id, storage]);

  return { evaluation, loading, error };
}

/** useEvaluationSummary フックの戻り値型 */
export interface UseEvaluationSummaryReturn {
  summary: EvaluationSummary | null
  loading: boolean
  error: Error | null
  reload: () => Promise<void>
}

export function useEvaluationSummary(): UseEvaluationSummaryReturn {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storage = getStorageInstance();

  const loadSummary = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await storage.getSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('サマリーの読み込みに失敗しました');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return { summary, loading, error, reload: loadSummary };
}
