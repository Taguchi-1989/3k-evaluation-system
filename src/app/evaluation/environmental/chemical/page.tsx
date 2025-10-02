'use client'

import React, { useState, Suspense } from 'react'
import { Header, Footer } from '@/components/layout'
import { Button, Input } from '@/components/ui'

interface ChemicalSubstance {
  id: string
  name: string
  casNumber?: string
  exposureLevel: string
  permissibleLimit: number
  currentExposure: number
  unit: string
  hazardCategory: 'low' | 'medium' | 'high' | 'critical'
}

function ChemicalEvaluationPageContent(): React.JSX.Element {
  const [selectedSubstances, setSelectedSubstances] = useState<ChemicalSubstance[]>([
    {
      id: '1',
      name: 'トルエン',
      casNumber: '108-88-3',
      exposureLevel: 'moderate',
      permissibleLimit: 50,
      currentExposure: 25,
      unit: 'ppm',
      hazardCategory: 'medium'
    },
    {
      id: '2',
      name: 'アセトン',
      casNumber: '67-64-1',
      exposureLevel: 'low',
      permissibleLimit: 500,
      currentExposure: 150,
      unit: 'ppm',
      hazardCategory: 'low'
    }
  ])
  
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [newSubstance, setNewSubstance] = useState<Partial<ChemicalSubstance>>({
    name: '',
    currentExposure: 0,
    permissibleLimit: 0,
    unit: 'ppm',
    hazardCategory: 'low'
  })

  const handleAddSubstance = () => {
    if (newSubstance.name) {
      const substance: ChemicalSubstance = {
        id: Date.now().toString(),
        name: newSubstance.name,
        casNumber: newSubstance.casNumber,
        exposureLevel: calculateExposureLevel(newSubstance.currentExposure || 0, newSubstance.permissibleLimit || 1),
        permissibleLimit: newSubstance.permissibleLimit || 0,
        currentExposure: newSubstance.currentExposure || 0,
        unit: newSubstance.unit || 'ppm',
        hazardCategory: newSubstance.hazardCategory || 'low'
      }
      
      setSelectedSubstances(prev => [...prev, substance])
      setNewSubstance({ name: '', currentExposure: 0, permissibleLimit: 0, unit: 'ppm', hazardCategory: 'low' })
    }
  }

  const handleRemoveSubstance = (id: string) => {
    setSelectedSubstances(prev => prev.filter(s => s.id !== id))
  }

  const calculateExposureLevel = (current: number, limit: number): string => {
    const ratio = current / limit
    if (ratio >= 1) return 'critical'
    if (ratio >= 0.5) return 'high'
    if (ratio >= 0.25) return 'moderate'
    return 'low'
  }

  const handleCalculateRisk = () => {
    let totalRisk = 0
    selectedSubstances.forEach(substance => {
      const exposureRatio = substance.currentExposure / substance.permissibleLimit
      const hazardWeight = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      }[substance.hazardCategory]
      
      totalRisk += exposureRatio * hazardWeight
    })
    
    const score = Math.min(Math.ceil(totalRisk * 2), 7)
    setOverallScore(score)
  }

  const handleSaveEvaluation = () => {
    // TODO: データベースに保存
    // Save evaluation data: { substances: selectedSubstances, score: overallScore }
    handleBack()
  }

  const handleBack = () => {
    window.location.href = '/evaluation/environmental'
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const getRiskScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score <= 2) return 'text-green-600'
    if (score <= 4) return 'text-yellow-600'
    if (score <= 6) return 'text-orange-600'
    return 'text-red-600'
  }

  const getExposureLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  return (
    <div className="aspect-container">
      <Header
        variant="simple"
        title="化学物質評価 - 環境因詳細評価"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              ← 戻る
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveEvaluation}
              disabled={overallScore === null}
            >
              評価を保存
            </Button>
          </div>
        }
      />

      <main className="flex-grow p-4 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* 左列: 化学物質リスト・管理 */}
          <div className="col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-4">使用化学物質一覧</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedSubstances.map((substance) => (
                  <div key={substance.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{substance.name}</h3>
                        {substance.casNumber && (
                          <p className="text-xs text-gray-500">CAS: {substance.casNumber}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleRemoveSubstance(substance.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        削除
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">現在値:</span>
                        <span className="ml-1 font-medium">{substance.currentExposure} {substance.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">許容値:</span>
                        <span className="ml-1 font-medium">{substance.permissibleLimit} {substance.unit}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getExposureLevelColor(substance.exposureLevel)}`}>
                        {substance.exposureLevel === 'critical' ? '危険' :
                         substance.exposureLevel === 'high' ? '高' :
                         substance.exposureLevel === 'moderate' ? '中' : '低'}
                        曝露レベル
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">新しい化学物質を追加</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">物質名</label>
                  <Input 
                    value={newSubstance.name || ''}
                    onChange={(e) => setNewSubstance(prev => ({...prev, name: e.target.value}))}
                    placeholder="例: トルエン"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">CAS番号 (任意)</label>
                  <Input 
                    value={newSubstance.casNumber || ''}
                    onChange={(e) => setNewSubstance(prev => ({...prev, casNumber: e.target.value}))}
                    placeholder="例: 108-88-3"
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">現在値</label>
                    <Input 
                      type="number"
                      value={newSubstance.currentExposure || ''}
                      onChange={(e) => setNewSubstance(prev => ({...prev, currentExposure: parseFloat(e.target.value) || 0}))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">許容値</label>
                    <Input 
                      type="number"
                      value={newSubstance.permissibleLimit || ''}
                      onChange={(e) => setNewSubstance(prev => ({...prev, permissibleLimit: parseFloat(e.target.value) || 0}))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="substance-unit" className="block text-sm font-medium mb-1">単位</label>
                    <select
                      id="substance-unit"
                      value={newSubstance.unit || 'ppm'}
                      onChange={(e) => setNewSubstance(prev => ({...prev, unit: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      aria-label="物質の単位を選択"
                    >
                      <option value="ppm">ppm</option>
                      <option value="mg/m³">mg/m³</option>
                      <option value="µg/m³">µg/m³</option>
                      <option value="fibers/ml">fibers/ml</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="hazard-category" className="block text-sm font-medium mb-1">危険度カテゴリ</label>
                  <select
                    id="hazard-category"
                    value={newSubstance.hazardCategory || 'low'}
                    onChange={(e) => setNewSubstance(prev => ({...prev, hazardCategory: e.target.value as 'low' | 'medium' | 'high' | 'critical'}))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    aria-label="危険度カテゴリを選択"
                  >
                    <option value="low">低危険度</option>
                    <option value="medium">中危険度</option>
                    <option value="high">高危険度</option>
                    <option value="critical">極めて危険</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleAddSubstance}
                  variant="outline"
                  className="w-full"
                  disabled={!newSubstance.name}
                >
                  化学物質を追加
                </Button>
              </div>
            </div>
          </div>

          {/* 右列: 評価・結果 */}
          <div className="col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">化学物質リスク評価</h2>
                <Button 
                  onClick={handleCalculateRisk}
                  variant="outline"
                  size="sm"
                >
                  リスクを計算
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3">曝露状況サマリー</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>総物質数:</span>
                      <span className="font-medium">{selectedSubstances.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>危険レベル物質:</span>
                      <span className="font-medium text-red-600">
                        {selectedSubstances.filter(s => s.exposureLevel === 'critical' || s.exposureLevel === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>許容値超過:</span>
                      <span className="font-medium text-orange-600">
                        {selectedSubstances.filter(s => s.currentExposure > s.permissibleLimit).length}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-3">総合リスクスコア</h3>
                  <div className="text-center">
                    {overallScore !== null ? (
                      <div>
                        <span className={`text-4xl font-bold ${getRiskScoreColor(overallScore)}`}>
                          {overallScore}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          {overallScore <= 2 ? '低リスク' :
                           overallScore <= 4 ? '中リスク' :
                           overallScore <= 6 ? '高リスク' : '極めて高リスク'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <span className="text-2xl">--</span>
                        <p className="text-sm mt-2">評価を計算してください</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <h3 className="font-bold mb-3">評価基準・対策提案</h3>
              <div className="text-sm space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-bold text-green-600">1-2</div>
                    <div className="text-xs">低リスク</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="font-bold text-yellow-600">3-4</div>
                    <div className="text-xs">中リスク</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="font-bold text-orange-600">5-6</div>
                    <div className="text-xs">高リスク</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-bold text-red-600">7</div>
                    <div className="text-xs">極めて危険</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium mb-2">推奨対策</h4>
                  <ul className="text-xs space-y-1">
                    <li>• 換気設備の強化・局所排気装置の設置</li>
                    <li>• 個人用保護具(マスク、手袋、保護服)の適切な使用</li>
                    <li>• 作業手順の見直し・自動化の検討</li>
                    <li>• 定期的な作業環境測定と健康診断</li>
                    <li>• より安全な代替物質への変更検討</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-2">特記事項・改善計画</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none"
                    placeholder="化学物質の管理状況や改善計画について記録"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer
        variant="simple"
        actions={
          <>
            <Button variant="outline" onClick={handleBack}>
              ← 環境因詳細
            </Button>
            <Button variant="outline" onClick={handleBackToMain}>
              メイン画面
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard}>
              ダッシュボード
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveEvaluation}
              disabled={overallScore === null}
            >
              評価を保存
            </Button>
          </>
        }
      />
    </div>
  )
}

export default function ChemicalEvaluationPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <ChemicalEvaluationPageContent />
    </Suspense>
  )
}