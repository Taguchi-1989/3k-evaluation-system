/**
 * @3k/adapters-web
 * Web環境用アダプター集約
 */

import type { Adapters } from '@3k/core'
import { createClient } from '@supabase/supabase-js'
import { webConfig } from './config'
import { webStorage } from './storage'
import { createSupabaseAuth } from './auth'
import { createFetchClient } from './http'
import { consoleLogger } from './logger'
import { createSupabaseRepositories } from './repositories'

/**
 * Web環境用アダプターを初期化
 *
 * @returns Adapters - 全てのアダプター実装
 *
 * @example
 * ```ts
 * import { createWebAdapters } from '@3k/adapters-web'
 * import { bootstrap } from '@3k/core'
 *
 * const adapters = await createWebAdapters()
 * const app = await bootstrap(adapters)
 * ```
 */
export async function createWebAdapters(): Promise<Adapters> {
  // 設定読み込み
  const config = await webConfig.load()

  // Supabaseクライアント作成
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

  // 認証アダプター
  const auth = createSupabaseAuth(config.supabaseUrl, config.supabaseAnonKey)

  // HTTPクライアント
  const http = createFetchClient(config.apiBase)

  // リポジトリ
  const { evaluationRepo, notesRepo } = createSupabaseRepositories(supabase, webStorage)

  return {
    config: webConfig,
    storage: webStorage,
    auth,
    http,
    logger: consoleLogger,
    evaluationRepo,
    notesRepo
  }
}

// 個別エクスポート（テスト・カスタマイズ用）
export { webConfig } from './config'
export { webStorage } from './storage'
export { createSupabaseAuth } from './auth'
export { createFetchClient } from './http'
export { consoleLogger } from './logger'
export { createSupabaseRepositories } from './repositories'