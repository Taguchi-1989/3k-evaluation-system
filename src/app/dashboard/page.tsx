'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/LoadingSkeletons'

const EnhancedDashboard = dynamic(() => import('@/components/dashboard').then(mod => ({ default: mod.EnhancedDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
})

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <EnhancedDashboard />
    </Suspense>
  )
}