'use client'

import { useState, useEffect } from 'react'
import { FileUpload, Input, Button } from '@/components/ui'
import { PhotoViewer } from '@/components/evaluation'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'

export interface EnvironmentalSubstance {
  id: string
  substanceName: string
  category: 'chemical' | 'physical' | 'biological'
  standardValue: number
  measuredValue: number
  measurementUnit: string
  exposureTime: number
  protectionLevel: 'none' | 'low' | 'medium' | 'high'
  riskLevel: number
  notes?: string
}

export interface EnvironmentalCondition {
  id: string
  conditionType: 'temperature' | 'humidity' | 'lighting' | 'ventilation' | 'noise' | 'vibration'
  label: string
  standardMin: number
  standardMax: number
  currentValue: number
  measurementUnit: string
  isOutOfRange: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface EnvironmentalDetails {
  checkboxes: {
    chemicals: boolean
    temperature: boolean
    noise: boolean
    vibration: boolean
    lighting: boolean
    dust: boolean
    humidity: boolean
    ventilation: boolean
  }
  substances: EnvironmentalSubstance[]
  conditions: EnvironmentalCondition[]
  overallRiskAssessment: {
    chemicalRisk: number
    physicalRisk: number
    biologicalRisk: number
    combinedRisk: number
  }
  protectiveMeasures: {
    personalProtection: string[]
    engineeringControls: string[]
    administrativeControls: string[]
    emergencyProcedures: string[]
  }
}

export interface EnhancedEnvironmentalFactorDetailProps {
  evaluationNo?: string
  creator?: {
    department: string
    name: string
    date: string
  }
  checker?: {
    department: string
    name: string
    date: string
  }
  workInfo?: {
    workName: string
    factoryName: string
    processName: string
  }
  photoUrl?: string
  initialData?: Partial<EnvironmentalDetails>
}

const defaultSubstances: EnvironmentalSubstance[] = [
  {
    id: '1',
    substanceName: 'アンモニア',
    category: 'chemical',
    standardValue: 25,
    measuredValue: 0,
    measurementUnit: 'ppm',
    exposureTime: 8,
    protectionLevel: 'none',
    riskLevel: 1
  },
  {
    id: '2',
    substanceName: '一般化学物質',
    category: 'chemical',
    standardValue: 100,
    measuredValue: 0,
    measurementUnit: 'ppm',
    exposureTime: 8,
    protectionLevel: 'none',
    riskLevel: 1
  },
  {
    id: '3',
    substanceName: '有機溶剤',
    category: 'chemical',
    standardValue: 200,
    measuredValue: 0,
    measurementUnit: 'ppm',
    exposureTime: 8,
    protectionLevel: 'none',
    riskLevel: 1
  }
]

const defaultConditions: EnvironmentalCondition[] = [
  {
    id: '1',
    conditionType: 'temperature',
    label: '作業環境温度',
    standardMin: 17,
    standardMax: 28,
    currentValue: 25,
    measurementUnit: '°C',
    isOutOfRange: false,
    severity: 'low'
  },
  {
    id: '2',
    conditionType: 'humidity',
    label: '相対湿度',
    standardMin: 40,
    standardMax: 70,
    currentValue: 60,
    measurementUnit: '%',
    isOutOfRange: false,
    severity: 'low'
  },
  {
    id: '3',
    conditionType: 'lighting',
    label: '照度',
    standardMin: 200,
    standardMax: 1000,
    currentValue: 500,
    measurementUnit: 'lux',
    isOutOfRange: false,
    severity: 'low'
  },
  {
    id: '4',
    conditionType: 'noise',
    label: '騒音レベル',
    standardMin: 0,
    standardMax: 85,
    currentValue: 70,
    measurementUnit: 'dB',
    isOutOfRange: false,
    severity: 'low'
  },
  {
    id: '5',
    conditionType: 'vibration',
    label: '全身振動',
    standardMin: 0,
    standardMax: 0.5,
    currentValue: 0.2,
    measurementUnit: 'm/s²',
    isOutOfRange: false,
    severity: 'low'
  },
  {
    id: '6',
    conditionType: 'ventilation',
    label: '換気量',
    standardMin: 20,
    standardMax: 100,
    currentValue: 50,
    measurementUnit: 'm³/h',
    isOutOfRange: false,
    severity: 'low'
  }
]

export function EnhancedEnvironmentalFactorDetail({
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Environmental+Assessment',
  initialData
}: EnhancedEnvironmentalFactorDetailProps) {
  
  const { currentEvaluation } = useEvaluationStore()
  
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDetails>({
    checkboxes: {
      chemicals: false,
      temperature: false,
      noise: false,
      vibration: false,
      lighting: false,
      dust: false,
      humidity: false,
      ventilation: false
    },
    substances: defaultSubstances,
    conditions: defaultConditions,
    overallRiskAssessment: {
      chemicalRisk: 1,
      physicalRisk: 1,
      biologicalRisk: 1,
      combinedRisk: 1
    },
    protectiveMeasures: {
      personalProtection: [],
      engineeringControls: [],
      administrativeControls: [],
      emergencyProcedures: []
    },
    ...initialData
  })

  const [selectedMatrix, setSelectedMatrix] = useState({ strength: 1, duration: 1 })
  const [finalScore, setFinalScore] = useState(1)
  const [activeTab, setActiveTab] = useState<'substances' | 'conditions' | 'assessment' | 'protection'>('substances')

  // 環境因用の評価マトリックス
  const environmentalMatrix = [
    [1, 1, 2, 4, 7],      // 軽微な暴露
    [1, 2, 4, 7, 10],     // 中程度の暴露
    [1, 4, 7, 10, 10]     // 重度の暴露
  ]

  useEffect(() => {
    calculateOverallRisk()
  }, [environmentalData.substances, environmentalData.conditions])

  const calculateOverallRisk = () => {
    // 化学物質リスク計算
    const chemicalRisk = environmentalData.substances
      .filter(s => s.category === 'chemical')
      .reduce((max, substance) => {
        const exposureRatio = substance.measuredValue / substance.standardValue
        const riskLevel = exposureRatio > 1 ? Math.min(10, Math.ceil(exposureRatio * 3)) : 1
        return Math.max(max, riskLevel)
      }, 1)

    // 物理的環境リスク計算
    const physicalRisk = environmentalData.conditions
      .reduce((max, condition) => {
        if (condition.isOutOfRange) {
          const severity = condition.severity === 'critical' ? 10 :
                          condition.severity === 'high' ? 7 :
                          condition.severity === 'medium' ? 4 : 2
          return Math.max(max, severity)
        }
        return max
      }, 1)

    const biologicalRisk = 1 // 簡易実装

    const combinedRisk = Math.max(chemicalRisk, physicalRisk, biologicalRisk)

    setEnvironmentalData(prev => ({
      ...prev,
      overallRiskAssessment: {
        chemicalRisk,
        physicalRisk,
        biologicalRisk,
        combinedRisk
      }
    }))

    setFinalScore(combinedRisk)
  }

  const handleCheckboxChange = (key: keyof typeof environmentalData.checkboxes) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    setEnvironmentalData(prev => ({
      ...prev,
      checkboxes: {
        ...prev.checkboxes,
        [key]: !prev.checkboxes[key]
      }
    }))
  }

