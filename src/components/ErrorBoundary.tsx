'use client'

import React, { Component, ReactNode } from 'react'
import { handleReactError, ErrorHandler } from '@/lib/errorHandling'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーを記録
    handleReactError(error, errorInfo as Record<string, unknown>)
    
    // プロップスで渡されたエラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReportError = () => {
    const errorHandler = ErrorHandler.getInstance()
    const errorLog = errorHandler.getErrorLog()
    
    // エラーレポート生成（実際の実装では管理者に送信）
    const reportData = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      recentErrors: errorLog.slice(-5)
    }
    
    // eslint-disable-next-line no-console
    console.log('エラーレポート:', reportData)
    alert('エラーレポートが生成されました（開発モード）')
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="card p-8 text-center">
              {/* エラーアイコン */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* エラーメッセージ */}
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                システムエラーが発生しました
              </h1>
              
              <p className="text-gray-600 mb-6">
                申し訳ございません。予期しないエラーが発生しました。
                以下のボタンから復旧をお試しください。
              </p>

              {/* エラー詳細（開発モード時のみ） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded text-left">
                  <details>
                    <summary className="cursor-pointer font-medium text-sm text-gray-700 mb-2">
                      エラー詳細（開発モード）
                    </summary>
                    <div className="text-xs text-gray-600 font-mono">
                      <div className="mb-2">
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div className="mb-2">
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* アクションボタン */}
              <div className="space-y-3">
                {this.state.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    variant="primary"
                    className="w-full"
                  >
                    再試行 ({this.maxRetries - this.state.retryCount}回まで)
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  ページを再読み込み
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="ghost"
                  className="w-full"
                >
                  ホームに戻る
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="ghost"
                  className="w-full text-sm"
                  size="sm"
                >
                  エラーレポート生成
                </Button>
              </div>

              {/* 試行回数の表示 */}
              {this.state.retryCount > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  試行回数: {this.state.retryCount}/{this.maxRetries}
                </div>
              )}
            </div>

            {/* サポート情報 */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>問題が解決しない場合は、管理者までお問い合わせください。</p>
              {this.state.errorId && (
                <p className="mt-1 font-mono text-xs">
                  エラーID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 関数型コンポーネントとして使用するためのラッパー
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}