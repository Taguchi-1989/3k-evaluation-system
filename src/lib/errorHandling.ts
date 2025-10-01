/**
 * 包括的エラーハンドリングとバリデーションシステム
 * 3K評価アプリケーション用のエラー管理・バリデーション機能
 */

// エラーの種類定義
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network', 
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
  FILE_UPLOAD = 'file_upload',
  CALCULATION = 'calculation',
  AI_SERVICE = 'ai_service'
}

// エラーの重要度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// カスタムエラークラス
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly code: string
  public readonly userMessage: string
  public readonly technicalDetails: Record<string, unknown>
  public readonly timestamp: Date
  public readonly userId?: string
  public readonly contextData?: Record<string, unknown>

  constructor({
    message,
    type,
    severity,
    code,
    userMessage,
    technicalDetails = {},
    userId,
    contextData = {}
  }: {
    message: string
    type: ErrorType
    severity: ErrorSeverity
    code: string
    userMessage: string
    technicalDetails?: Record<string, unknown>
    userId?: string
    contextData?: Record<string, unknown>
  }) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.code = code
    this.userMessage = userMessage
    this.technicalDetails = technicalDetails
    this.timestamp = new Date()
    this.userId = userId
    this.contextData = contextData

    // スタックトレースの保持
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  value: unknown
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  value: unknown
  message: string
  code: string
}

// 評価データバリデーター
export class EvaluationValidator {
  
