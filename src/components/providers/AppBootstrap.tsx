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

  // エラーが発生してもページは表示する（adaptersなしで動作）
  if (error) {
    console.error('Adapters initialization error:', error)
    // エラーでもchildrenを表示してページが使えるようにする
  }

  // アダプターがロード中でもページコンテンツを表示
  // アダプターが必要な機能は初期化後に有効になる
  return <AppProvider adapters={adapters}>{children}</AppProvider>
}