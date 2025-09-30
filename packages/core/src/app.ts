import type {
  ConfigPort,
  StoragePort,
  AuthPort,
  HttpClient,
  Logger,
  LLMPort,
  EvaluationRepository,
  NotesRepository
} from '@3k/ports'

/**
 * アダプター集約型
 * 全ての外部依存をまとめたインターフェース
 */
export interface Adapters {
  config: ConfigPort
  storage: StoragePort
  auth: AuthPort
  http: HttpClient
  logger: Logger
  llm?: LLMPort
  evaluationRepo: EvaluationRepository
  notesRepo: NotesRepository
}

/**
 * アプリケーションコア
 * 全てのビジネスロジックとユースケースを含む
 */
export interface AppCore {
  adapters: Adapters
  // Phase 1では基本構造のみ
  // Phase 2でusecases追加予定
}

/**
 * ブートストラップ関数
 * アダプターを注入してアプリケーションコアを初期化
 *
 * @param adapters - 外部依存の実装
 * @returns アプリケーションコア
 *
 * @example
 * // Web環境での使用
 * import { bootstrap } from '@3k/core/app'
 * import { webAdapters } from '@3k/adapters-web'
 *
 * const app = await bootstrap(webAdapters)
 *
 * @example
 * // Electron環境での使用
 * import { bootstrap } from '@3k/core/app'
 * import { electronAdapters } from '@3k/adapters-electron'
 *
 * const app = await bootstrap(electronAdapters)
 */
export async function bootstrap(adapters: Adapters): Promise<AppCore> {
  // 設定読み込み
  await adapters.config.load()

  adapters.logger.info('Application core initialized', {
    platform: adapters.config.get().platform,
    version: adapters.config.get().version
  })

  return {
    adapters
    // Phase 2でusecasesを追加
  }
}