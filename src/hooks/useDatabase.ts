/**
 * データベース操作フック
 * Electron環境ではローカルSQLite、Web環境ではlocalStorageを使用
 */

import { useState, useCallback } from 'react';
import { isElectron, electronDB } from '@/lib/electron/electronAPI';
import type { Evaluation, EvaluationForm } from '@/types/evaluation';

interface DatabaseHook {
  // 状態
  isLoading: boolean;
  error: string | null;

  // 評価データ操作
  saveEvaluation: (evaluation: EvaluationForm) => Promise<string | null>;
  loadEvaluation: (id: string) => Promise<Evaluation | null>;
  listEvaluations: (filters?: any) => Promise<Evaluation[]>;
  deleteEvaluation: (id: string) => Promise<boolean>;

  // データエクスポート/インポート
  exportEvaluations: () => Promise<string | null>;
  importEvaluations: (data: string) => Promise<boolean>;

  // 設定管理
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<boolean>;
}

export const useDatabase = (): DatabaseHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    console.error('Database operation error:', err);
    setError(err.message || 'データベース操作でエラーが発生しました');
    return null;
  }, []);

  const saveEvaluation = useCallback(async (evaluation: EvaluationForm): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteデータベースに保存
        const result = await window.electronAPI.evaluation.save(evaluation as unknown as Evaluation);
        return (result.data as Evaluation | undefined)?.id ?? null;
      } else {
        // Web環境: localStorageに保存
        const id = `eval_${Date.now()}`;
        const evaluationWithId = {
          id,
          ...evaluation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const existingData = localStorage.getItem('evaluations');
        const evaluations = existingData ? JSON.parse(existingData) : [];
        evaluations.push(evaluationWithId);
        localStorage.setItem('evaluations', JSON.stringify(evaluations));

        return id;
      }
    } catch (err) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const loadEvaluation = useCallback(async (id: string): Promise<Evaluation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteから読み込み
        const result = await window.electronAPI.evaluation.load<Evaluation>(id);
        return result.data ?? null;
      } else {
        // Web環境: localStorageから読み込み
        const existingData = localStorage.getItem('evaluations');
        if (!existingData) return null;

        const evaluations = JSON.parse(existingData);
        return evaluations.find((evaluation: Evaluation) => evaluation.id === id) || null;
      }
    } catch (err) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const listEvaluations = useCallback(async (filters?: any): Promise<Evaluation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteから一覧取得
        const result = await window.electronAPI.evaluation.list<Evaluation>(filters);
        return result.data ?? [];
      } else {
        // Web環境: localStorageから一覧取得
        const existingData = localStorage.getItem('evaluations');
        if (!existingData) return [];

        let evaluations = JSON.parse(existingData);

        // フィルタリング処理
        if (filters) {
          if (filters.factoryName) {
            evaluations = evaluations.filter((evaluation: Evaluation) =>
              evaluation.factoryName?.includes(filters.factoryName)
            );
          }
          if (filters.workName) {
            evaluations = evaluations.filter((evaluation: Evaluation) =>
              evaluation.workName?.includes(filters.workName)
            );
          }
        }

        return evaluations.sort((a: Evaluation, b: Evaluation) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const deleteEvaluation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteから削除
        const result = await window.electronAPI.evaluation.delete(id);
        return result.success;
      } else {
        // Web環境: localStorageから削除
        const existingData = localStorage.getItem('evaluations');
        if (!existingData) return false;

        const evaluations = JSON.parse(existingData);
        const filteredEvaluations = evaluations.filter((evaluation: Evaluation) => evaluation.id !== id);
        localStorage.setItem('evaluations', JSON.stringify(filteredEvaluations));

        return true;
      }
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const exportEvaluations = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const evaluations = await listEvaluations();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        evaluations
      };

      return JSON.stringify(exportData, null, 2);
    } catch (err) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [listEvaluations, handleError]);

  const importEvaluations = useCallback(async (data: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const importData = JSON.parse(data);

      if (!importData.evaluations || !Array.isArray(importData.evaluations)) {
        throw new Error('無効なデータフォーマットです');
      }

      // 各評価データを保存
      for (const evaluation of importData.evaluations) {
        await saveEvaluation(evaluation);
      }

      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveEvaluation, handleError]);

  const getSetting = useCallback(async (key: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteから設定取得
        const result = await window.electronAPI.database.query<{ value: string }>(
          'SELECT value FROM settings WHERE key = ?',
          [key]
        );
        return result.data ? JSON.parse(result.data.value) : null;
      } else {
        // Web環境: localStorageから設定取得
        const value = localStorage.getItem(`setting_${key}`);
        return value ? JSON.parse(value) : null;
      }
    } catch (err) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const setSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isElectron() && window.electronAPI) {
        // Electron環境: SQLiteに設定保存
        const result = await window.electronAPI.database.query(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, JSON.stringify(value)]
        );
        return result.success;
      } else {
        // Web環境: localStorageに設定保存
        localStorage.setItem(`setting_${key}`, JSON.stringify(value));
        return true;
      }
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    isLoading,
    error,
    saveEvaluation,
    loadEvaluation,
    listEvaluations,
    deleteEvaluation,
    exportEvaluations,
    importEvaluations,
    getSetting,
    setSetting
  };
};