'use client'

import React, { Suspense } from 'react'
import { EvaluationMain } from '@/components/evaluation'
import { AspectContainer } from '@/components/ui'

function NewEvaluationPageContent(): React.JSX.Element {
  return (
    <AspectContainer includeBackground={true}>
      <EvaluationMain />
    </AspectContainer>
  )
}

export default function NewEvaluationPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <NewEvaluationPageContent />
    </Suspense>
  )
}