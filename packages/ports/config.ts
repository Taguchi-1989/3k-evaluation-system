/**
 * Application Configuration Port
 * Provides platform-agnostic access to application configuration
 */
export interface AppConfig {
  /** Supabase project URL */
  supabaseUrl: string
  /** Supabase anonymous key (safe to expose) */
  supabaseAnonKey: string
  /** API base URL */
  apiBase: string
  /** Current platform */
  platform: 'web' | 'desktop'
  /** Application version */
  version: string
  /** Environment (development/production) */
  env: 'development' | 'production'
}

/**
 * Configuration Provider Port
 * Responsible for loading and validating configuration
 */
export interface ConfigPort {
  /** Load configuration (async for file-based configs) */
  load(): Promise<AppConfig>
  /** Get current configuration (sync, throws if not loaded) */
  get(): AppConfig
}