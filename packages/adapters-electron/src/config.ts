/**
 * Electron環境用ConfigPort実装
 * 環境変数 + Electron app paths
 */

import type { ConfigPort, AppConfig } from '@3k/ports'
import { app } from 'electron'

export class ElectronConfigAdapter implements ConfigPort {
  private config: AppConfig | null = null

  async load(): Promise<AppConfig> {
    // 環境変数から読み込み
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
    const apiBase = process.env.API_BASE || 'https://api.example.com'
    const version = app.getVersion()
    const env = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production'

    this.config = {
      supabaseUrl,
      supabaseAnonKey,
      apiBase,
      platform: 'desktop',
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
export const electronConfig = new ElectronConfigAdapter()