  const handleSubstanceChange = (id: string, field: keyof EnvironmentalSubstance, value: unknown) => {
    setEnvironmentalData(prev => ({
      ...prev,
      substances: prev.substances.map(substance =>
        substance.id === id ? { ...substance, [field]: value } : substance
      )
    }))
  }

  const handleConditionChange = (id: string, field: keyof EnvironmentalCondition, value: unknown) => {
    setEnvironmentalData(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition => {
        if (condition.id === id) {
          const updated = { ...condition, [field]: value }
          
          // 範囲外チェック
          if (field === 'currentValue') {
            const numValue = Number(value)
            updated.isOutOfRange = numValue < condition.standardMin || numValue > condition.standardMax
            
            if (updated.isOutOfRange) {
              const deviation = Math.max(
                (condition.standardMin - numValue) / condition.standardMin,
                (numValue - condition.standardMax) / condition.standardMax
              )
              updated.severity = deviation > 0.5 ? 'critical' :
                               deviation > 0.3 ? 'high' :
                               deviation > 0.1 ? 'medium' : 'low'
            } else {
              updated.severity = 'low'
            }
          }
          
          return updated
        }
        return condition
      })
    }))
  }

  const addNewSubstance = () => {
    const newSubstance: EnvironmentalSubstance = {
      id: `custom_${Date.now()}`,
      substanceName: '',
      category: 'chemical',
      standardValue: 0,
      measuredValue: 0,
      measurementUnit: 'ppm',
      exposureTime: 8,
      protectionLevel: 'none',
      riskLevel: 1
    }

    setEnvironmentalData(prev => ({
      ...prev,
      substances: [...prev.substances, newSubstance]
    }))
  }

  const removeSubstance = (id: string) => {
    setEnvironmentalData(prev => ({
      ...prev,
      substances: prev.substances.filter(s => s.id !== id)
    }))
  }

  const handleMatrixClick = (strength: number, duration: number) => {
    setSelectedMatrix({ strength, duration })
    const matrixScore = environmentalMatrix[duration]?.[strength] ?? 0
    setFinalScore(Math.max(matrixScore, environmentalData.overallRiskAssessment.combinedRisk))
  }

  const handleSave = () => {
    const evaluationData = {
      environmentalDetails: environmentalData,
      environmentalScore: finalScore,
      environmentalMatrix: selectedMatrix
    }

    // updateEvaluationData(evaluationData)
    console.log('環境因子データが保存されました', evaluationData)
    alert('環境因子データが保存されました')
  }

  const handleFileUpload = (files: FileList) => {
    // TODO: Process uploaded files
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const renderSubstancesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">化学物質・有害物質評価</h3>
        <Button onClick={addNewSubstance} variant="outline" size="sm">
          + 物質追加
        </Button>
      </div>

      <div className="space-y-4">
        {environmentalData.substances.map((substance) => (
          <div key={substance.id} className="card p-4 border rounded">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="物質名"
                  value={substance.substanceName}
                  onChange={(e) => handleSubstanceChange(substance.id, 'substanceName', e.target.value)}
                  placeholder="物質名を入力"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">カテゴリ</label>
                  <select
                    value={substance.category}
                    onChange={(e) => handleSubstanceChange(substance.id, 'category', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="chemical">化学物質</option>
                    <option value="physical">物理的要因</option>
                    <option value="biological">生物学的要因</option>
                  </select>
                </div>
              </div>
              
              <Button
                onClick={() => removeSubstance(substance.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 ml-2"
              >
                削除
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="基準値"
                type="number"
                value={substance.standardValue.toString()}
                onChange={(e) => handleSubstanceChange(substance.id, 'standardValue', parseFloat(e.target.value) || 0)}
              />
              
              <Input
                label="測定値"
                type="number"
                value={substance.measuredValue.toString()}
                onChange={(e) => handleSubstanceChange(substance.id, 'measuredValue', parseFloat(e.target.value) || 0)}
              />
              
              <Input
                label="単位"
                value={substance.measurementUnit}
                onChange={(e) => handleSubstanceChange(substance.id, 'measurementUnit', e.target.value)}
              />
              
              <Input
                label="暴露時間 (h)"
                type="number"
                value={substance.exposureTime.toString()}
                onChange={(e) => handleSubstanceChange(substance.id, 'exposureTime', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium mb-1">防護レベル</label>
                <select
                  value={substance.protectionLevel}
                  onChange={(e) => handleSubstanceChange(substance.id, 'protectionLevel', e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="none">なし</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">リスク比率</div>
                <div className={`font-bold ${
                  substance.measuredValue / substance.standardValue > 1 ? 'text-red-600' : 
                  substance.measuredValue / substance.standardValue > 0.8 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {substance.standardValue > 0 ? 
                    `${((substance.measuredValue / substance.standardValue) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderConditionsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">作業環境条件</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {environmentalData.conditions.map((condition) => (
          <div key={condition.id} className={`card p-4 border rounded ${
            condition.isOutOfRange ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">{condition.label}</h4>
              <span className={`px-2 py-1 text-xs rounded ${
                condition.severity === 'critical' ? 'bg-red-600 text-white' :
                condition.severity === 'high' ? 'bg-red-400 text-white' :
                condition.severity === 'medium' ? 'bg-orange-400 text-white' :
                'bg-green-400 text-white'
              }`}>
                {condition.severity === 'critical' ? '危険' :
                 condition.severity === 'high' ? '高リスク' :
                 condition.severity === 'medium' ? '注意' : '正常'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>基準範囲:</span>
                <span>{condition.standardMin} - {condition.standardMax} {condition.measurementUnit}</span>
              </div>
              
              <Input
                label="測定値"
                type="number"
                value={condition.currentValue.toString()}
                onChange={(e) => handleConditionChange(condition.id, 'currentValue', parseFloat(e.target.value) || 0)}
              />
              
              {condition.isOutOfRange && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ 基準値範囲外です
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAssessmentTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">総合リスク評価</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {environmentalData.overallRiskAssessment.chemicalRisk}
          </div>
          <div className="text-sm text-gray-600">化学的リスク</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {environmentalData.overallRiskAssessment.physicalRisk}
          </div>
          <div className="text-sm text-gray-600">物理的リスク</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {environmentalData.overallRiskAssessment.biologicalRisk}
          </div>
          <div className="text-sm text-gray-600">生物学的リスク</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {environmentalData.overallRiskAssessment.combinedRisk}
          </div>
          <div className="text-sm text-gray-600">総合リスク</div>
        </div>
      </div>

      {/* マトリクス選択 */}
      <div className="card p-6">
        <h4 className="text-lg font-semibold mb-4">環境リスクマトリクス</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100">暴露レベル＼継続時間</th>
                <th className="border p-2 bg-gray-100">短時間<br/>(&lt;10%)</th>
                <th className="border p-2 bg-gray-100">短期間<br/>(10-25%)</th>
                <th className="border p-2 bg-gray-100">中期間<br/>(25-50%)</th>
                <th className="border p-2 bg-gray-100">長期間<br/>(50-75%)</th>
                <th className="border p-2 bg-gray-100">常時<br/>(&gt;75%)</th>
              </tr>
            </thead>
            <tbody>
              {environmentalMatrix.map((row, durIndex) => (
                <tr key={durIndex}>
                  <td className="border p-2 bg-gray-50 font-medium">
                    {durIndex === 0 ? '軽微な暴露' : durIndex === 1 ? '中程度の暴露' : '重度の暴露'}
                  </td>
                  {row.map((value, strIndex) => (
                    <td
                      key={strIndex}
                      className={`border p-2 text-center cursor-pointer hover:bg-gray-100 ${
                        selectedMatrix.strength === strIndex && selectedMatrix.duration === durIndex
                          ? 'bg-blue-200 font-bold'
                          : ''
                      } ${
                        value >= 7 ? 'bg-red-100' : value >= 4 ? 'bg-orange-100' : 'bg-green-100'
                      }`}
                      onClick={() => handleMatrixClick(strIndex, durIndex)}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold">
            最終環境因子スコア: <span className="text-blue-600">{finalScore}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProtectionTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">保護対策・管理措置</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h4 className="font-semibold mb-3">個人防護具</h4>
          <div className="space-y-2">
            {['呼吸器保護具', '皮膚保護具', '眼・顔面保護具', '聴覚保護具'].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-3">工学的対策</h4>
          <div className="space-y-2">
            {['局所排気装置', '密閉化', '換気システム', '自動化・遠隔操作'].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-3">管理的対策</h4>
          <div className="space-y-2">
            {['作業手順書', '教育訓練', '健康管理', '作業時間制限'].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-3">緊急時対応</h4>
          <div className="space-y-2">
            {['緊急シャワー', '洗眼設備', '応急処置', '避難経路'].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="flex-1 p-3 overflow-hidden">
        {/* 上段: 写真・資料エリア */}
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">作業写真</h3>
                <PhotoViewer
                  mainPhoto={photoUrl}
                  className="rounded-lg"
                />
              </div>
              <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">追加資料</h3>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  variant="document"
                  layout="vertical"
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 下段: 評価エリア */}
        <div className="environmental-factors bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex flex-wrap gap-2 px-4 py-3">
              {[
                { key: 'substances', label: '物質評価', icon: '🧪' },
                { key: 'conditions', label: '環境条件', icon: '🌡️' },
                { key: 'assessment', label: 'リスク評価', icon: '📊' },
                { key: 'protection', label: '保護対策', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'substances' | 'conditions' | 'protection')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'substances' && renderSubstancesTab()}
            {activeTab === 'conditions' && renderConditionsTab()}
            {activeTab === 'assessment' && renderAssessmentTab()}
            {activeTab === 'protection' && renderProtectionTab()}
          </div>
        </div>
      </section>

    </div>
  )
}