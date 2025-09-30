'use client'

import { useState } from 'react'
import { EVALUATION_STANDARDS } from '@/data/defaultEvaluationData'

interface StandardsLegendProps {
  factorType: 'physical' | 'mental' | 'environmental' | 'hazard' | 'workTime'
  className?: string
}

export function StandardsLegend({ factorType, className = '' }: StandardsLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const standards = EVALUATION_STANDARDS[factorType]
  
  const renderPhysicalStandards = () => (
    <div className="space-y-3">
      {/* RULA評価基準 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">RULA評価基準</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {standards.scales?.rula?.scale?.map((scale, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${scale.color === 'green' ? 'border-green-500 bg-green-50' : 
                scale.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                scale.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">スコア {scale.score}: {scale.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{scale.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* OWAS評価基準 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">OWAS評価基準</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {standards.scales?.owas?.scale?.map((scale, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${scale.color === 'green' ? 'border-green-500 bg-green-50' : 
                scale.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                scale.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">カテゴリ {scale.category}: {scale.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{scale.description}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">対応措置: {scale.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMentalStandards = () => (
    <div className="space-y-3">
      {/* 重要度レベル */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">重要度レベル</h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {standards.scales?.severity?.map((severity, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${severity.color === 'green' ? 'border-green-500 bg-green-50' : 
                severity.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                severity.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">{severity.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{severity.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEnvironmentalStandards = () => (
    <div className="space-y-3">
      {/* 化学物質基準値 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">主要化学物質基準値</h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {standards.substances?.slice(0, 5).map((substance, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium">{substance.name}</div>
              <div className="text-gray-600 dark:text-gray-300">
                基準値: {substance.standardValue}{substance.unit} | 
                カテゴリ: {substance.category}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* リスクレベル */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">リスクレベル</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {standards.riskLevels?.map((level, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${level.color === 'green' ? 'border-green-500 bg-green-50' : 
                level.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                level.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">{level.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{level.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHazardStandards = () => (
    <div className="space-y-3">
      {/* リスクマトリクス */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">リスクマトリクス</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 p-1">確率/重篤度</th>
                <th className="border border-gray-300 dark:border-gray-600 p-1">S1</th>
                <th className="border border-gray-300 dark:border-gray-600 p-1">S2</th>
                <th className="border border-gray-300 dark:border-gray-600 p-1">S3</th>
                <th className="border border-gray-300 dark:border-gray-600 p-1">S4</th>
              </tr>
            </thead>
            <tbody>
              {['P1', 'P2', 'P3', 'P4'].map((prob) => (
                <tr key={prob}>
                  <td className="border border-gray-300 dark:border-gray-600 p-1 font-medium">{prob}</td>
                  {[1, 2, 3, 4].map((sev) => {
                    const riskScore = parseInt(prob.slice(1)) * sev
                    const riskLevel = riskScore <= 2 ? 'D' : riskScore <= 4 ? 'C' : riskScore <= 8 ? 'B' : 'A'
                    const bgColor = riskLevel === 'D' ? 'bg-green-100' : riskLevel === 'C' ? 'bg-yellow-100' : 
                                   riskLevel === 'B' ? 'bg-orange-100' : 'bg-red-100'
                    return (
                      <td key={sev} className={`border border-gray-300 dark:border-gray-600 p-1 text-center ${bgColor}`}>
                        {riskScore}({riskLevel})
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* リスクレベル説明 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">リスクレベル説明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {standards.riskLevels?.map((level, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${level.color === 'green' ? 'border-green-500 bg-green-50' : 
                level.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                level.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">レベル {level.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{level.description}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{level.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderWorkTimeStandards = () => (
    <div className="space-y-3">
      {/* 時間クラス */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">時間クラス基準</h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {standards.timeClasses?.map((timeClass, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${timeClass.color === 'green' ? 'border-green-500 bg-green-50' : 
                timeClass.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                timeClass.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">クラス {timeClass.class}: {timeClass.range}</div>
              <div className="text-gray-600 dark:text-gray-300">{timeClass.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 疲労指数 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">疲労指数基準</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {standards.fatigueIndex?.map((fatigue, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border-l-4 ${fatigue.color === 'green' ? 'border-green-500 bg-green-50' : 
                fatigue.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' : 
                fatigue.color === 'orange' ? 'border-orange-500 bg-orange-50' : 
                'border-red-500 bg-red-50'}`}
            >
              <div className="font-medium">{fatigue.range}: {fatigue.level}</div>
              <div className="text-gray-600 dark:text-gray-300">{fatigue.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (factorType) {
      case 'physical':
        return renderPhysicalStandards()
      case 'mental':
        return renderMentalStandards()
      case 'environmental':
        return renderEnvironmentalStandards()
      case 'hazard':
        return renderHazardStandards()
      case 'workTime':
        return renderWorkTimeStandards()
      default:
        return <div>評価基準情報がありません</div>
    }
  }

  const getFactorTitle = () => {
    const titles = {
      physical: '肉体因子',
      mental: '精神因子', 
      environmental: '環境因子',
      hazard: '危険因子',
      workTime: '作業時間'
    }
    return titles[factorType] || '評価基準'
  }

  if (!standards) return null

  return (
    <div className={`bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600 dark:text-blue-400">i</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {getFactorTitle()}評価基準・凡例
          </h3>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 border-t dark:border-gray-600">
          <div className="pt-3">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  )
}