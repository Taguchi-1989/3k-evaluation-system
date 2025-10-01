'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { AIAnalysisResult, WorkAnalysisInput} from '@/lib/aiAssistant';
import { aiAssistant } from '@/lib/aiAssistant'
import { ImageAnalysisResult, aiImageAnalysis } from '@/lib/aiImageAnalysis'
import { LazyLoadWrapper } from '@/components/optimized/LazyLoadWrapper'
// カスタムSVGアイコンコンポーネント
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const BrainIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

export interface AIResultPopupProps {
  isOpen: boolean
  onClose: () => void
  onApplyRecommendations?: (result: AIAnalysisResult) => void
  workInfo?: {
    workName: string
    factoryName: string
    processName: string
  }
}

export function AIResultPopup({
  isOpen,
  onClose,
  onApplyRecommendations,
  workInfo
}: AIResultPopupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
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
    } catch (error) {
      console.error('AI分析エラー:', error)
    }
    setIsLoading(false)
  }

  const handleVoiceTranscription = (text: string) => {
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">AI自動選択アシスタント</h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>

          {!analysisResult ? (
            <div className="space-y-6">
              {/* 作業情報入力 */}
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

              {/* 作業説明入力 */}
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

              {/* 音声入力 */}
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
                  onClick={handleAnalyze}
                  disabled={isLoading || !workInput.workName}
                  variant="primary"
                  className="px-6 py-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      AI分析中...
                    </>
                  ) : (
                    'AI分析実行'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 分析結果概要 */}
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

              {/* 推定スコア */}
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

              {/* 推奨事項 */}
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

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setAnalysisResult(null)}
                  variant="outline"
                >
                  再分析
                </Button>
                <Button
                  onClick={handleApplyRecommendations}
                  variant="primary"
                >
                  推奨設定を適用
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}