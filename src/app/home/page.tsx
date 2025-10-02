'use client'

import React, { Suspense } from 'react'
import { AppHome } from '@/components/evaluation'
import { AspectContainer } from '@/components/ui'

function HomePageContent(): React.JSX.Element {
  const handleNavigate = (destination: string) => {
    switch (destination) {
      case 'new-evaluation':
        window.location.href = '/evaluation/new'
        break
      case 'view-evaluations':
        window.location.href = '/evaluation/list'
        break
      case 'dashboard':
        window.location.href = '/dashboard'
        break
      default:
        // Unknown destination, no action needed
    }
  }

  return (
    <AspectContainer includeBackground={true}>
      <AppHome onNavigate={handleNavigate} />
    </AspectContainer>
  )
}

export default function HomePage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}