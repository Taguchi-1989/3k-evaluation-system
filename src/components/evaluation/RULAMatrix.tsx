'use client'

import React, { useState } from 'react'
import matrixData from '@/data/evaluation-matrix.json'
import { TabInterface } from '@/components/ui'

export interface RULAMatrixProps {
  onSelectionChange?: (score: number) => void
  className?: string
}

export function RULAMatrix({
  onSelectionChange,
  className = ''
}: RULAMatrixProps) {
  const [selectedTabA, setSelectedTabA] = useState<number>(3) // 上肢・手首スコア
  const [selectedTabB, setSelectedTabB] = useState<number>(3) // 首・体幹・脚スコア
  const [highlightedCell, setHighlightedCell] = useState<{ row: number, col: number } | null>(null)
  
  const rulaMatrix = matrixData.RULA

  const handleCellClick = (rowIndex: number, colIndex: number, value: number) => {
    setHighlightedCell({ row: rowIndex, col: colIndex })
    onSelectionChange?.(value)
  }

  const getCellClasses = (value: number, rowIndex: number, colIndex: number) => {
    const isHighlighted = highlightedCell?.row === rowIndex && highlightedCell?.col === colIndex
    const scoreStr = value.toString()
    const scoreColors = rulaMatrix.scoreColors as Record<string, string>
    const colorClass = scoreColors[scoreStr] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700'
    
    const baseClasses = 'cursor-pointer transition-all duration-200 flex items-center justify-center text-sm font-bold border border-gray-300 dark:border-gray-600 min-h-[40px] p-2'
    const highlightClass = isHighlighted ? 'ring-2 ring-blue-500 scale-105 z-10' : 'hover:scale-105 hover:shadow-md'
    
    return `${baseClasses} ${colorClass} ${highlightClass}`
  }

  // Tab A: 上肢・手首評価
  const tabAContent = (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <h3 className="font-bold text-sm mb-3">A: 上肢・手首評価</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">上腕姿勢スコア (1-6)</label>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={selectedTabA}
              onChange={(e) => setSelectedTabA(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1 (良好)</span>
              <span>{selectedTabA}</span>
              <span>6 (悪い)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
              <p className="font-medium">現在の評価:</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">スコア {selectedTabA}</p>
            </div>
            <div className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
              <p className="font-medium">姿勢分類:</p>
              <p className="text-sm">
                {selectedTabA <= 2 ? '良好' : selectedTabA <= 4 ? '中程度' : '要改善'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Tab B: 首・体幹・脚評価
  const tabBContent = (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
        <h3 className="font-bold text-sm mb-3">B: 首・体幹・脚評価</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">首・体幹・脚スコア (1-7)</label>
            <input 
              type="range" 
              min="1" 
              max="7" 
              value={selectedTabB}
              onChange={(e) => setSelectedTabB(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1 (良好)</span>
              <span>{selectedTabB}</span>
              <span>7 (悪い)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
              <p className="font-medium">現在の評価:</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">スコア {selectedTabB}</p>
            </div>
            <div className="p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
              <p className="font-medium">姿勢分類:</p>
              <p className="text-sm">
                {selectedTabB <= 2 ? '良好' : selectedTabB <= 4 ? '中程度' : '要改善'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'tabA', label: 'A: 上肢・手首', content: tabAContent },
    { id: 'tabB', label: 'B: 首・体幹・脚', content: tabBContent }
  ]

  // 選択されたスコアに基づいてマトリックスの該当セルを計算
  const rowIndex = Math.min(selectedTabA - 1, rulaMatrix.matrix.length - 1)
  const colIndex = Math.min(selectedTabB - 1, rulaMatrix.matrix[0]?.length ?? 1 - 1)
  const finalScore = rulaMatrix.matrix[rowIndex]?.[colIndex]

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* 左側: タブインターフェース */}
        <div className="flex flex-col">
          <TabInterface tabs={tabs} defaultTab="tabA" />
        </div>

        {/* 右側: RULAマトリックス表示 */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 p-4 h-full overflow-auto">
            <h3 className="font-bold text-sm mb-3">RULA評価マトリックス</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-xs">
                      A＼B
                    </th>
                    {rulaMatrix.columns.map((col, idx) => (
                      <th 
                        key={idx} 
                        className={`border border-gray-300 dark:border-gray-600 p-2 text-xs ${
                          idx === colIndex ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rulaMatrix.matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className={`border border-gray-300 dark:border-gray-600 p-2 font-medium text-xs ${
                        rIdx === rowIndex ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {rulaMatrix.rows[rIdx]}
                      </td>
                      {row.map((value, cIdx) => {
                        const isSelected = rIdx === rowIndex && cIdx === colIndex
                        return (
                          <td
                            key={cIdx}
                            className={getCellClasses(value, rIdx, cIdx)}
                            onClick={() => handleCellClick(rIdx, cIdx, value)}
                            style={{ opacity: isSelected ? 1 : 0.7 }}
                          >
                            <div className="text-center">
                              <div className="font-bold">{value}</div>
                              {isSelected && (
                                <div className="text-[10px] mt-1">
                                  {(rulaMatrix.scoreLabels as Record<string, string>)[value.toString()]}
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 最終スコア表示 */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">最終RULAスコア:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    A({selectedTabA}) × B({selectedTabB}) = 
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${
                    (finalScore ?? 1) <= 2 ? 'text-green-600' :
                    (finalScore ?? 1) <= 4 ? 'text-yellow-600' :
                    (finalScore ?? 1) <= 6 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {finalScore ?? '-'}
                  </p>
                  <p className="text-xs mt-1">{finalScore ? (rulaMatrix.scoreLabels as Record<string, string>)[finalScore.toString()] : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}