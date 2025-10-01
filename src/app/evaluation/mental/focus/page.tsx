'use client'

import React, { useState } from 'react'
import { Header, Footer } from '@/components/layout'
import { Button, Input } from '@/components/ui'

export default function FocusEvaluationPage(): React.JSX.Element {
  const [focusLevel, setFocusLevel] = useState<string>('medium')
  const [distractionFactors, setDistractionFactors] = useState<{[key: string]: boolean}>({
    noise: false,
    interruptions: true,
    multitasking: false,
    visualDistractions: true,
    mentalLoad: false
  })
  const [focusScore, setFocusScore] = useState<number | null>(null)
  const [concentrationDuration, setConcentrationDuration] = useState<string>('30')
  const [taskComplexity, setTaskComplexity] = useState<string>('medium')

  const handleDistractionFactorChange = (factor: string, checked: boolean) => {
    setDistractionFactors(prev => ({
      ...prev,
      [factor]: checked
    }))
  }

  const handleCalculateFocus = () => {
    // Focus calculation based on selected factors, level, duration and complexity
    const distractionCount = Object.values(distractionFactors).filter(Boolean).length
    const levelScore = focusLevel === 'high' ? 3 : focusLevel === 'medium' ? 2 : 1
    const durationScore = parseInt(concentrationDuration) > 60 ? 3 : parseInt(concentrationDuration) > 30 ? 2 : 1
    const complexityScore = taskComplexity === 'high' ? 3 : taskComplexity === 'medium' ? 2 : 1
    
    // Base score from positive factors, subtract distraction penalties
    const baseScore = Math.max(1, levelScore + durationScore + complexityScore - distractionCount)
    const score = Math.min(baseScore, 7)
    setFocusScore(score)
  }

  const handleSaveEvaluation = () => {
    // TODO: データベースに保存
    // Save evaluation data: { level: focusLevel, factors: distractionFactors, score: focusScore, duration: concentrationDuration, complexity: taskComplexity }
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

  const getFocusScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score <= 2) return 'text-red-600'
    if (score <= 4) return 'text-orange-600'
    if (score <= 6) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="aspect-container">
      <Header
        variant="simple"
        title="集中力評価 - 精神因詳細評価"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              ← 戻る
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveEvaluation}
              disabled={focusScore === null}
            >
              評価を保存
            </Button>
          </div>
        }
      />

      <main className="flex-grow p-4 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* 左列: 集中力要素設定 */}
          <div className="col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-4">集中力に影響する要素</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={distractionFactors.noise}
                    onChange={(e) => handleDistractionFactorChange('noise', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">騒音・音響</span>
                    <p className="text-sm text-gray-600">機械音、会話、突発音など</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={distractionFactors.interruptions}
                    onChange={(e) => handleDistractionFactorChange('interruptions', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">作業中断</span>
                    <p className="text-sm text-gray-600">電話、声かけ、緊急対応など</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={distractionFactors.multitasking}
                    onChange={(e) => handleDistractionFactorChange('multitasking', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">マルチタスク</span>
                    <p className="text-sm text-gray-600">複数業務の並行処理</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={distractionFactors.visualDistractions}
                    onChange={(e) => handleDistractionFactorChange('visualDistractions', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">視覚的妨害</span>
                    <p className="text-sm text-gray-600">人の動き、画面切り替えなど</p>
                  </div>
                </label>
                
                <label className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={distractionFactors.mentalLoad}
                    onChange={(e) => handleDistractionFactorChange('mentalLoad', e.target.checked)}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">精神的負荷</span>
                    <p className="text-sm text-gray-600">心配事、プレッシャーなど</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-3">作業特性</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">継続集中時間 (分)</label>
                  <Input 
                    type="number" 
                    value={concentrationDuration}
                    onChange={(e) => setConcentrationDuration(e.target.value)}
                    className="w-full"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">作業複雑度</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="complexity" 
                        value="low"
                        checked={taskComplexity === 'low'}
                        onChange={(e) => setTaskComplexity(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-green-600">低 - 単純作業</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="complexity" 
                        value="medium"
                        checked={taskComplexity === 'medium'}
                        onChange={(e) => setTaskComplexity(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-yellow-600">中 - 判断を伴う作業</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="complexity" 
                        value="high"
                        checked={taskComplexity === 'high'}
                        onChange={(e) => setTaskComplexity(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-red-600">高 - 高度な判断・創造性</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">集中力レベル</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="focus-level" 
                        value="high"
                        checked={focusLevel === 'high'}
                        onChange={(e) => setFocusLevel(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-green-600">高 - 高い集中力を維持</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="focus-level" 
                        value="medium"
                        checked={focusLevel === 'medium'}
                        onChange={(e) => setFocusLevel(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-yellow-600">中 - 普通の集中力</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="focus-level" 
                        value="low"
                        checked={focusLevel === 'low'}
                        onChange={(e) => setFocusLevel(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-red-600">低 - 集中が困難</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右列: 評価・結果 */}
          <div className="col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">集中力評価結果</h2>
                <Button 
                  onClick={handleCalculateFocus}
                  variant="outline"
                  size="sm"
                >
                  評価を計算
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-3">妨害要因</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(distractionFactors).map(([key, checked]) => {
                      const labels = {
                        noise: '騒音・音響',
                        interruptions: '作業中断',
                        multitasking: 'マルチタスク',
                        visualDistractions: '視覚的妨害',
                        mentalLoad: '精神的負荷'
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
                  <h3 className="font-bold mb-3">集中力スコア</h3>
                  <div className="text-center">
                    {focusScore !== null ? (
                      <div>
                        <span className={`text-4xl font-bold ${getFocusScoreColor(focusScore)}`}>
                          {focusScore}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          {focusScore <= 2 ? '集中困難' :
                           focusScore <= 4 ? '集中やや困難' :
                           focusScore <= 6 ? '普通の集中力' : '高い集中力'}
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
              <h3 className="font-bold mb-3">評価基準・改善提案</h3>
              <div className="text-sm space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-bold text-red-600">1-2</div>
                    <div className="text-xs">集中困難</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="font-bold text-orange-600">3-4</div>
                    <div className="text-xs">やや困難</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="font-bold text-yellow-600">5-6</div>
                    <div className="text-xs">普通</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-bold text-green-600">7</div>
                    <div className="text-xs">良好</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium mb-2">改善提案</h4>
                  <ul className="text-xs space-y-1">
                    <li>• 騒音対策: 防音設備の設置、時間帯調整</li>
                    <li>• 作業中断軽減: 集中時間帯の設定、緊急時対応ルール</li>
                    <li>• 環境整備: 適切な照明、整理整頓</li>
                    <li>• 休憩管理: 定期的な小休憩の設定</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-2">追加観察・コメント</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none"
                    placeholder="集中力に関する具体的な観察や改善アイデアを記入"
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
              disabled={focusScore === null}
            >
              評価を保存
            </Button>
          </>
        }
      />
    </div>
  )
}