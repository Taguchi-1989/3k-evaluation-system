/**
 * Electron環境用AuthPort実装
 * OAuth via browser window + StoragePort for session persistence
 */

import type { AuthPort, Session, StoragePort } from '@3k/ports'
import { shell } from 'electron'

export class ElectronAuthAdapter implements AuthPort {
  private storage: StoragePort
  private supabaseUrl: string
  private supabaseAnonKey: string
  private sessionKey = 'auth:session'

  constructor(supabaseUrl: string, supabaseAnonKey: string, storage: StoragePort) {
    this.supabaseUrl = supabaseUrl
    this.supabaseAnonKey = supabaseAnonKey
    this.storage = storage
  }

  async getSession(): Promise<Session | null> {
    // ローカルストレージからセッション取得
    const session = await this.storage.kv.get<Session>(this.sessionKey)

    if (!session) {
      return null
    }

    // セッション有効期限チェック
    if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
      await this.storage.kv.remove(this.sessionKey)
      return null
    }

    return session
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<void> {
    // OAuthフローをブラウザで開く
    const redirectUri = 'http://localhost:54321/auth/callback' // ローカルサーバーでコールバック受信
    const authUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUri)}`

    await shell.openExternal(authUrl)

    // 注: 実際の実装では、ローカルHTTPサーバーを立ててコールバックを受信し、
    // セッション情報を取得してstorageに保存する必要があります
    throw new Error('OAuth callback handler not implemented. Use signInWithPassword for now.')
  }

  async signInWithPassword(email: string, password: string): Promise<Session> {
    // Supabase REST APIを使用してログイン
    const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.supabaseAnonKey
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Password sign in failed: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    const session: Session = {
      userId: data.user.id,
      accessToken: data.access_token,
      expiresAt: data.expires_at || 0
    }

    // セッションを永続化
    await this.storage.kv.set(this.sessionKey, session)

    return session
  }

  async signOut(): Promise<void> {
    // セッション削除
    await this.storage.kv.remove(this.sessionKey)
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    // Electron環境では定期的にセッションをチェック
    const interval = setInterval(async () => {
      const session = await this.getSession()
      callback(session)
    }, 5000) // 5秒ごとにチェック

    return () => {
      clearInterval(interval)
    }
  }
}

/**
 * ファクトリー関数
 */
export function createElectronAuth(
  supabaseUrl: string,
  supabaseAnonKey: string,
  storage: StoragePort
): AuthPort {
  return new ElectronAuthAdapter(supabaseUrl, supabaseAnonKey, storage)
}