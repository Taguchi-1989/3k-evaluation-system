'use client'

import React from 'react'
import { EvaluationListView } from '@/components/evaluation'

export default function EvaluationListPage(): React.JSX.Element {
  const handleItemSelect = (itemId: string) => {
    window.location.href = `/evaluation/${itemId}`
  }

  return (
    <div className="bg-gray-800 flex items-center justify-center min-h-screen p-4">
      <EvaluationListView onItemSelect={handleItemSelect} />
    </div>
  )
}