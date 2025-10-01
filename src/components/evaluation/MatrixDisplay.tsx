'use client'

import React, { useState } from 'react'
import matrixData from '@/data/evaluation-matrix.json'
import type { EvaluationMatrixData, ComprehensiveMatrixData, RULAMatrixData } from '@/types/evaluation-matrix'

export interface MatrixDisplayProps {
  title?: string
  type?: 'COMPREHENSIVE' | 'RULA' | 'OWAS' | 'NIOSH'
  selectedRow?: string
  selectedCol?: string
  onCellClick?: (row: string, col: string, value: number) => void
  onScoreChange?: (score: number) => void
  className?: string
}

export function MatrixDisplay({
  title,
  type = 'COMPREHENSIVE',
  selectedRow: _selectedRow,  // 将来実装予定: 選択行のハイライト表示
  selectedCol: _selectedCol,  // 将来実装予定: 選択列のハイライト表示
  onCellClick,
  onScoreChange,
  className = ''
}: MatrixDisplayProps): React.JSX.Element {
  const [highlightedCell, setHighlightedCell] = useState<{ posture: string, duration: string, strength: number } | null>(null)

  // JSONデータから該当する評価タイプのデータを取得
  const evalData = matrixData as unknown as EvaluationMatrixData
  const currentMatrix = evalData[type] as ComprehensiveMatrixData | RULAMatrixData | undefined
  const displayTitle = title || (currentMatrix && 'name' in currentMatrix ? String(currentMatrix.name) : '')

  if (!currentMatrix) {
    return <div className="p-4 text-center text-red-500">評価データが見つかりません</div>
  }

  // OWAS特殊処理 - 新しい4次元マトリックス構造
  if (type === 'OWAS') {
    return (
      <div className={`text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-600 flex-grow flex flex-col ${className}`}>
        <div className="mb-3 text-center">
          <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">{displayTitle}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">OWAS評価は専用コンポーネントを使用してください</p>
        </div>
        <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
          OWASMatrixコンポーネントを使用
        </div>
      </div>
    )
  }

  // 従来のマトリックス形式（RULA, NIOSH）の処理
  if (type !== 'COMPREHENSIVE') {
    const matrix = currentMatrix as RULAMatrixData

    const handleCellClick = (rowIndex: number, colIndex: number, value: number): void => {
      const row = matrix.rows[rowIndex]
      const col = matrix.columns[colIndex]
      if (row && col) {
        onCellClick?.(row, col, value)
      }
      onScoreChange?.(value)
    }

    const getCellClasses = (value: number): string => {
      const scoreStr = value.toString()
      const colorClass = matrix.scoreColors[scoreStr] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700'

      const baseClasses = 'cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xs font-bold border border-gray-200 dark:border-gray-600 min-h-[32px] p-1'
      const highlightClass = 'hover:scale-105 hover:shadow-md'

      return `${baseClasses} ${colorClass} ${highlightClass}`
    }

    return (
      <div className={`text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-600 flex-grow flex flex-col ${className}`}>
        <div className="mb-3 text-center">
          <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">{displayTitle}</p>
          {currentMatrix && 'description' in currentMatrix && currentMatrix.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{String(currentMatrix.description)}</p>
          )}
        </div>
        
        <div className="flex-grow overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs min-w-[60px]"></th>
                {matrix.columns.map((col, colIndex) => (
                  <th key={colIndex} className="border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs min-w-[60px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium min-w-[60px]">
                    {row}
                  </td>
                  {matrix.matrix[rowIndex]?.map((value, colIndex) => {
                    const scoreStr = value.toString()
                    const label = matrix.scoreLabels[scoreStr] ?? value.toString()

                    return (
                      <td
                        key={colIndex}
                        className={getCellClasses(value)}
                        onClick={() => { handleCellClick(rowIndex, colIndex, value) }}
                        title={`${label} (${value})`}
                      >
                        <div className="font-bold">{value}</div>
                        <div className="text-[9px] leading-none">{label}</div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // マトリックス評価（COMPREHENSIVE）の処理
  const comprehensiveMatrix = currentMatrix as ComprehensiveMatrixData

  const handleComprehensiveCellClick = (posture: string, duration: string, strengthIndex: number, value: number): void => {
    setHighlightedCell({ posture, duration, strength: strengthIndex })
    onCellClick?.(posture, duration, value)
    onScoreChange?.(value)
  }

  const getCellClasses = (value: number, posture: string, duration: string, strengthIndex: number): string => {
    const isHighlighted = highlightedCell?.posture === posture &&
                         highlightedCell?.duration === duration &&
                         highlightedCell?.strength === strengthIndex
    const scoreStr = value.toString()
    const colorClass = comprehensiveMatrix.scoreColors[scoreStr] ?? 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700'

    const baseClasses = 'cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-gray-600 min-h-[44px] p-1 matrix-button'
    const highlightClass = isHighlighted ? 'ring-4 ring-yellow-400 dark:ring-yellow-300 scale-110 z-10 bg-yellow-200 dark:bg-yellow-800 shadow-lg border-yellow-500 dark:border-yellow-400' : 'hover:scale-105 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-600'

    return `${baseClasses} ${colorClass} ${highlightClass}`
  }

  return (
    <div className={`text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-600 flex-grow flex flex-col evaluation-matrix-mobile mobile-chrome-visible ${className}`}>
      <div className="mb-3 text-center">
        <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">{displayTitle}</p>
        {comprehensiveMatrix.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{comprehensiveMatrix.description}</p>
        )}
      </div>

      {/* マトリックス評価 */}
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-[auto_auto_1fr_1fr_1fr_1fr_1fr] gap-1 text-center text-[9px]">
          {/* Column Headers */}
          <div className="col-span-2"></div>
          {comprehensiveMatrix.strengthLevels.map((strength, index) => (
            <div key={index} className="font-bold text-gray-800 dark:text-gray-200">{strength}</div>
          ))}

          {/* Matrix Content */}
          {comprehensiveMatrix.postureGroups.map((posture, postureIndex) => {
            const rows: React.JSX.Element[] = []

            comprehensiveMatrix.durationLevels.forEach((duration, durationIndex) => {
              const isFirstDurationForPosture = durationIndex === 0

              const row = (
                <React.Fragment key={`${postureIndex}-${durationIndex}`}>
                  {isFirstDurationForPosture && (
                    <div
                      className="border-r-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                      style={{ gridRow: `span ${comprehensiveMatrix.durationLevels.length}` }}
                    >
                      <div className="text-[10px] font-bold -rotate-90 whitespace-nowrap text-gray-800 dark:text-gray-200">
                        {posture}
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] font-bold self-center border-r pr-1 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-1">
                    {duration}
                  </div>
                  {comprehensiveMatrix.matrix[posture]?.[duration]?.map((value, strengthIndex) => (
                    <div
                      key={strengthIndex}
                      className={getCellClasses(value, posture, duration, strengthIndex)}
                      onClick={() => { handleComprehensiveCellClick(posture, duration, strengthIndex, value) }}
                      title={`${posture} × ${duration} × ${comprehensiveMatrix.strengthLevels[strengthIndex] ?? ''}: ${value}`}
                    >
                      {value}
                    </div>
                  ))}
                </React.Fragment>
              )

              rows.push(row)
            })

            return rows
          }).flat()}
        </div>
      </div>

      {/* 選択されたセルの情報 */}
      {highlightedCell && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
          <p className="text-gray-800 dark:text-gray-200">
            選択: <span className="font-medium">{highlightedCell.posture} × {highlightedCell.duration} × {comprehensiveMatrix.strengthLevels[highlightedCell.strength] ?? ''}</span> =
            <span className="font-bold ml-1 text-blue-600 dark:text-blue-400">
              {comprehensiveMatrix.matrix[highlightedCell.posture]?.[highlightedCell.duration]?.[highlightedCell.strength]}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}