'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface BackButtonOptions {
  fallbackPath?: string
  confirmMessage?: string
  hasUnsavedChanges?: boolean
  onBeforeBack?: () => boolean | Promise<boolean>
}

export function useBackButton(options: BackButtonOptions = {}): {
  goBack: () => Promise<void>
  goToPath: (path: string) => void
  router: ReturnType<typeof useRouter>
} {
  const router = useRouter()
  const { fallbackPath = '/dashboard', confirmMessage, hasUnsavedChanges, onBeforeBack } = options

  const goBack = useCallback(async () => {
    // 戻る前の確認処理
    if (onBeforeBack) {
      const canGoBack = await onBeforeBack()
      if (!canGoBack) return
    }

    // 確認メッセージの表示（未保存の変更がある場合またはconfirmMessageが設定されている場合）
    if (hasUnsavedChanges || confirmMessage) {
      const message = confirmMessage || '未保存の変更があります。このページを離れますか？'
      const confirmed = window.confirm(message)
      if (!confirmed) return
    }

    // ブラウザの履歴がある場合は履歴で戻る
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // 履歴がない場合はフォールバックパスに遷移
      router.push(fallbackPath)
    }
  }, [router, fallbackPath, confirmMessage, hasUnsavedChanges, onBeforeBack])

  const goToPath = useCallback((path: string) => {
    router.push(path)
  }, [router])

  return {
    goBack,
    goToPath,
    router
  }
}

// 評価ページ専用のカスタムフック
export function useEvaluationNavigation(hasUnsavedChanges?: boolean): {
  goBack: () => Promise<void>
  goToDashboard: () => void
  goToEvaluationList: () => void
  goToHome: () => void
  goToPath: (path: string) => void
} {
  const { goBack, goToPath } = useBackButton({
    fallbackPath: '/dashboard',
    confirmMessage: '編集中のデータは保存されていません。このページを離れますか？',
    hasUnsavedChanges
  })

  const goToDashboard = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('編集中のデータは保存されていません。ダッシュボードに移動しますか？')
      if (!confirmed) return
    }
    goToPath('/dashboard')
  }, [goToPath, hasUnsavedChanges])

  const goToEvaluationList = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('編集中のデータは保存されていません。評価一覧に移動しますか？')
      if (!confirmed) return
    }
    goToPath('/evaluation/list')
  }, [goToPath, hasUnsavedChanges])

  const goToHome = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('編集中のデータは保存されていません。ホームに移動しますか？')
      if (!confirmed) return
    }
    goToPath('/')
  }, [goToPath, hasUnsavedChanges])

  return {
    goBack,
    goToDashboard,
    goToEvaluationList,
    goToHome,
    goToPath
  }
}