'use client'

import React from 'react'
import { EnhancedDashboard } from '@/components/dashboard'

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sr-only">
        <h1>ダッシュボード</h1>
      </header>
      <EnhancedDashboard />
    </div>
  )
}