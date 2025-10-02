'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons'

const EnhancedDashboard = dynamic(() => import('@/components/dashboard').then(mod => ({ default: mod.EnhancedDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
})

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sr-only">
        <h1>ダッシュボード</h1>
      </header>
      <Suspense fallback={<DashboardSkeleton />}>
        <EnhancedDashboard />
      </Suspense>
    </div>
  )
}