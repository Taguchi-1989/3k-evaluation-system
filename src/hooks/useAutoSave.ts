'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDatabase } from './useDatabase'

interface AutoSaveOptions<T = unknown> {
  data: T
  id?: string
  interval?: number // 自動保存間隔（ミリ秒）
  enabled?: boolean
  onSave?: (id: string) => void
  onError?: (error: string) => void
}

export function useAutoSave<T = unknown>({
  data,
  id: _id,
  interval = 30000, // 30秒間隔
  enabled = true,
  onSave,
  onError
}: AutoSaveOptions<T>): {
  manualSave: () => Promise<string | undefined>
  hasUnsavedChanges: boolean
  isAutoSaving: boolean
} {
  const { saveEvaluation, isLoading } = useDatabase()
  const savedDataRef = useRef<T | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isFirstSave = useRef(true)
  const hasDataChangedRef = useRef<(() => boolean) | undefined>(undefined)
  const manualSaveRef = useRef<(() => Promise<string | undefined>) | undefined>(undefined)

  // データが変更されたかチェック
  const hasDataChanged = useCallback(() => {
    if (!savedDataRef.current) return true
    return JSON.stringify(data) !== JSON.stringify(savedDataRef.current)
  }, [data])

  // 手動保存
  const manualSave = useCallback(async () => {
    if (!enabled || isLoading || !hasDataChanged()) return

    try {
      const savedId = await saveEvaluation(data as unknown as Parameters<typeof saveEvaluation>[0])
      if (savedId) {
        savedDataRef.current = data
        onSave?.(savedId)
        return savedId
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Save error')
    }
    return undefined
  }, [data, enabled, isLoading, hasDataChanged, saveEvaluation, onSave, onError])

  // Update refs when functions change
  hasDataChangedRef.current = hasDataChanged
  manualSaveRef.current = manualSave

  // 自動保存の実行
  const performAutoSave = useCallback(async () => {
    if (!enabled || isLoading || !hasDataChanged()) return

    // 初回保存はスキップ（手動保存を優先）
    if (isFirstSave.current) {
      isFirstSave.current = false
      return
    }

    await manualSave()
  }, [enabled, isLoading, hasDataChanged, manualSave])

  // 自動保存タイマーの設定
  useEffect(() => {
    if (!enabled) return

    // 既存のタイマーをクリア
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // 新しいタイマーを設定
    timerRef.current = setInterval(() => { void performAutoSave() }, interval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [enabled, interval, performAutoSave])

  // ページ離脱時の保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      // データが変更されている場合のみ警告を表示
      if (hasDataChangedRef.current?.()) {
        const message = '変更が保存されていません。このページを離れますか？'
        e.returnValue = message
        return message
      }
      return undefined
    }

    const handleVisibilityChange = () => {
      // ページが非表示になる時に保存を試行（バックグラウンドに移行時など）
      if (document.visibilityState === 'hidden' && hasDataChangedRef.current?.()) {
        manualSaveRef.current?.().catch(error => console.error('Background save failed:', error))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Remove dependencies to prevent frequent re-registration

  return {
    manualSave,
    hasUnsavedChanges: hasDataChanged(),
    isAutoSaving: isLoading
  }
}

// 評価専用の自動保存フック
export function useEvaluationAutoSave<T = unknown>(evaluationData: T, evaluationId?: string): {
  manualSave: () => Promise<string | undefined>
  hasUnsavedChanges: boolean
  isAutoSaving: boolean
} {
  return useAutoSave<T>({
    data: evaluationData,
    id: evaluationId,
    interval: 30000, // 30秒
    enabled: true,
    onSave: (id) => {

      console.log(`評価データが自動保存されました: ${id}`);
    },
    onError: (error) => console.error('自動保存エラー:', error)
  })
}