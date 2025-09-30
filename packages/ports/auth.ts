/**
 * Authentication Port
 * Platform-agnostic authentication interface
 */

export interface Session {
  /** User ID */
  userId: string
  /** Access token (JWT) */
  accessToken: string
  /** Token expiration timestamp */
  expiresAt: number
}

export interface AuthPort {
  /** Get current session */
  getSession(): Promise<Session | null>

  /** Sign in with OAuth provider */
  signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<void>

  /** Sign in with email/password */
  signInWithPassword(email: string, password: string): Promise<Session>

  /** Sign out */
  signOut(): Promise<void>

  /** Listen to auth state changes (optional) */
  onAuthStateChange?(callback: (session: Session | null) => void): () => void
}