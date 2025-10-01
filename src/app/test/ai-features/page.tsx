'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AIComprehensiveAssistant } from '@/components/ui/AIComprehensiveAssistant'
import {
  aiTestWorkScenarios,
  aiTestVoiceInputs,
  aiTestCases,
  createMockImageFile,
  integrationTestScenarios
} from '@/lib/testData/aiTestData'
import type { AIAnalysisResult} from '@/lib/aiAssistant';
import { aiAssistant } from '@/lib/aiAssistant'
import { aiImageAnalysis } from '@/lib/aiImageAnalysis'
import { LazyLoadWrapper } from '@/components/optimized/LazyLoadWrapper'
// アイコンはTextで代替表示

export default function AIFeaturesTestPage() {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, Record<string, unknown>>>({})
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState(0)

  // AI分析のテスト実行
  const runAIAnalysisTest = async (testCase: typeof aiTestCases[0]) => {
    try {
      if (!testCase.input) {
        throw new Error('Test case input is undefined')
      }
      const result = await aiAssistant.analyzeWork(testCase.input)
      
      // 期待値との比較
      const passed = {
        physicalDemand: result.workAnalysis.physicalDemand === testCase.expectedResult.physicalDemand,
        mentalDemand: result.workAnalysis.mentalDemand === testCase.expectedResult.mentalDemand,
        environmentalRisk: result.workAnalysis.environmentalRisk === testCase.expectedResult.environmentalRisk,
        hazardLevel: result.workAnalysis.hazardLevel === testCase.expectedResult.hazardLevel,
        hasRecommendations: result.recommendations.length > 0
      }

      return {
        result,
        passed,
        success: Object.values(passed).every(p => p)
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'テスト実行エラー',
        success: false
      }
    }
  }

  // 画像解析のテスト実行
  const runImageAnalysisTest = async () => {
    try {
      // モック画像ファイルを作成
      const mockImageFile = createMockImageFile('test_factory_work.jpg')
      const result = await aiImageAnalysis.analyzeImage(mockImageFile)

      const passed = {
        hasDetectedObjects: result.detectedObjects.length > 0,
        hasWorkType: result.workType.length > 0,
        hasRiskFactors: result.riskFactors.length > 0,
        hasPostureAnalysis: result.postureAnalysis.riskLevel > 0,
        hasConfidence: result.confidence > 0
      }

      return {
        result,
        passed,
        success: Object.values(passed).every(p => p)
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'テスト実行エラー',
        success: false
      }
    }
  }

  // 全テストの実行
  const runAllTests = async () => {
    setIsRunningTests(true)
    const results: Record<string, Record<string, unknown>> = {}

    // AI分析テスト
    for (const testCase of aiTestCases) {
      results[testCase.name] = await runAIAnalysisTest(testCase)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒待機
    }

    // 画像解析テスト
    results['画像解析テスト'] = await runImageAnalysisTest()

    setTestResults(results)
    setIsRunningTests(false)
  }

  // シナリオテストの実行
  const runScenarioTest = async (scenarioIndex: number) => {
    const scenario = aiTestWorkScenarios[scenarioIndex]
    try {
      if (!scenario) {
        throw new Error('Scenario is undefined')
      }
      const result = await aiAssistant.analyzeWork(scenario)
       
      console.log(`シナリオ「${scenario.workName}」の分析結果:`, result)
      alert(`シナリオテスト完了: ${scenario.workName}\n推奨事項: ${result.recommendations.length}件`)
    } catch (error) {
      console.error('シナリオテストエラー:', error)
      alert('シナリオテストでエラーが発生しました')
    }
  }

  const getTestStatusIcon = (success: boolean) => {
    return success ? (
      <span className="w-5 h-5 text-green-600 text-lg">✓</span>
    ) : (
      <span className="w-5 h-5 text-red-600 text-lg">✗</span>
    )
  }

  return (
    <div className="page-container">
      <div className="page-content p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card mb-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              AI機能テストページ
            </h1>
            <p className="text-gray-600 mb-6">
              AI自動選択機能の動作確認とテストを行います。各機能を個別にテストしたり、統合テストを実行できます。
            </p>

          {/* クイックテストボタン */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-2 h-20"
              variant="primary"
            >
              <span className="text-lg">🧠</span>
              AI Assistant を開く
            </Button>
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 h-20"
              variant="outline"
            >
              <span className="text-lg">▶️</span>
              {isRunningTests ? 'テスト実行中...' : '全自動テスト実行'}
            </Button>
            <Button
              onClick={() => runScenarioTest(selectedScenario)}
              className="flex items-center gap-2 h-20"
              variant="outline"
            >
              <span className="text-lg">📄</span>
              シナリオテスト実行
            </Button>
            <Button
              onClick={runImageAnalysisTest}
              className="flex items-center gap-2 h-20"
              variant="outline"
            >
              <span className="text-lg">📷</span>
              画像解析テスト
            </Button>
          </div>
        </div>

        <LazyLoadWrapper
          rootMargin="100px"
          threshold={0.25}
          fallback={<div className="min-h-[400px] bg-gray-50 rounded animate-pulse" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* テストシナリオ */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">テストシナリオ</h2>
            <div className="space-y-4">
              {aiTestWorkScenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{scenario.workName}</h3>
                    <Button
                      onClick={() => setSelectedScenario(index)}
                      size="sm"
                      variant={selectedScenario === index ? "primary" : "outline"}
                    >
                      選択
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scenario.workDescription}</p>
                  <div className="text-xs text-gray-500">
                    工場: {scenario.factoryType} | 作業時間: {scenario.workHours}時間
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 音声入力テストデータ */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">🎤</span>
              音声入力テストデータ
            </h2>
            <div className="space-y-4">
              {aiTestVoiceInputs.map((input, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">サンプル{index + 1}</h3>
                  <p className="text-sm text-gray-700">{input}</p>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(input)
                      alert('テキストをクリップボードにコピーしました')
                    }}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    コピー
                  </Button>
                </div>
              ))}
            </div>
          </div>
          </div>
        </LazyLoadWrapper>

        {/* テスト結果 */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{testName}</h3>
                    {getTestStatusIcon(Boolean(result.success))}
                  </div>
                  
                  {result.error ? (
                    <div className="text-red-600 text-sm">{String(result.error)}</div>
                  ) : (
                    <div className="space-y-2">
                      {(result.passed && typeof result.passed === 'object') ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {Object.entries(result.passed as Record<string, boolean>).map(([key, passed]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className={passed ? 'text-green-600' : 'text-red-600'}>
                                {passed ? '✓' : '✗'}
                              </span>
                              <span className={passed ? 'text-green-700' : 'text-red-700'}>
                                {key}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      
                      {(result.result && typeof result.result === 'object') ? (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            詳細結果を表示
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 統合テストシナリオ */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">統合テストシナリオ</h2>
          <div className="space-y-4">
            {integrationTestScenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{scenario.name}</h3>
                <div className="space-y-1 mb-3">
                  {scenario.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="text-sm text-gray-600">
                      {stepIndex + 1}. {step}
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline">
                  このシナリオを実行
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 使用方法ガイド */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">テスト実行ガイド</h2>
          <div className="space-y-2 text-sm text-blue-700">
            <div>1. <strong>AI Assistant を開く</strong>: 実際のUIでAI機能をテスト</div>
            <div>2. <strong>全自動テスト実行</strong>: プログラムによる自動テスト（約30秒）</div>
            <div>3. <strong>シナリオテスト</strong>: 特定の作業シナリオでのAI分析をテスト</div>
            <div>4. <strong>音声入力テスト</strong>: サンプルテキストをコピーして音声入力欄に貼り付け</div>
            <div>5. <strong>画像解析テスト</strong>: モック画像データでの解析機能をテスト</div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIComprehensiveAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyRecommendations={(result: AIAnalysisResult) => {
           
          console.log('推奨設定が適用されました:', result)
          alert(`推奨設定を適用しました: ${result.recommendations.length}件の推奨事項`)
        }}
        workInfo={{
          workName: aiTestWorkScenarios[selectedScenario]?.workName || '',
          factoryName: aiTestWorkScenarios[selectedScenario]?.factoryType || '',
          processName: aiTestWorkScenarios[selectedScenario]?.processType || ''
        }}
      />
      </div>
    </div>
  )
}