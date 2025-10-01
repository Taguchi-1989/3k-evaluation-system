'use client'

/**
 * AppContext - アプリケーションコアをReactで使用するためのContext
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppCore } from '@3k/core'
import type { Adapters } from '@3k/adapters-web'

interface AppContextValue {
  app: AppCore | null
  isInitialized: boolean
  error: Error | null
}

const AppContext = createContext<AppContextValue>({
  app: null,
  isInitialized: false,
  error: null
})

export function useApp() {
  const context = useContext(AppContext)
  if (!context.isInitialized) {
    throw new Error('App not initialized. Make sure AppProvider is mounted.')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
  adapters: Adapters | null
}

export function AppProvider({ children, adapters }: AppProviderProps) {
  const [app, setApp] = useState<AppCore | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!adapters) return

    async function initializeApp() {
      try {
        // adaptersがnullの場合は何もしない
        if (!adapters) return

        // 動的インポートでbootstrap関数を取得
        const { bootstrap } = await import('@3k/core')
        const appCore = await bootstrap(adapters)
        setApp(appCore)
        setIsInitialized(true)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to initialize app:', err)
      }
    }

    void initializeApp()
  }, [adapters])

  return (
    <AppContext.Provider value={{ app, isInitialized, error }}>
      {children}
    </AppContext.Provider>
  )
}