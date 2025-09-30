/**
 * Electron環境用Logger実装
 * electron-log (file + console)
 */

import type { Logger, LogLevel, LogMetadata } from '@3k/ports'
import log from 'electron-log'

export class ElectronLogger implements Logger {
  private context: LogMetadata

  constructor(context: LogMetadata = {}) {
    this.context = context

    // electron-logの設定
    log.transports.file.level = 'info'
    log.transports.console.level = 'debug'
  }

  info(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    log.info(message, allMeta)
  }

  warn(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    log.warn(message, allMeta)
  }

  error(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    log.error(message, allMeta)
  }

  debug(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    log.debug(message, allMeta)
  }

  child(context: LogMetadata): Logger {
    return new ElectronLogger({ ...this.context, ...context })
  }
}

/**
 * シングルトンインスタンス
 */
export const electronLogger = new ElectronLogger()