'use client'

import React, { Suspense } from 'react'
import { EvaluationListView } from '@/components/evaluation'

function EvaluationListPageContent(): React.JSX.Element {
  const handleItemSelect = (itemId: string) => {
    window.location.href = `/evaluation/${itemId}`
  }

  return (
    <div className="bg-gray-800 flex items-center justify-center min-h-screen p-4">
      <EvaluationListView onItemSelect={handleItemSelect} />
    </div>
  )
}

export default function EvaluationListPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="bg-gray-800 flex items-center justify-center min-h-screen p-4">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    }>
      <EvaluationListPageContent />
    </Suspense>
  )
}