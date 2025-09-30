'use client'

import { Button } from '@/components/ui'

export interface FactorItem {
  id: string
  name: string
  score: number | string
  colorScheme: 'green' | 'lime' | 'blue' | 'gray' | 'orange' | 'red'
  onDetailClick?: () => void
}

export interface FactorListProps {
  factors?: FactorItem[]
  className?: string
}

const defaultFactors: FactorItem[] = [
  { id: 'physical', name: '肉体因', score: 4, colorScheme: 'green' },
  { id: 'mental', name: '精神因', score: 2, colorScheme: 'green' },
  { id: 'environmental', name: '環境因', score: 1, colorScheme: 'lime' },
  { id: 'hazard', name: '危険因', score: '-', colorScheme: 'gray' },
  { id: 'worktime', name: '作業時間', score: 'd', colorScheme: 'blue' }
]

export function FactorList({
  factors = defaultFactors,
  className = ''
}: FactorListProps) {
  
  const getColorClasses = (colorScheme: string) => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700',
        indicator: 'bg-green-500 dark:bg-green-400',
        score: 'text-green-700 dark:text-green-300'
      },
      lime: {
        bg: 'bg-lime-50 dark:bg-lime-900/20',
        border: 'border-lime-200 dark:border-lime-700',
        indicator: 'bg-lime-400 dark:bg-lime-300',
        score: 'text-lime-700 dark:text-lime-300'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-700',
        indicator: 'bg-blue-500 dark:bg-blue-400',
        score: 'text-blue-700 dark:text-blue-300'
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-600',
        indicator: 'bg-gray-400 dark:bg-gray-500',
        score: 'text-gray-500 dark:text-gray-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-700',
        indicator: 'bg-orange-500 dark:bg-orange-400',
        score: 'text-orange-700 dark:text-orange-300'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700',
        indicator: 'bg-red-500 dark:bg-red-400',
        score: 'text-red-700 dark:text-red-300'
      }
    }
    
    return colorMap[colorScheme as keyof typeof colorMap] || colorMap.gray
  }

  return (
    <div className={`w-1/3 flex flex-col h-full space-y-3 overflow-y-auto pr-2 ${className}`}>
      {factors.map((factor) => {
        const colors = getColorClasses(factor.colorScheme)
        
        return (
          <div 
            key={factor.id}
            className={`flex items-center p-2 ${colors.bg} border ${colors.border} rounded-lg shadow-sm flex-shrink-0`}
          >
            <div className={`w-3 h-8 ${colors.indicator} rounded-full`}></div>
            <span className="ml-3 text-base font-semibold text-gray-800 dark:text-gray-200 flex-grow">
              {factor.name}
            </span>
            <span className={`text-base font-bold ${colors.score} mr-3`}>
              {factor.score}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs border-none bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-none p-0"
              onClick={factor.onDetailClick}
            >
              詳細入力 →
            </Button>
          </div>
        )
      })}
    </div>
  )
}