'use client'

import UnifiedHeader from '@/components/layout/UnifiedHeader'
import { Footer } from '@/components/layout/Footer'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// 動的インポートでコード分割
const AppHome = dynamic(() => import('@/components/evaluation').then(mod => ({ default: mod.AppHome })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: true
})

export default function Home() {
  const { setCurrentPath, clearHistory } = useEvaluationStore()

  useEffect(() => {
    setCurrentPath('/')
    clearHistory()
  }, [setCurrentPath, clearHistory])

  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedHeader
        title="3K評価システム"
        variant="home"
      />

      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AppHome />
        </Suspense>
      </main>

      <Footer variant="app" />
    </div>
  )
}
