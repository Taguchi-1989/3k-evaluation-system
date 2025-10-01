/**
 * Electron環境用Logger実装
 * electron-log (file + console)
 */

import type { Logger, LogMetadata } from '@3k/ports'
import log = require('electron-log')

export class ElectronLogger implements Logger {
  private context: LogMetadata

  constructor(context: LogMetadata = {}) {
    this.context = context

    // electron-logの設定
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    log.transports.file.level = 'info'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    log.transports.console.level = 'debug'
  }

  info(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    log.info(message, allMeta)
  }

  warn(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    log.warn(message, allMeta)
  }

  error(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    log.error(message, allMeta)
  }

  debug(message: string, meta?: LogMetadata): void {
    const allMeta = { ...this.context, ...meta }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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