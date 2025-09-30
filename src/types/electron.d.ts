/**
 * Electron API Type Declarations
 * Window object拡張とElectron preload APIの型定義
 */

import type { APIResponse, DialogOptions, EvaluationFilters } from '@/lib/electron/electronAPI'

export interface ElectronAPI {
  // Electron環境判定
  isElectron: boolean
  isDevelopment: boolean

  // データベースAPI
  database: {
    query: <T = unknown>(sql: string, params: unknown[]) => Promise<APIResponse<T>>
    transaction: <T = unknown>(queries: Array<{ query: string; params: unknown[] }>) => Promise<APIResponse<T>>
  }

  // 評価データAPI
  evaluation: {
    save: <T = unknown>(data: T) => Promise<APIResponse<T>>
    load: <T = unknown>(id: string) => Promise<APIResponse<T>>
    list: <T = unknown>(filters?: EvaluationFilters) => Promise<APIResponse<T[]>>
    delete: (id: string) => Promise<APIResponse<void>>
  }

  // ファイルAPI
  file: {
    saveDialog: (options: DialogOptions) => Promise<string | undefined>
    openDialog: (options: DialogOptions) => Promise<string[] | undefined>
  }

  // システムAPI
  system: {
    getVersion: () => Promise<string>
    getPlatform: () => Promise<string>
    openExternal: (url: string) => Promise<void>
  }

  // アプリケーション制御API
  app: {
    quit: () => Promise<void>
    minimize: () => Promise<void>
    maximize: () => Promise<void>
  }

  // Storeデータアクセス (preloadから公開)
  store: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<boolean>
    delete: (key: string) => Promise<boolean>
    clear: () => Promise<boolean>
    path: () => Promise<string>
  }

  // プラットフォーム情報
  platform: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electron?: {
      store: ElectronAPI['store']
      platform: string
      isElectron: boolean
    }
  }
}

export {}
