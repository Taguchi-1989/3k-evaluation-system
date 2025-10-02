/* eslint-disable no-undef */

import { renderHook, act } from '@testing-library/react'
import { useBackButton, useEvaluationNavigation } from '../useBackButton'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    pathname: '/evaluation/physical',
  }),
  usePathname: () => '/evaluation/physical',
}))

// Mock window.confirm
const mockConfirm = jest.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
})

describe('useBackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('🔴 RED: 失敗するテストケース', () => {
    it('should navigate back with fallback when browser history is empty', () => {
      // history.lengthを1に設定してフォールバック動作をテスト
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      })

      const { result } = renderHook(() =>
        useBackButton({
          fallbackPath: '/dashboard',
          confirmMessage: 'データが保存されていません。このページを離れますか？'
        })
      )

      act(() => {
        result.current.goBack()
      })

      // 履歴が1の場合はフォールバックパスに遷移する
      expect(mockConfirm).toHaveBeenCalledWith('データが保存されていません。このページを離れますか？')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockBack).not.toHaveBeenCalled()
    })

    it('should show confirmation dialog when hasUnsavedChanges is true', () => {
      const { result } = renderHook(() =>
        useBackButton({
          confirmMessage: 'データが保存されていません。このページを離れますか？',
          hasUnsavedChanges: true
        })
      )

      act(() => {
        result.current.goBack()
      })

      // この時点では実装されていないため失敗する
      expect(mockConfirm).toHaveBeenCalledWith('データが保存されていません。このページを離れますか？')
    })

    it('should navigate to specific path when goToPath is called', () => {
      const { result } = renderHook(() =>
        useBackButton({ fallbackPath: '/dashboard' })
      )

      act(() => {
        result.current.goToPath('/evaluation/mental')
      })

      // この時点では実装されていないため失敗する
      expect(mockPush).toHaveBeenCalledWith('/evaluation/mental')
    })
  })
})

describe('useEvaluationNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('🔴 RED: 失敗するテストケース', () => {
    it('should provide navigation functions for evaluation pages', () => {
      const { result } = renderHook(() => useEvaluationNavigation())

      // この時点では実装されていないため失敗する
      expect(result.current.goBack).toBeDefined()
      expect(result.current.goToDashboard).toBeDefined()
      expect(result.current.goToHome).toBeDefined()
    })

    it('should navigate to dashboard when goToDashboard is called', () => {
      const { result } = renderHook(() => useEvaluationNavigation())

      act(() => {
        result.current.goToDashboard()
      })

      // この時点では実装されていないため失敗する
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should navigate to home when goToHome is called', () => {
      const { result } = renderHook(() => useEvaluationNavigation())

      act(() => {
        result.current.goToHome()
      })

      // この時点では実装されていないため失敗する
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should handle unsaved changes confirmation for dashboard navigation', () => {
      const { result } = renderHook(() => useEvaluationNavigation(true)) // hasUnsavedChanges = true

      // 未保存の変更がある状態をシミュレート
      mockConfirm.mockReturnValue(false) // ユーザーがキャンセルした場合

      act(() => {
        result.current.goToDashboard()
      })

      // 確認ダイアログが表示され、キャンセルした場合は遷移しない
      expect(mockConfirm).toHaveBeenCalledWith('編集中のデータは保存されていません。ダッシュボードに移動しますか？')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})