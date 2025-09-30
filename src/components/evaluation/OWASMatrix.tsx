'use client'

import React, { useState, useEffect } from 'react'
import matrixData from '@/data/evaluation-matrix.json'

export interface OWASMatrixProps {
  selectedBack?: string
  selectedArms?: string  
  selectedLegs?: string
  selectedLoad?: string
  onSelectionChange?: (back: string, arms: string, legs: string, load: string, score: number) => void
  className?: string
}

export function OWASMatrix({
  selectedBack = '1',
  selectedArms = '1', 
  selectedLegs = '3',
  selectedLoad = '1',
  onSelectionChange,
  className = ''
}: OWASMatrixProps) {
  const [selections, setSelections] = useState({
    back: selectedBack,
    arms: selectedArms,
    legs: selectedLegs,
    load: selectedLoad
  })

  const owasData = matrixData.OWAS as any

  // Calculate score based on current selections
  const calculateScore = () => {
    if (owasData.matrix && owasData.matrix[selections.back] && owasData.matrix[selections.back][selections.arms]) {
      const legMatrix = owasData.matrix[selections.back][selections.arms]
      const legIndex = parseInt(selections.legs) - 1
      const loadIndex = parseInt(selections.load) - 1
      
      if (legMatrix[legIndex] && legMatrix[legIndex][loadIndex] !== undefined) {
        return legMatrix[legIndex][loadIndex]
      }
    }
    return 1
  }

  const currentScore = calculateScore()

  useEffect(() => {
    onSelectionChange?.(selections.back, selections.arms, selections.legs, selections.load, currentScore)
  }, [selections, currentScore, onSelectionChange])

  const handleOptionClick = (group: string, code: string) => {
    setSelections(prev => ({ ...prev, [group]: code }))
  }

  const renderMatrix = () => {
    if (!owasData.matrix) return null

    const matrix = owasData.matrix
    const html = []

    // Header row
    html.push(
      <div key="header" className="contents">
        <div className="col-span-2"></div>
        {owasData.legPostures.map((legs: string, legIndex: number) => (
          <div key={`leg-header-${legs}`} className="col-span-3 font-bold bg-gray-100 dark:bg-gray-700 text-center text-xs p-1 border border-gray-300 dark:border-gray-600">
            ③-{legs}
          </div>
        ))}
      </div>
    )

    // Sub-header row for loads
    html.push(
      <div key="sub-header" className="contents">
        <div className="col-span-2"></div>
        {owasData.legPostures.map((legs: string, legIndex: number) => 
          owasData.loadLevels.map((load: string, loadIndex: number) => (
            <div key={`load-header-${legs}-${load}`} className={`font-bold text-center text-xs p-1 border border-gray-300 dark:border-gray-600 ${
              selections.legs === legs && selections.load === load 
                ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' 
                : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              {load}
            </div>
          ))
        )}
      </div>
    )

    // Data rows
    owasData.backPostures.forEach((back: string, backIndex: number) => {
      owasData.armPostures.forEach((arms: string, armsIndex: number) => {
        const isFirstArmsForBack = armsIndex === 0
        
        html.push(
          <div key={`row-${back}-${arms}`} className="contents">
            {isFirstArmsForBack && (
              <div className={`row-span-3 font-bold flex items-center justify-center text-xs p-1 border border-gray-300 dark:border-gray-600 ${
                selections.back === back 
                  ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`} style={{ gridRow: `span 3` }}>
                <div className="transform -rotate-90 whitespace-nowrap">①-{back}</div>
              </div>
            )}
            <div className={`font-bold flex items-center justify-center text-xs p-1 border border-gray-300 dark:border-gray-600 ${
              selections.arms === arms 
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              ②-{arms}
            </div>
            {owasData.legPostures.map((legs: string, legIndex: number) =>
              owasData.loadLevels.map((load: string, loadIndex: number) => {
                const score = matrix[back] && matrix[back][arms] && matrix[back][arms][legIndex] 
                  ? matrix[back][arms][legIndex][loadIndex] 
                  : 1
                
                const isHighlighted = selections.back === back && selections.arms === arms && 
                                    selections.legs === legs && selections.load === load
                const scoreStr = score.toString()
                const colorClass = owasData.scoreColors[scoreStr] || 'text-gray-600 bg-gray-50'
                
                return (
                  <div
                    key={`cell-${back}-${arms}-${legs}-${load}`}
                    className={`cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold border border-gray-300 dark:border-gray-600 min-h-[32px] p-1 ${colorClass} ${
                      isHighlighted ? 'ring-2 ring-yellow-400 scale-110 z-10' : 'hover:scale-105 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelections({ back, arms, legs, load })
                    }}
                    title={`${back}-${arms}-${legs}-${load}: ${score} (${owasData.scoreLabels[scoreStr]})`}
                  >
                    {score}
                  </div>
                )
              })
            )}
          </div>
        )
      })
    })

    return html
  }

  return (
    <div className={`text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-600 flex-grow flex flex-col ${className}`}>
      <div className="mb-3 text-center">
        <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">{owasData.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{owasData.description}</p>
      </div>
      
      {/* Selection Interface */}
      <div className="mb-4 grid grid-cols-4 gap-3 text-xs">
        <div>
          <p className="font-bold mb-1">① 背部</p>
          <div className="grid grid-cols-2 gap-1">
            {owasData.backPostures.map((back: string) => (
              <button
                key={back}
                onClick={() => handleOptionClick('back', back)}
                className={`p-1 border rounded text-xs ${
                  selections.back === back
                    ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                    : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {back}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-1">② 上肢</p>
          <div className="grid grid-cols-3 gap-1">
            {owasData.armPostures.map((arms: string) => (
              <button
                key={arms}
                onClick={() => handleOptionClick('arms', arms)}
                className={`p-1 border rounded text-xs ${
                  selections.arms === arms
                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {arms}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-1">③ 下肢</p>
          <div className="grid grid-cols-3 gap-1">
            {owasData.legPostures.map((legs: string) => (
              <button
                key={legs}
                onClick={() => handleOptionClick('legs', legs)}
                className={`p-1 border rounded text-xs ${
                  selections.legs === legs
                    ? 'border-sky-500 bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200'
                    : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {legs}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-1">④ 重量</p>
          <div className="grid grid-cols-1 gap-1">
            {owasData.loadLevels.map((load: string) => (
              <button
                key={load}
                onClick={() => handleOptionClick('load', load)}
                className={`p-1 border rounded text-xs ${
                  selections.load === load
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                    : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {load === '1' ? '1 (<10kg)' : load === '2' ? '2 (10-20kg)' : '3 (>20kg)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="flex-grow overflow-auto">
        <div className="grid gap-px bg-gray-300 dark:bg-gray-600 p-1" style={{ gridTemplateColumns: 'auto auto repeat(21, minmax(0, 1fr))' }}>
          {renderMatrix()}
        </div>
      </div>
      
      {/* Result */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">評価結果</p>
        <p className={`text-2xl font-bold ${owasData.scoreColors[currentScore.toString()]?.includes('green') ? 'text-green-600' : owasData.scoreColors[currentScore.toString()]?.includes('yellow') ? 'text-yellow-600' : owasData.scoreColors[currentScore.toString()]?.includes('orange') ? 'text-orange-600' : 'text-red-600'}`}>
          {currentScore}
        </p>
        <p className="text-xs font-medium">
          {owasData.scoreLabels[currentScore.toString()]}
        </p>
      </div>
    </div>
  )
}