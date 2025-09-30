/**
 * @3k/adapters-electron
 * Electron環境用アダプター集約
 */

import type {
  ConfigPort,
  StoragePort,
  AuthPort,
  HttpClient,
  Logger,
  EvaluationRepository,
  NotesRepository
} from '@3k/ports'
import { electronConfig } from './config'
import { electronStorage } from './storage'
import { createElectronAuth } from './auth'
import { createElectronHttpClient } from './http'
import { electronLogger } from './logger'
import { createSQLiteRepositories } from './repositories'

/**
 * アダプター集約型
 */
export interface Adapters {
  config: ConfigPort
  storage: StoragePort
  auth: AuthPort
  http: HttpClient
  logger: Logger
  evaluationRepo: EvaluationRepository
  notesRepo: NotesRepository
}

/**
 * Electron環境用アダプターを初期化
 *
 * @returns Adapters - 全てのアダプター実装
 *
 * @example
 * ```ts
 * import { createElectronAdapters } from '@3k/adapters-electron'
 * import { bootstrap } from '@3k/core'
 *
 * const adapters = await createElectronAdapters()
 * const app = await bootstrap(adapters)
 * ```
 */
export async function createElectronAdapters(): Promise<Adapters> {
  // 設定読み込み
  const config = await electronConfig.load()

  // 認証アダプター（Storageに依存）
  const auth = createElectronAuth(config.supabaseUrl, config.supabaseAnonKey, electronStorage)

  // HTTPクライアント
  const http = createElectronHttpClient(config.apiBase)

  // リポジトリ
  const { evaluationRepo, notesRepo } = createSQLiteRepositories()

  return {
    config: electronConfig,
    storage: electronStorage,
    auth,
    http,
    logger: electronLogger,
    evaluationRepo,
    notesRepo
  }
}

// 個別エクスポート（テスト・カスタマイズ用）
export { electronConfig } from './config'
export { electronStorage } from './storage'
export { createElectronAuth } from './auth'
export { createElectronHttpClient } from './http'
export { electronLogger } from './logger'
export { createSQLiteRepositories } from './repositories'