  /**
   * 肉体因子データのバリデーション
   */
  static validatePhysicalFactor(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 必須フィールドチェック
    if (!data.workName || typeof data.workName !== 'string' || data.workName.trim() === '') {
      errors.push({
        field: 'workName',
        value: data.workName,
        message: '作業名は必須入力です',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!data.factoryName || typeof data.factoryName !== 'string' || data.factoryName.trim() === '') {
      errors.push({
        field: 'factoryName',
        value: data.factoryName,
        message: '工場名は必須入力です',
        code: 'REQUIRED_FIELD'
      })
    }

    // 重量データのバリデーション
    if (data.weightBoth) {
      const weight = Number(data.weightBothValue)
      if (isNaN(weight) || weight < 0) {
        errors.push({
          field: 'weightBothValue',
          value: data.weightBothValue,
          message: '両手重量は0以上の数値で入力してください',
          code: 'INVALID_NUMBER'
        })
      } else if (weight > 50) {
        warnings.push({
          field: 'weightBothValue',
          value: weight,
          message: '50kgを超える重量は高リスクです',
          code: 'HIGH_RISK_VALUE'
        })
      }
    }

    if (data.weightSingle) {
      const weight = Number(data.weightSingleValue)
      if (isNaN(weight) || weight < 0) {
        errors.push({
          field: 'weightSingleValue',
          value: data.weightSingleValue,
          message: '片手重量は0以上の数値で入力してください',
          code: 'INVALID_NUMBER'
        })
      } else if (weight > 25) {
        warnings.push({
          field: 'weightSingleValue',
          value: weight,
          message: '25kgを超える片手重量は高リスクです',
          code: 'HIGH_RISK_VALUE'
        })
      }
    }

    // 姿勢データのバリデーション
    if (data.postures && Array.isArray(data.postures)) {
      (data.postures as Record<string, unknown>[]).forEach((posture, index) => {
        const rulaScore = Number(posture.rulaScore)
        const owasCategory = Number(posture.owasCategory)

        if (isNaN(rulaScore) || rulaScore < 1 || rulaScore > 7) {
          errors.push({
            field: `postures.${index}.rulaScore`,
            value: posture.rulaScore,
            message: `姿勢${index + 1}: RULAスコアは1-7の範囲で入力してください`,
            code: 'INVALID_RANGE'
          })
        }

        if (isNaN(owasCategory) || owasCategory < 1 || owasCategory > 4) {
          errors.push({
            field: `postures.${index}.owasCategory`,
            value: posture.owasCategory,
            message: `姿勢${index + 1}: OWASカテゴリは1-4の範囲で入力してください`,
            code: 'INVALID_RANGE'
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 精神因子データのバリデーション
   */
  static validateMentalFactor(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const mentalFactors = ['complexity', 'concentration', 'responsibility', 'pressure', 'communication', 'decision']
    
    for (const factor of mentalFactors) {
      if (data[factor] !== undefined) {
        const value = Number(data[factor])
        if (isNaN(value) || value < 1 || value > 5) {
          errors.push({
            field: factor,
            value: data[factor],
            message: `${factor}は1-5の範囲で選択してください`,
            code: 'INVALID_RANGE'
          })
        } else if (value >= 4) {
          warnings.push({
            field: factor,
            value: value,
            message: `${factor}が高レベルです。改善を検討してください`,
            code: 'HIGH_MENTAL_LOAD'
          })
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 環境因子データのバリデーション
   */
  static validateEnvironmentalFactor(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 化学物質データのバリデーション
    if (data.substances && Array.isArray(data.substances)) {
      (data.substances as Record<string, unknown>[]).forEach((substance, index) => {
        if (!substance.substanceName || typeof substance.substanceName !== 'string') {
          errors.push({
            field: `substances.${index}.substanceName`,
            value: substance.substanceName,
            message: `物質${index + 1}: 物質名を入力してください`,
            code: 'REQUIRED_FIELD'
          })
        }

        const standardValue = Number(substance.standardValue)
        const measuredValue = Number(substance.measuredValue)

        if (isNaN(standardValue) || standardValue <= 0) {
          errors.push({
            field: `substances.${index}.standardValue`,
            value: substance.standardValue,
            message: `物質${index + 1}: 基準値は正の数値で入力してください`,
            code: 'INVALID_NUMBER'
          })
        }

        if (isNaN(measuredValue) || measuredValue < 0) {
          errors.push({
            field: `substances.${index}.measuredValue`,
            value: substance.measuredValue,
            message: `物質${index + 1}: 測定値は0以上の数値で入力してください`,
            code: 'INVALID_NUMBER'
          })
        }

        // 基準値超過チェック
        if (!isNaN(standardValue) && !isNaN(measuredValue) && measuredValue > standardValue) {
          warnings.push({
            field: `substances.${index}.measuredValue`,
            value: measuredValue,
            message: `物質${index + 1}: 測定値が基準値を超過しています`,
            code: 'EXCEEDS_STANDARD'
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 危険因子データのバリデーション
   */
  static validateHazardFactor(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (data.hazardEvents && Array.isArray(data.hazardEvents)) {
      (data.hazardEvents as Record<string, unknown>[]).forEach((event, index) => {
        if (!event.hazardEvent || typeof event.hazardEvent !== 'string') {
          errors.push({
            field: `hazardEvents.${index}.hazardEvent`,
            value: event.hazardEvent,
            message: `危険事象${index + 1}: 危険事象を入力してください`,
            code: 'REQUIRED_FIELD'
          })
        }

        const frequency = Number(event.encounterFrequency)
        const possibility = Number(event.dangerPossibility)

        if (isNaN(frequency) || frequency < 1 || frequency > 5) {
          errors.push({
            field: `hazardEvents.${index}.encounterFrequency`,
            value: event.encounterFrequency,
            message: `危険事象${index + 1}: 遭遇頻度は1-5の範囲で入力してください`,
            code: 'INVALID_RANGE'
          })
        }

        if (isNaN(possibility) || possibility < 1 || possibility > 5) {
          errors.push({
            field: `hazardEvents.${index}.dangerPossibility`,
            value: event.dangerPossibility,
            message: `危険事象${index + 1}: 危険可能性は1-5の範囲で入力してください`,
            code: 'INVALID_RANGE'
          })
        }

        // 高リスク組み合わせの警告
        if (!isNaN(frequency) && !isNaN(possibility) && frequency * possibility >= 20) {
          warnings.push({
            field: `hazardEvents.${index}`,
            value: frequency * possibility,
            message: `危険事象${index + 1}: 極めて高いリスクです。即座の対策が必要`,
            code: 'CRITICAL_RISK'
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 作業時間データのバリデーション
   */
  static validateWorkTimeData(data: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (data.workers && Array.isArray(data.workers)) {
      (data.workers as Record<string, unknown>[]).forEach((worker, index) => {
        const laborTime = Number(worker.laborTime)
        const actualWorkTime = Number(worker.actualWorkTime)
        const overtimeHours = Number(worker.overtimeHours)

        if (isNaN(laborTime) || laborTime <= 0) {
          errors.push({
            field: `workers.${index}.laborTime`,
            value: worker.laborTime,
            message: `作業者${index + 1}: 労働時間は正の数値で入力してください`,
            code: 'INVALID_NUMBER'
          })
        }

        if (isNaN(actualWorkTime) || actualWorkTime < 0) {
          errors.push({
            field: `workers.${index}.actualWorkTime`,
            value: worker.actualWorkTime,
            message: `作業者${index + 1}: 実働時間は0以上で入力してください`,
            code: 'INVALID_NUMBER'
          })
        }

        if (isNaN(overtimeHours) || overtimeHours < 0) {
          errors.push({
            field: `workers.${index}.overtimeHours`,
            value: worker.overtimeHours,
            message: `作業者${index + 1}: 残業時間は0以上で入力してください`,
            code: 'INVALID_NUMBER'
          })
        }

        // 長時間労働の警告
        if (!isNaN(actualWorkTime) && actualWorkTime > 8) {
          warnings.push({
            field: `workers.${index}.actualWorkTime`,
            value: actualWorkTime,
            message: `作業者${index + 1}: 8時間を超える労働時間です`,
            code: 'LONG_WORK_HOURS'
          })
        }

        if (!isNaN(overtimeHours) && overtimeHours > 2) {
          warnings.push({
            field: `workers.${index}.overtimeHours`,
            value: overtimeHours,
            message: `作業者${index + 1}: 長時間の残業です`,
            code: 'EXCESSIVE_OVERTIME'
          })
        }

        // 実働時間が労働時間を超過していないかチェック
        if (!isNaN(laborTime) && !isNaN(actualWorkTime) && actualWorkTime > laborTime) {
          warnings.push({
            field: `workers.${index}.actualWorkTime`,
            value: actualWorkTime,
            message: `作業者${index + 1}: 実働時間が労働時間を超過しています`,
            code: 'EXCEEDS_LABOR_TIME'
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// エラーハンドラークラス
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * エラーをログに記録
   */
  public logError(error: AppError): void {
    this.errorLog.push(error)
    
    // 重要度に応じた処理
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', error)
        this.notifyAdmin(error)
        break
      case ErrorSeverity.HIGH:
        console.error('🔴 HIGH SEVERITY ERROR:', error)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('🟡 MEDIUM SEVERITY ERROR:', error)
        break
      case ErrorSeverity.LOW:
        // eslint-disable-next-line no-console
        console.log('🟢 LOW SEVERITY ERROR:', error)
        break
    }

    // ローカルストレージに保存（開発用）
    try {
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      storedErrors.push({
        ...error,
        message: error.message,
        stack: error.stack
      })
      localStorage.setItem('app_errors', JSON.stringify(storedErrors.slice(-100))) // 最新100件を保持
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e)
    }
  }

  /**
   * 管理者への通知（実装に応じて）
   */
  private notifyAdmin(error: AppError): void {
    // 実装例: メール送信、Slack通知など
    console.warn('Admin notification required for critical error:', error.code)
  }

  /**
   * エラーログの取得
   */
  public getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  /**
   * エラーログのクリア
   */
  public clearErrorLog(): void {
    this.errorLog = []
    localStorage.removeItem('app_errors')
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを生成
   */
  public formatUserMessage(error: AppError): string {
    return error.userMessage || this.getDefaultUserMessage(error.type)
  }

  private getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return '入力内容に問題があります。確認してください。'
      case ErrorType.NETWORK:
        return 'ネットワーク接続に問題があります。しばらく待ってからお試しください。'
      case ErrorType.DATABASE:
        return 'データの保存中に問題が発生しました。'
      case ErrorType.AUTHENTICATION:
        return 'ログインが必要です。'
      case ErrorType.AUTHORIZATION:
        return 'この操作を実行する権限がありません。'
      case ErrorType.FILE_UPLOAD:
        return 'ファイルのアップロードに失敗しました。'
      case ErrorType.CALCULATION:
        return '計算処理中にエラーが発生しました。'
      case ErrorType.AI_SERVICE:
        return 'AI機能の利用中にエラーが発生しました。'
      default:
        return 'システムエラーが発生しました。管理者に連絡してください。'
    }
  }
}

// グローバルエラーハンドリング用のユーティリティ関数
export const handleError = (error: Error | AppError, contextData?: Record<string, unknown>): void => {
  const errorHandler = ErrorHandler.getInstance()

  if (error instanceof AppError) {
    errorHandler.logError(error)
  } else {
    const appError = new AppError({
      message: error.message,
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      code: 'UNHANDLED_ERROR',
      userMessage: 'システムエラーが発生しました',
      technicalDetails: {
        stack: error.stack,
        name: error.name
      },
      contextData
    })
    errorHandler.logError(appError)
  }
}

// React用エラーバウンダリで使用するエラー処理
export const handleReactError = (error: Error, errorInfo: Record<string, unknown>): void => {
  const appError = new AppError({
    message: error.message,
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.HIGH,
    code: 'REACT_ERROR_BOUNDARY',
    userMessage: 'アプリケーションでエラーが発生しました。ページを再読み込みしてください。',
    technicalDetails: {
      stack: error.stack,
      errorInfo
    }
  })
  
  ErrorHandler.getInstance().logError(appError)
}

// 非同期処理用エラーハンドラー
export const asyncErrorHandler = <T>(
  fn: (...args: unknown[]) => Promise<T>
) => async (...args: unknown[]): Promise<T | null> => {
  try {
    return await fn(...args)
  } catch (error) {
    handleError(error as Error, { functionArgs: args })
    return null
  }
}

// バリデーションエラーを AppError に変換
export const createValidationError = (
  validationResult: ValidationResult,
  contextData?: Record<string, unknown>
): AppError | null => {
  if (validationResult.isValid) return null

  const firstError = validationResult.errors[0]

  if (!firstError) {
    throw new Error('Validation errors array is empty')
  }

  return new AppError({
    message: `Validation failed: ${firstError.message}`,
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    code: firstError.code,
    userMessage: firstError.message,
    technicalDetails: {
      allErrors: validationResult.errors,
      warnings: validationResult.warnings
    },
    contextData
  })
}

// エラーハンドラーのシングルトンインスタンス
export const errorHandler = ErrorHandler.getInstance()