'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

export interface Posture {
  id: string
  name: string
  description: string
  score: number
  isSelected?: boolean
}

export interface PostureListProps {
  postures?: Posture[]
  onPostureSelect?: (postureId: string) => void
  onAddPosture?: () => void
  className?: string
}

const defaultPostures: Posture[] = [
  {
    id: '1',
    name: '姿勢A (立位・軽作業)',
    description: '肉体因: 2',
    score: 2,
    isSelected: false
  },
  {
    id: '2', 
    name: '姿勢B (中腰・重量物)',
    description: '肉体因: 4',
    score: 4,
    isSelected: true
  },
  {
    id: '3',
    name: '姿勢C (座位・PC作業)',
    description: '肉体因: 1', 
    score: 1,
    isSelected: false
  }
]

export function PostureList({
  postures = defaultPostures,
  onPostureSelect,
  onAddPosture,
  className = ''
}: PostureListProps) {
  const [selectedId, setSelectedId] = useState(
    postures.find(p => p.isSelected)?.id || postures[0]?.id
  )

  const handlePostureClick = (postureId: string) => {
    setSelectedId(postureId)
    onPostureSelect?.(postureId)
  }

  return (
    <div className={`flex-grow flex flex-col border rounded-lg p-2 space-y-2 ${className}`}>
      <h2 className="text-sm font-bold flex-shrink-0">作業姿勢一覧</h2>
      
      <div className="flex-grow overflow-y-auto pr-1 space-y-1 text-xs">
        {postures.map((posture) => (
          <div
            key={posture.id}
            className={`p-2 rounded-md border cursor-pointer transition-colors ${
              selectedId === posture.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => handlePostureClick(posture.id)}
          >
            <p className="font-bold flex items-center">{posture.name}</p>
            <p className="text-gray-600">{posture.description}</p>
          </div>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="text-[11px] font-medium px-2.5 py-1 flex items-center justify-center flex-shrink-0"
        onClick={onAddPosture}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        新しい姿勢を追加
      </Button>
    </div>
  )
}