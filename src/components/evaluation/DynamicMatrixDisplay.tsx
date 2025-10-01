'use client'

import { useState, useEffect } from 'react'
import type { EvaluationMatrix} from '@/data/evaluationMatrices';
import { getMatrix } from '@/data/evaluationMatrices'
import type { MatrixCalculationResult } from '@/lib/matrixCalculator';
import { matrixCalculator } from '@/lib/matrixCalculator'

export interface DynamicMatrixDisplayProps {
  category: 'physical' | 'mental' | 'environmental' | 'hazard'
  selectedX?: string
  selectedY?: string
  onCellClick?: (x: string, y: string, result: MatrixCalculationResult) => void
  onScoreChange?: (score: number, result: MatrixCalculationResult) => void
  className?: string
  showStatistics?: boolean
  showRecommendations?: boolean
}

export function DynamicMatrixDisplay({
  category,
  selectedX,
  selectedY,
  onCellClick,
  onScoreChange,
  className = '',
  showStatistics = false,
  showRecommendations = true
}: DynamicMatrixDisplayProps) {
  const [matrix, setMatrix] = useState<EvaluationMatrix | null>(null)
  const [highlightedCell, setHighlightedCell] = useState<{ x: string; y: string } | null>(null)
  const [currentResult, setCurrentResult] = useState<MatrixCalculationResult | null>(null)
  const [statistics, setStatistics] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const matrixData = getMatrix(category)
    setMatrix(matrixData)
    
    if (showStatistics) {
      try {
        const stats = matrixCalculator.getMatrixStatistics(category)
        setStatistics(stats)
      } catch (error) {
        console.warn('Statistics not available:', error)
      }
    }
  }, [category, showStatistics])

  useEffect(() => {
    if (selectedX && selectedY && matrix) {
      try {
        const result = matrixCalculator.calculateFromMatrix({
          category,
          xValue: selectedX,
          yValue: selectedY
        })
        setCurrentResult(result)
        setHighlightedCell({ x: selectedX, y: selectedY })
        onScoreChange?.(result.score, result)
      } catch (error) {
        console.warn('Matrix calculation failed:', error)
      }
    }
  }, [selectedX, selectedY, matrix, category, onScoreChange])

  if (!matrix) {
    return (
      <div className={`p-4 text-center text-red-500 ${className}`}>
        評価マトリックスが見つかりません: {category}
      </div>
    )
  }

  const handleCellClick = (xValue: string, yValue: string) => {
    try {
      const result = matrixCalculator.calculateFromMatrix({
        category,
        xValue,
        yValue
      })
      
      setHighlightedCell({ x: xValue, y: yValue })
      setCurrentResult(result)
      onCellClick?.(xValue, yValue, result)
      onScoreChange?.(result.score, result)
    } catch (error) {
      console.error('Matrix calculation error:', error)
    }
  }

  const getCellClasses = (xValue: string, yValue: string, score: number) => {
    const isHighlighted = highlightedCell?.x === xValue && highlightedCell?.y === yValue
    const colorScheme = matrix.colorScheme[score]
    
    const baseClasses = 'cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xs font-bold border border-gray-200 dark:border-gray-600 min-h-[32px] p-1'
    
    let colorClasses = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    if (colorScheme) {
      colorClasses = `${colorScheme.background} ${colorScheme.text}`
    }
    
    const highlightClass = isHighlighted ? 'ring-4 ring-yellow-400 dark:ring-yellow-300 scale-110 z-10 bg-yellow-200 dark:bg-yellow-800 shadow-lg border-yellow-500 dark:border-yellow-400' : 'hover:scale-105 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-600'
    
    return `${baseClasses} ${colorClasses} ${highlightClass}`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'high': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      case 'critical': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  return (
    <div className={`text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-600 flex-grow flex flex-col ${className}`}>
      {/* ヘッダー */}
      <div className="mb-3 text-center">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
          {matrix.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {matrix.description}
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          バージョン: {matrix.version} | 有効日: {matrix.effectiveDate}
        </div>
      </div>

      {/* マトリックステーブル */}
      <div className="flex-grow overflow-auto mb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs min-w-[80px]">
                <div className="font-bold">{matrix.yAxis.name}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                  {matrix.xAxis.name} →
                </div>
              </th>
              {matrix.xAxis.values.map((xAxisItem) => (
                <th 
                  key={xAxisItem.id} 
                  className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs min-w-[60px]"
                  title={xAxisItem.description}
                >
                  <div className="font-bold">{xAxisItem.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.yAxis.values.map((yAxisItem) => (
              <tr key={yAxisItem.id}>
                <td 
                  className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium min-w-[80px]"
                  title={yAxisItem.description}
                >
                  {yAxisItem.label}
                </td>
                {matrix.xAxis.values.map((xAxisItem) => {
                  const cell = matrix.matrix[yAxisItem.id]?.[xAxisItem.id]
                  if (!cell) return (
                    <td key={`${yAxisItem.id}-${xAxisItem.id}`} className="border border-gray-300 dark:border-gray-600 p-1 text-center">
                      -
                    </td>
                  )

                  return (
                    <td
                      key={`${yAxisItem.id}-${xAxisItem.id}`}
                      className={getCellClasses(xAxisItem.id, yAxisItem.id, cell.value)}
                      onClick={() => handleCellClick(xAxisItem.id, yAxisItem.id)}
                      title={`${yAxisItem.label} × ${xAxisItem.label} = ${cell.value}${cell.description ? ` (${cell.description})` : ''}`}
                    >
                      <div className="font-bold text-sm">{cell.value}</div>
                      {matrix.colorScheme[cell.value] && (
                        <div className="text-[9px] leading-none mt-0.5">
                          {matrix.colorScheme[cell.value]?.level ?? ''}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 統計情報 */}
      {showStatistics && statistics && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-xs text-gray-700 dark:text-gray-300">
            <div className="font-bold mb-1">統計情報</div>
            <div className="grid grid-cols-2 gap-2">
              <div>総セル数: {String(statistics.totalCells)}</div>
              <div>平均スコア: {(statistics.averageScore as number).toFixed(1)}</div>
              <div>最小スコア: {String(statistics.minScore)}</div>
              <div>最大スコア: {String(statistics.maxScore)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 選択されたセルの情報 */}
      {currentResult && highlightedCell && (
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-xs text-gray-800 dark:text-gray-200">
              <div className="font-bold mb-1">選択されたセル</div>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">座標:</span> {highlightedCell.y} × {highlightedCell.x}
                </div>
                <div className="flex items-center">
                  <span className="font-medium">スコア:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getLevelColor(currentResult.metadata.level)}`}>
                    {currentResult.score} ({currentResult.metadata.level})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨事項 */}
          {showRecommendations && currentResult.metadata.recommendations && currentResult.metadata.recommendations.length > 0 && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="text-xs text-gray-800 dark:text-gray-200">
                <div className="font-bold mb-1">推奨事項</div>
                <ul className="space-y-1">
                  {currentResult.metadata.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 dark:text-yellow-400 mr-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* マトリックスルール */}
      {matrix.rules && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="text-xs text-gray-700 dark:text-gray-300">
            <div className="font-bold mb-1">計算ルール</div>
            {matrix.rules.calculation && (
              <div className="mb-1">
                <span className="font-medium">計算式:</span> {matrix.rules.calculation}
              </div>
            )}
            {matrix.rules.validation && (
              <div className="mb-1">
                <span className="font-medium">検証項目:</span>
                <ul className="ml-2">
                  {matrix.rules.validation.map((rule, index) => (
                    <li key={index} className="text-[10px]">• {rule}</li>
                  ))}
                </ul>
              </div>
            )}
            {matrix.rules.notes && (
              <div>
                <span className="font-medium">注意事項:</span>
                <ul className="ml-2">
                  {matrix.rules.notes.map((note, index) => (
                    <li key={index} className="text-[10px]">• {note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}