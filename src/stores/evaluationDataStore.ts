'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { isElectron, universalStorage, universalEvaluationStorage } from '@/lib/electron/electronAPI'
import type { APIResponse } from '@/lib/electron/electronAPI'
import type {
  PhysicalDetails,
  MentalDetails,
  EnvironmentalDetails,
  HazardDetails,
  WorkTimeFactor
} from '@3k/core'

interface UserInfo {
  readonly name?: string
  readonly role?: string
  readonly department?: string
}

interface WorkInfo {
  readonly factoryName?: string
  readonly processName?: string
  readonly creator?: UserInfo
  readonly checker?: UserInfo
}

type FactorData = PhysicalDetails | MentalDetails | EnvironmentalDetails | HazardDetails | WorkTimeFactor

interface EvaluationData {
  id: string
  workName: string
  workDescription: string
  factoryName: string
  processName: string
  createdAt: string
  updatedAt: string
  physicalFactor?: PhysicalDetails
  mentalFactor?: MentalDetails
  environmentalFactor?: EnvironmentalDetails
  hazardFactor?: HazardDetails
  workTimeFactor?: WorkTimeFactor
  metadata?: {
    creator?: UserInfo
    checker?: UserInfo
    photos?: string[]
  }
}

interface EvaluationDataState {
  // 現在編集中の評価データ
  currentEvaluation: EvaluationData | null

  // 保存済み評価データのリスト
  savedEvaluations: EvaluationData[]

  // 状態管理
  isLoading: boolean
  lastSaved: string | null
  hasUnsavedChanges: boolean

  // アクション
  setCurrentEvaluation: (evaluation: EvaluationData | null) => void
  updateCurrentEvaluation: (updates: Partial<EvaluationData>) => void
  updateFactorData: (factorType: string, data: FactorData) => void

  // データ永続化
  saveCurrentEvaluation: () => Promise<string | null>
  loadEvaluation: (id: string) => Promise<void>
  loadAllEvaluations: () => Promise<void>
  deleteEvaluation: (id: string) => Promise<void>

  // 新規評価作成
  createNewEvaluation: (workName: string, workInfo?: WorkInfo) => void

  // 状態リセット
  reset: () => void
}

// ローカルストレージキー
const STORAGE_KEY = '3k-evaluation-data'

// Electron環境でのデータベース操作
const electronStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const result: unknown = await universalStorage.load(key)
      return result ? JSON.stringify(result) : null
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await universalStorage.save(key, JSON.parse(value))
    } catch (error) {
      console.error('Electron storage error:', error)
    }
  },
  removeItem: async (key: string) => {
    try {
      await universalStorage.remove(key)
    } catch (error) {
      console.error('Electron storage remove error:', error)
    }
  }
}

export const useEvaluationDataStore = create<EvaluationDataState>()(
  persist(
    (set, get) => ({
      // 初期状態
      currentEvaluation: null,
      savedEvaluations: [],
      isLoading: false,
      lastSaved: null,
      hasUnsavedChanges: false,

      // 現在の評価データを設定
      setCurrentEvaluation: (evaluation) => {
        set({
          currentEvaluation: evaluation,
          hasUnsavedChanges: false
        })
      },

      // 現在の評価データを更新
      updateCurrentEvaluation: (updates) => {
        const current = get().currentEvaluation
        if (!current) return

        set({
          currentEvaluation: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        })
      },

      // 因子データを更新
      updateFactorData: (factorType, data) => {
        const current = get().currentEvaluation
        if (!current) return

        set({
          currentEvaluation: {
            ...current,
            [factorType]: data,
            updatedAt: new Date().toISOString()
          },
          hasUnsavedChanges: true
        })
      },

      // 現在の評価データを保存
      saveCurrentEvaluation: async () => {
        const { currentEvaluation } = get()
        if (!currentEvaluation) return null

        set({ isLoading: true })

        try {
          let savedId: string

          if (isElectron()) {
            // Electron環境: SQLiteデータベースに保存
            const result: APIResponse<EvaluationData> = await universalEvaluationStorage.save(currentEvaluation)
            savedId = result.success ? currentEvaluation.id : ''
          } else {
            // Web環境: 既存の保存済みリストに追加
            savedId = currentEvaluation.id
            const savedEvaluations = get().savedEvaluations
            const existingIndex = savedEvaluations.findIndex(e => e.id === savedId)

            if (existingIndex >= 0) {
              savedEvaluations[existingIndex] = currentEvaluation
            } else {
              savedEvaluations.push(currentEvaluation)
            }

            set({ savedEvaluations: [...savedEvaluations] })
          }

          set({
            hasUnsavedChanges: false,
            lastSaved: new Date().toISOString(),
            isLoading: false
          })

          return savedId
        } catch (error) {
          console.error('保存エラー:', error)
          set({ isLoading: false })
          return null
        }
      },

      // 評価データを読み込み
      loadEvaluation: async (id) => {
        set({ isLoading: true })

        try {
          let evaluation: EvaluationData | null = null

          if (isElectron()) {
            const result: APIResponse<EvaluationData> = await universalEvaluationStorage.load<EvaluationData>(id)
            evaluation = (result.success && result.data) ? result.data : null
          } else {
            const savedEvaluations = get().savedEvaluations
            evaluation = savedEvaluations.find(e => e.id === id) || null
          }

          set({
            currentEvaluation: evaluation,
            hasUnsavedChanges: false,
            isLoading: false
          })
        } catch (error) {
          console.error('読み込みエラー:', error)
          set({ isLoading: false })
        }
      },

      // 全評価データを読み込み
      loadAllEvaluations: async () => {
        set({ isLoading: true })

        try {
          if (isElectron()) {
            const result: APIResponse<EvaluationData[]> = await universalEvaluationStorage.list<EvaluationData>()
            set({ savedEvaluations: (result.success && result.data) ? result.data : [] })
          }
          // Web環境では既にpersistで管理されているため何もしない

          set({ isLoading: false })
        } catch (error) {
          console.error('一覧読み込みエラー:', error)
          set({ isLoading: false })
        }
      },

      // 評価データを削除
      deleteEvaluation: async (id) => {
        set({ isLoading: true })

        try {
          if (isElectron()) {
            await universalEvaluationStorage.delete(id)
          }

          const savedEvaluations = get().savedEvaluations.filter(e => e.id !== id)
          set({ savedEvaluations })

          // 現在編集中のデータが削除対象の場合はクリア
          const current = get().currentEvaluation
          if (current && current.id === id) {
            set({ currentEvaluation: null, hasUnsavedChanges: false })
          }

          set({ isLoading: false })
        } catch (error) {
          console.error('削除エラー:', error)
          set({ isLoading: false })
        }
      },

      // 新規評価作成
      createNewEvaluation: (workName, workInfo = {}) => {
        const newEvaluation: EvaluationData = {
          id: `eval_${Date.now()}`,
          workName,
          workDescription: '',
          factoryName: workInfo.factoryName || '',
          processName: workInfo.processName || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            creator: workInfo.creator,
            checker: workInfo.checker,
            photos: []
          }
        }

        set({
          currentEvaluation: newEvaluation,
          hasUnsavedChanges: true
        })
      },

      // 状態リセット
      reset: () => {
        set({
          currentEvaluation: null,
          hasUnsavedChanges: false,
          lastSaved: null
        })
      }
    }),
    {
      name: STORAGE_KEY,
      storage: isElectron()
        ? createJSONStorage(() => electronStorage)
        : createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedEvaluations: state.savedEvaluations,
        lastSaved: state.lastSaved
      })
    }
  )
)