/**
 * Web環境用ConfigPort実装
 * 環境変数とブラウザ環境情報を取得
 */

import type { ConfigPort, AppConfig } from '@3k/ports'

export class WebConfigAdapter implements ConfigPort {
  private config: AppConfig | null = null

  async load(): Promise<AppConfig> {
    // 環境変数から読み込み（Next.js公開環境変数）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || '/api'
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
    const env = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production'

    this.config = {
      supabaseUrl,
      supabaseAnonKey,
      apiBase,
      platform: 'web',
      version,
      env
    }

    return this.config
  }

  get(): AppConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    return this.config
  }
}

/**
 * シングルトンインスタンス
 */
export const webConfig = new WebConfigAdapter()