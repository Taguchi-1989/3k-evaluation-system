/**
 * ストレージ操作用カスタムフック
 * Electron/Web環境を意識せずに使用可能
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComprehensiveEvaluation = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvaluationSummary = any;
import { getStorageInstance } from '@/lib/storage/adapter';

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<ComprehensiveEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storage = getStorageInstance();

  // 全評価を取得
  const loadEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storage.getAll();
      setEvaluations(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  // 初回ロード
  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  // 評価を保存
  const saveEvaluation = useCallback(
    async (evaluation: ComprehensiveEvaluation) => {
      try {
        const id = await storage.save(evaluation);
        await loadEvaluations(); // 再読み込み
        return id;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [storage, loadEvaluations]
  );

  // 評価を更新
  const updateEvaluation = useCallback(
    async (id: string, updates: Partial<ComprehensiveEvaluation>) => {
      try {
        await storage.update(id, updates);
        await loadEvaluations(); // 再読み込み
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [storage, loadEvaluations]
  );

  // 評価を削除
  const deleteEvaluation = useCallback(
    async (id: string) => {
      try {
        await storage.delete(id);
        await loadEvaluations(); // 再読み込み
      } catch (err) {
        setError(err as Error);
        throw err;
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

export function useEvaluation(id: string | null) {
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

    const loadEvaluation = async () => {
      try {
        setLoading(true);
        const data = await storage.get(id);
        setEvaluation(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [id, storage]);

  return { evaluation, loading, error };
}

export function useEvaluationSummary() {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storage = getStorageInstance();

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storage.getSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return { summary, loading, error, reload: loadSummary };
}