'use client'

/**
 * AppBootstrap - Webアダプターを初期化してAppProviderに渡す
 */

import { useEffect, useState } from 'react'
import { AppProvider } from '@/contexts/AppContext'
import type { Adapters } from '@3k/adapters-web'

interface AppBootstrapProps {
  children: React.ReactNode
}

export function AppBootstrap({ children }: AppBootstrapProps) {
  const [adapters, setAdapters] = useState<Adapters | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function initializeAdapters() {
      try {
        // 動的インポートでWebアダプター取得
        const { createWebAdapters } = await import('@3k/adapters-web')
        const webAdapters = await createWebAdapters()
        setAdapters(webAdapters)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to initialize adapters:', err)
      }
    }

    void initializeAdapters()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">初期化エラー</h1>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!adapters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">アプリケーションを初期化中...</p>
        </div>
      </div>
    )
  }

  return <AppProvider adapters={adapters}>{children}</AppProvider>
}