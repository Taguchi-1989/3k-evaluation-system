/**
 * Web環境用AuthPort実装
 * Supabase Auth
 */

import type { AuthPort, Session } from '@3k/ports'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export class SupabaseAuthAdapter implements AuthPort {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.supabase.auth.getSession()

    if (error || !data.session) {
      return null
    }

    return {
      userId: data.session.user.id,
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at || 0
    }
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined
      }
    })

    if (error) {
      throw new Error(`OAuth sign in failed: ${error.message}`)
    }
  }

  async signInWithPassword(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.session) {
      throw new Error(`Password sign in failed: ${error?.message || 'No session'}`)
    }

    return {
      userId: data.session.user.id,
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at || 0
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (supabaseSession) {
        callback({
          userId: supabaseSession.user.id,
          accessToken: supabaseSession.access_token,
          expiresAt: supabaseSession.expires_at || 0
        })
      } else {
        callback(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}

/**
 * ファクトリー関数
 * ConfigPortから設定を受け取って初期化
 */
export function createSupabaseAuth(supabaseUrl: string, supabaseAnonKey: string): AuthPort {
  return new SupabaseAuthAdapter(supabaseUrl, supabaseAnonKey)
}