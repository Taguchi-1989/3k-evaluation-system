'use client'

import React, { useState } from 'react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui'

export default function StressEvaluationPage(): React.JSX.Element {
  const [stressLevel, setStressLevel] = useState<string>('medium')
  const [stressFactors, setStressFactors] = useState<{[key: string]: boolean}>({
    timeConstraint: false,
    workload: true,
    responsibility: false,
    interpersonal: true,
    environmental: false
  })
  const [stressScore, setStressScore] = useState<number | null>(null)

  const handleStressFactorChange = (factor: string, checked: boolean) => {
    setStressFactors(prev => ({
      ...prev,
      [factor]: checked
    }))
  }

  const handleCalculateStress = () => {
    // Simple stress calculation based on selected factors and level
    const factorCount = Object.values(stressFactors).filter(Boolean).length
    const levelMultiplier = stressLevel === 'high' ? 3 : stressLevel === 'medium' ? 2 : 1
    const score = Math.min(factorCount * levelMultiplier, 7)
    setStressScore(score)
  }

  const handleSaveEvaluation = () => {
    // console.log('Save stress evaluation:', { level: stressLevel, factors: stressFactors, score: stressScore })
    // TODO: データベースに保存
    handleBack()
  }

  const handleBack = () => {
    window.location.href = '/evaluation/mental'
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const getStressScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score <= 2) return 'text-green-600'
    if (score <= 4) return 'text-yellow-600'
    if (score <= 6) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="aspect-container">
      <Header
        variant="simple"
        title="ストレス評価 - 精神因詳細評価"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              ← 戻る
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveEvaluation}
              disabled={stressScore === null}
            >
              評価を保存
            </Button>
          </div>
        }
      />

      <main className="flex-grow p-4 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* 左列: ストレス要因選択 */}
          <div className="col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <h2 className="text-lg font-bold mb-4">ストレス要因の選択</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-2 rounded hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={stressFactors.timeConstraint}
                    onChange={(e) => handleStressFactorChange('timeConstraint', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">時間的制約</span>
                    <p className="text-sm text-gray-600">締切やタイムプレッシャー</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={stressFactors.workload}
                    onChange={(e) => handleStressFactorChange('workload', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">作業量</span>
                    <p className="text-sm text-gray-600">過度な作業量や複雑性</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={stressFactors.responsibility}
                    onChange={(e) => handleStressFactorChange('responsibility', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">責任の重さ</span>
                    <p className="text-sm text-gray-600">重要な判断や決定責任</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={stressFactors.interpersonal}
                    onChange={(e) => handleStressFactorChange('interpersonal', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">人間関係</span>
                    <p className="text-sm text-gray-600">コミュニケーションや対人関係</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={stressFactors.environmental}
                    onChange={(e) => handleStressFactorChange('environmental', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">環境要因</span>
                    <p className="text-sm text-gray-600">騒音、照明、温度など</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-2">ストレス強度レベル</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="stress-level" 
                    value="low"
                    checked={stressLevel === 'low'}
                    onChange={(e) => setStressLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-green-600">低 - 軽微なストレス</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="stress-level" 
                    value="medium"
                    checked={stressLevel === 'medium'}
                    onChange={(e) => setStressLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-yellow-600">中 - 普通のストレス</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="stress-level" 
                    value="high"
                    checked={stressLevel === 'high'}
                    onChange={(e) => setStressLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-red-600">高 - 重大なストレス</span>
                </label>
              </div>
            </div>
          </div>

          {/* 右列: 評価・結果 */}
          <div className="col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">ストレス評価結果</h2>
                <Button 
                  onClick={handleCalculateStress}
                  variant="outline"
                  size="sm"
                >
                  評価を計算
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3">選択されたストレス要因</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(stressFactors).map(([key, checked]) => {
                      const labels = {
                        timeConstraint: '時間的制約',
                        workload: '作業量',
                        responsibility: '責任の重さ', 
                        interpersonal: '人間関係',
                        environmental: '環境要因'
                      }
                      return (
                        <div key={key} className={`flex items-center ${checked ? 'text-red-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{checked ? '✓' : '○'}</span>
                          <span>{labels[key as keyof typeof labels]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-3">評価スコア</h3>
                  <div className="text-center">
                    {stressScore !== null ? (
                      <div>
                        <span className={`text-4xl font-bold ${getStressScoreColor(stressScore)}`}>
                          {stressScore}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          {stressScore <= 2 ? '低ストレス' :
                           stressScore <= 4 ? '中程度ストレス' :
                           stressScore <= 6 ? '高ストレス' : '非常に高いストレス'}
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
              <h3 className="font-bold mb-3">評価基準・コメント</h3>
              <div className="text-sm space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-bold text-green-600">1-2</div>
                    <div className="text-xs">許容可能</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="font-bold text-yellow-600">3-4</div>
                    <div className="text-xs">要注意</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="font-bold text-orange-600">5-6</div>
                    <div className="text-xs">要改善</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-bold text-red-600">7</div>
                    <div className="text-xs">即改善</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-2">追加コメント</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                    placeholder="ストレス要因に関する詳細な観察や改善提案を記入"
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
              ← 精神因詳細
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
              disabled={stressScore === null}
            >
              評価を保存
            </Button>
          </>
        }
      />
    </div>
  )
}