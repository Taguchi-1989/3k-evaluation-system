/**
 * Logger Port
 * Platform-agnostic logging interface
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogMetadata {
  [key: string]: unknown
}

export interface Logger {
  /** Log info message */
  info(message: string, meta?: LogMetadata): void

  /** Log warning message */
  warn(message: string, meta?: LogMetadata): void

  /** Log error message */
  error(message: string, meta?: LogMetadata): void

  /** Log debug message (only in development) */
  debug?(message: string, meta?: LogMetadata): void

  /** Create child logger with additional context */
  child?(context: LogMetadata): Logger
}