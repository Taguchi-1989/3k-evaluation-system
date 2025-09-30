/**
 * Web環境用Logger実装
 * Console API
 */

import type { Logger, LogLevel, LogMetadata } from '@3k/ports'

export class ConsoleLogger implements Logger {
  private context: LogMetadata

  constructor(context: LogMetadata = {}) {
    this.context = context
  }

  info(message: string, meta?: LogMetadata): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMetadata): void {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: LogMetadata): void {
    this.log('error', message, meta)
  }

  debug(message: string, meta?: LogMetadata): void {
    this.log('debug', message, meta)
  }

  child(context: LogMetadata): Logger {
    return new ConsoleLogger({ ...this.context, ...context })
  }

  private log(level: LogLevel, message: string, meta?: LogMetadata): void {
    const timestamp = new Date().toISOString()
    const allMeta = { ...this.context, ...meta }
    const metaStr = Object.keys(allMeta).length > 0 ? JSON.stringify(allMeta) : ''

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`.trim()

    switch (level) {
      case 'debug':
        console.debug(logMessage)
        break
      case 'info':
        console.info(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'error':
        console.error(logMessage)
        break
    }
  }
}

/**
 * シングルトンインスタンス
 */
export const consoleLogger = new ConsoleLogger()