'use client'

import { EvaluationListView } from '@/components/evaluation'

export default function EvaluationListPage() {
  const handleItemSelect = (itemId: string) => {
    window.location.href = `/evaluation/${itemId}`
  }

  return (
    <div className="bg-gray-800 flex items-center justify-center min-h-screen p-4">
      <EvaluationListView onItemSelect={handleItemSelect} />
    </div>
  )
}