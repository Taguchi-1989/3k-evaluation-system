'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { AIAnalysisResult, WorkAnalysisInput} from '@/lib/aiAssistant';
import { aiAssistant } from '@/lib/aiAssistant'
import type { ImageAnalysisResult} from '@/lib/aiImageAnalysis';
import { aiImageAnalysis } from '@/lib/aiImageAnalysis'
import { LazyLoadWrapper } from '@/components/optimized/LazyLoadWrapper'
// アイコンはTextで代替表示

export interface AIComprehensiveAssistantProps {
  isOpen: boolean
  onClose: () => void
  onApplyRecommendations?: (result: AIAnalysisResult) => void
  workInfo?: {
    workName: string
    factoryName: string
    processName: string
  }
}

export function AIComprehensiveAssistant({
  isOpen,
  onClose,
  onApplyRecommendations,
  workInfo
}: AIComprehensiveAssistantProps): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'voice' | 'image' | 'analysis'>('voice')
  const [_uploadedImages, setUploadedImages] = useState<File[]>([])
  const [_transcription, setTranscription] = useState('')
  const [workInput, setWorkInput] = useState<WorkAnalysisInput>({
    workName: workInfo?.workName || '',
    workDescription: '',
    factoryType: workInfo?.factoryName || '',
    processType: workInfo?.processName || '',
    workHours: 8
  })

  if (!isOpen) return null

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const result = await aiAssistant.analyzeWork(workInput)
      setAnalysisResult(result)
      setActiveTab('analysis')
    } catch (error) {
      console.error('AI分析エラー:', error)
    }
    setIsLoading(false)
  }

  const handleImageAnalyze = async (files: File[]) => {
    if (files.length === 0) return

    setIsLoading(true)
    
    try {
      const analysisResults = await Promise.all(
        files.map(file => aiImageAnalysis.analyzeImage(file))
      )
      
      if (analysisResults.length > 0) {
        setImageAnalysisResult(analysisResults[0] ?? null)

        const combinedInput: WorkAnalysisInput = {
          ...workInput,
          workDescription: `${workInput.workDescription} 画像から検出: ${analysisResults[0]?.workType ?? ''}`,
          photos: files.map(f => f.name)
        }
        
        const aiResult = await aiAssistant.analyzeWork(combinedInput)
        setAnalysisResult(aiResult)
        setActiveTab('analysis')
      }
    } catch (error) {
      console.error('画像分析エラー:', error)
    }
    setIsLoading(false)
  }

  const handleVoiceTranscription = (text: string) => {
    setTranscription(text)
    setWorkInput(prev => ({
      ...prev,
      workDescription: text
    }))
  }

  const handleApplyRecommendations = () => {
    if (analysisResult && onApplyRecommendations) {
      onApplyRecommendations(analysisResult)
      onClose()
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-orange-600'
    if (score >= 2) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLevelBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      high: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[level as keyof typeof colors] || colors.medium}`}>
        {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-xl text-blue-600">🧠</span>
            AI自動選択アシスタント
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <span className="text-lg">✕</span>
          </Button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'voice'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-sm mr-1">📄</span>
            音声・テキスト入力
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-sm mr-1">📷</span>
            画像解析
          </button>
          {analysisResult && (
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-sm mr-1">💡</span>
              分析結果
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI分析中...</p>
            </div>
          )}

          {!isLoading && activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作業名
                  </label>
                  <input
                    type="text"
                    value={workInput.workName}
                    onChange={(e) => setWorkInput(prev => ({ ...prev, workName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="例: 重量物運搬作業"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作業時間 (時間)
                  </label>
                  <input
                    type="number"
                    value={workInput.workHours}
                    onChange={(e) => setWorkInput(prev => ({ ...prev, workHours: Number(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    min="1"
                    max="24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作業説明
                </label>
                <textarea
                  value={workInput.workDescription}
                  onChange={(e) => setWorkInput(prev => ({ ...prev, workDescription: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md h-24"
                  placeholder="作業の詳細内容、使用する機械、環境条件などを記入してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  音声入力（オプション）
                </label>
                <VoiceInput
                  onTranscription={handleVoiceTranscription}
                  placeholder="マイクボタンを押して作業内容を話してください"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => { void handleAnalyze() }}
                  disabled={!workInput.workName}
                  variant="primary"
                  className="px-6 py-2"
                >
                  AI分析実行
                </Button>
              </div>
            </div>
          )}

          {!isLoading && activeTab === 'image' && (
            <LazyLoadWrapper
              rootMargin="50px"
              threshold={0.1}
              fallback={<div className="min-h-[300px] bg-gray-50 rounded animate-pulse" />}
            >
              <div className="space-y-6">
                <ImageUpload
                  onImageSelect={setUploadedImages}
                  onImageAnalyze={(files) => { void handleImageAnalyze(files) }}
                  maxFiles={5}
                />

                {imageAnalysisResult && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">画像解析結果プレビュー</h4>
                    <div className="text-sm space-y-2">
                      <div>検出作業タイプ: <span className="font-medium">{imageAnalysisResult.workType}</span></div>
                      <div>検出オブジェクト数: <span className="font-medium">{imageAnalysisResult.detectedObjects.length}件</span></div>
                      <div>リスク要因: <span className="font-medium">{imageAnalysisResult.riskFactors.length}件</span></div>
                      <div>信頼度: <span className="font-medium">{Math.round(imageAnalysisResult.confidence * 100)}%</span></div>
                    </div>
                  </div>
                )}
              </div>
            </LazyLoadWrapper>
          )}

          {!isLoading && activeTab === 'analysis' && analysisResult && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">分析結果概要</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">肉体的負荷</div>
                    {getRiskLevelBadge(analysisResult.workAnalysis.physicalDemand)}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">精神的負荷</div>
                    {getRiskLevelBadge(analysisResult.workAnalysis.mentalDemand)}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">環境リスク</div>
                    {getRiskLevelBadge(analysisResult.workAnalysis.environmentalRisk)}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">危険レベル</div>
                    {getRiskLevelBadge(analysisResult.workAnalysis.hazardLevel)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">推定スコア</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">肉体因</div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResult.estimatedScore.physical)}`}>
                      {analysisResult.estimatedScore.physical}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">精神因</div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResult.estimatedScore.mental)}`}>
                      {analysisResult.estimatedScore.mental}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">環境因</div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResult.estimatedScore.environmental)}`}>
                      {analysisResult.estimatedScore.environmental}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">危険因</div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysisResult.estimatedScore.hazard)}`}>
                      {analysisResult.estimatedScore.hazard}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">3K指数</div>
                    <div className={`text-3xl font-bold ${getScoreColor(Math.max(analysisResult.estimatedScore.physical, analysisResult.estimatedScore.mental, analysisResult.estimatedScore.environmental, analysisResult.estimatedScore.hazard))}`}>
                      {analysisResult.estimatedScore.final3K}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">AI推奨事項</h3>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {rec.factorType === 'physical' ? '肉体因子' :
                           rec.factorType === 'mental' ? '精神因子' :
                           rec.factorType === 'environmental' ? '環境因子' : '危険因子'}
                        </h4>
                        <span className="text-sm text-gray-500">
                          信頼度: {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.reasoning}</p>
                      <div className="text-xs text-gray-500">
                        推奨設定項目: {rec.recommendations.length}件
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {analysisResult && (
                `分析完了: 推奨事項 ${analysisResult.recommendations.length}件`
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
              >
                閉じる
              </Button>
              {analysisResult && (
                <>
                  <Button
                    onClick={() => {
                      setAnalysisResult(null)
                      setImageAnalysisResult(null)
                      setUploadedImages([])
                      setTranscription('')
                      setActiveTab('voice')
                    }}
                    variant="outline"
                  >
                    再分析
                  </Button>
                  <Button
                    onClick={handleApplyRecommendations}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm">⬇️</span>
                    推奨設定を適用
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}