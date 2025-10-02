'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FileUpload, HelpTooltip } from '@/components/ui'
import { InteractiveButton } from '@/components/ui/InteractiveButton'
import { PhotoViewer, PsychologicalStressAssessment } from '@/components/evaluation'
import { calculationEngine } from '@/lib/calculation'
import type { MentalDetails, PsychologicalStressEvent } from '@/types/evaluation'
import { AIResultPopup } from '@/components/ui/AIResultPopup'
import type { AIAnalysisResult } from '@/lib/aiAssistant'
import { EVALUATION_STANDARDS, DEFAULT_EVALUATION_DATA } from '@/data/defaultEvaluationData'

export interface MentalFactorItem {
  id: string
  label: string
  isChecked: boolean
  hasDetail?: boolean
  selectValue?: string
  inputValue?: string
  durationValue?: string
  selectOptions?: string[]
  category: 'failure' | 'concentration' | 'cognitiveLoad' | 'emotionalBurden' | 'skillUtilization' | 'workControl'
  durationOptions?: string[]
}

export interface MentalFactorDetailProps {
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
  mentalFactorItems?: MentalFactorItem[]
}

// 精神因子評価スケール型定義
interface MentalEvaluationScale {
  level: string
  score: number
}

interface MentalEvaluationScales {
  severity?: MentalEvaluationScale[]
  duration?: MentalEvaluationScale[]
}

interface MentalStandards {
  scales?: MentalEvaluationScales
  [key: string]: unknown
}

// デフォルトデータから精神因子項目を生成
const generateMentalFactorItems = (): MentalFactorItem[] => {
  const mentalStandards = EVALUATION_STANDARDS.mental as MentalStandards | undefined
  const defaultData = DEFAULT_EVALUATION_DATA.mentalFactor

  // データが存在しない場合はデフォルトの空配列を返す
  if (!defaultData || !defaultData.categories) {
    return []
  }

  const severityOptions = mentalStandards?.scales?.severity?.map((s) => s.level) || ['軽微', '中程度', '重大', '深刻']
  const durationOptions = mentalStandards?.scales?.duration?.map((d) => d.level) || ['短時間', '中時間', '長時間', '継続的']

  return defaultData.categories.map((category, index) => ({
    id: `${index + 1}`,
    label: category.name,
    isChecked: category.defaultSelected || false,
    hasDetail: category.hasSubItems || false,
    selectValue: category.defaultSeverity || '',
    inputValue: '',
    selectOptions: severityOptions,
    category: category.type as 'failure' | 'concentration' | 'cognitiveLoad' | 'emotionalBurden' | 'skillUtilization' | 'workControl',
    durationOptions
  }))
}

const defaultMentalFactorItems: MentalFactorItem[] = generateMentalFactorItems() || [
  {
    id: '1',
    label: '仕事の質(失敗)',
    isChecked: false,
    hasDetail: true,
    category: 'failure',
    selectOptions: ['ほとんどない（仮）', '稀にある（仮）', '時々ある（仮）', '頻繁にある（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  },
  {
    id: '2', 
    label: '仕事の質(集中力)',
    isChecked: true,
    selectValue: '中程度の集中を要する',
    inputValue: '40',
    category: 'concentration',
    selectOptions: ['ほとんど集中を要しない（仮）', '軽度の集中を要する（仮）', '中程度の集中を要する（仮）', '高度な集中を要する（仮）', '極めて高度な集中を要する（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  },
  {
    id: '3',
    label: '認知負荷',
    isChecked: true,
    selectValue: 'どちらとも言えない',
    inputValue: '20',
    category: 'cognitiveLoad',
    selectOptions: ['ない（仮）', 'あまりない（仮）', 'どちらとも言えない（仮）', '比較的ある（仮）', 'ある（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  },
  {
    id: '4',
    label: '感情負担',
    isChecked: false,
    selectValue: 'あまりない',
    inputValue: '10',
    category: 'emotionalBurden',
    selectOptions: ['ない（仮）', 'あまりない（仮）', 'どちらとも言えない（仮）', '比較的ある（仮）', 'ある（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  },
  {
    id: '5',
    label: '技能活用度',
    isChecked: false,
    selectValue: 'どちらとも言えない',
    inputValue: '30',
    category: 'skillUtilization',
    selectOptions: ['高い（仮）', 'やや高い（仮）', 'どちらとも言えない（仮）', 'やや低い（仮）', '低い（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  },
  {
    id: '6',
    label: '作業統制度',
    isChecked: false,
    selectValue: '高い',
    inputValue: '20',
    category: 'workControl',
    selectOptions: ['高い（仮）', 'やや高い（仮）', 'どちらとも言えない（仮）', 'やや低い（仮）', '低い（仮）'],
    durationOptions: ['5%', '10%', '15%', '20%', '40%', '60%', '80%']
  }
]

export function MentalFactorDetail({
  evaluationNo: _evaluationNo,
  creator: _creator,
  checker: _checker,
  workInfo,
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Photo',
  mentalFactorItems = defaultMentalFactorItems
}: MentalFactorDetailProps): React.JSX.Element {
  const [factorItems, setFactorItems] = useState(mentalFactorItems)
  const [calculatedScore, setCalculatedScore] = useState(1)
  const [calculationDetails, setCalculationDetails] = useState<Record<string, unknown> | null>(null)
  const [workTimeHours, setWorkTimeHours] = useState(8)
  const [showAIPopup, setShowAIPopup] = useState(false)

  // 厚生労働省基準準拠の心理的負荷評価
  const [psychologicalStressScore, setPsychologicalStressScore] = useState(1)
  const [psychologicalStressEvents, setPsychologicalStressEvents] = useState<PsychologicalStressEvent[]>([])
  const [showStressAssessment, setShowStressAssessment] = useState(false)

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setFactorItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isChecked: checked } : item
    ))
  }

  const handleSelectChange = (itemId: string, value: string) => {
    setFactorItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, selectValue: value } : item
    ))
  }

  const _handleInputChange = (itemId: string, value: string): void => {
    setFactorItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, inputValue: value } : item
    ))
  }

  const handleDurationChange = (itemId: string, value: string) => {
    setFactorItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, durationValue: value } : item
    ))
  }

  const handleAIRecommendations = (result: AIAnalysisResult): void => {
    // AI推奨に基づいてフォームを更新
    const mentalRecommendation = result.recommendations.find(r => r.factorType === 'mental')
    if (mentalRecommendation && mentalRecommendation.recommendations) {
      setFactorItems(prev => {
        const updated = [...prev]
        mentalRecommendation.recommendations.forEach((rec) => {
          const recommendation = rec as Partial<MentalFactorItem> & { id?: string }
          const itemIndex = updated.findIndex(item => item.id === recommendation.id)
          if (itemIndex !== -1 && typeof recommendation.id === 'string') {
            updated[itemIndex] = { ...updated[itemIndex], ...recommendation } as MentalFactorItem
          }
        })
        return updated
      })
    }

    // 作業時間も更新
    if (result.estimatedScore) {
      setWorkTimeHours(8) // デフォルトまたは推定値
    }
  }

  const _handleFileUpload = (_files: FileList): void => {
    // TODO: Process uploaded files
  }

  // 心理的負荷評価のハンドラー
  const handlePsychologicalStressChange = useCallback((score: number, events: PsychologicalStressEvent[]) => {
    setPsychologicalStressScore(score)
    setPsychologicalStressEvents(events)
  }, [])

  const handleStressEvaluation = () => {
    window.location.href = '/evaluation/mental/stress'
  }

  const handleFocusEvaluation = () => {
    window.location.href = '/evaluation/mental/focus'
  }

  const _handleBackToMain = (): void => {
    window.location.href = '/evaluation/new'
  }

  const _handleBackToDashboard = (): void => {
    window.location.href = '/dashboard'
  }

  // 精神因子の計算ロジック
  const mentalDetails: MentalDetails = useMemo(() => {
    const workQuality: Record<string, unknown> = {}
    const concentration: Record<string, unknown> = {}
    const cognitiveLoad: Record<string, unknown> = {}
    const emotionalBurden: Record<string, unknown> = {}
    const skillUtilization: Record<string, unknown> = {}
    const workControl: Record<string, unknown> = {}
    
    factorItems.forEach(item => {
      if (!item.isChecked) return
      
      const level = item.selectValue || 'どちらとも言えない（仮）'
      const duration = item.durationOptions?.includes(item.inputValue + '%') 
        ? item.inputValue + '%' 
        : item.durationOptions?.[0] || '20%'
      
      switch(item.category) {
        case 'failure':
          workQuality.failure = { level, duration }
          break
        case 'concentration':
          concentration.level = level
          concentration.duration = duration
          break
        case 'cognitiveLoad':
          cognitiveLoad.level = level
          cognitiveLoad.duration = duration
          break
        case 'emotionalBurden':
          emotionalBurden.level = level
          emotionalBurden.duration = duration
          break
        case 'skillUtilization':
          skillUtilization.level = level
          skillUtilization.duration = duration
          break
        case 'workControl':
          workControl.level = level
          workControl.duration = duration
          break
      }
    })
    
    return { 
      workQuality: Object.keys(workQuality).length > 0 ? workQuality : undefined,
      concentration: Object.keys(concentration).length > 0 ? concentration : undefined,
      cognitiveLoad: Object.keys(cognitiveLoad).length > 0 ? cognitiveLoad : undefined,
      emotionalBurden: Object.keys(emotionalBurden).length > 0 ? emotionalBurden : undefined,
      skillUtilization: Object.keys(skillUtilization).length > 0 ? skillUtilization : undefined,
      workControl: Object.keys(workControl).length > 0 ? workControl : undefined
    }
  }, [factorItems])

  // スコア計算の実行（従来評価 + 心理的負荷評価の統合）
  useEffect(() => {
    try {
      const workTimeFactor = workTimeHours > 8 ? 1.2 : workTimeHours > 6 ? 1.1 : 1.0
      const result = calculationEngine.calculateMentalScore(mentalDetails, workTimeFactor, true)

      // 従来評価と心理的負荷評価の統合（最高点優先）
      const integratedScore = Math.max(result.score, psychologicalStressScore)

      setCalculatedScore(integratedScore)
      setCalculationDetails({
        ...result.details,
        psychologicalStressScore,
        psychologicalStressEvents: psychologicalStressEvents.length,
        integrationMethod: '最高点優先統合'
      })
    } catch (error) {
      console.error('精神因子スコアの計算エラー:', error)
      setCalculatedScore(Math.max(1, psychologicalStressScore))
    }
  }, [mentalDetails, workTimeHours, psychologicalStressScore, psychologicalStressEvents])

  // 3K指数の決定
  const get3KIndex = (score: number): string => {
    if (score >= 7) return 'A'
    if (score >= 4) return 'B' 
    if (score >= 2) return 'C'
    return 'D'
  }

  // リスクレベルの色を取得
  const getScoreColor = (score: number): string => {
    if (score >= 7) return 'text-red-600'
    if (score >= 4) return 'text-orange-600'
    if (score >= 2) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="aspect-container">
      <section className="flex-grow p-3 flex flex-col lg:flex-row gap-3 overflow-hidden bg-white dark:bg-gray-900">
        {/* 左列: 写真ギャラリー & ファイルアップロード */}
        <div className="w-full lg:w-4/12 flex flex-col min-h-0 space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex-grow flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">作業写真</h3>
            <PhotoViewer
              mainPhoto={photoUrl}
              thumbnails={[
                photoUrl,
                'https://placehold.co/120x90/e2e8f0/475569?text=Photo+1',
                'https://placehold.co/120x90/e2e8f0/475569?text=Photo+2',
                'https://placehold.co/120x90/e2e8f0/475569?text=Photo+3',
                'https://placehold.co/120x90/e2e8f0/475569?text=Photo+4'
              ]}
              showGalleryInfo={false}
              className="flex-1 min-h-0"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">写真追加</h3>
            <FileUpload
              variant="photo"
              layout="grid"
              size="sm"
              onFileUpload={_handleFileUpload}
              showButton={false}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* 中央列: 統合評価フォーム */}
        <div data-testid="evaluation-form" className="evaluation-form w-full lg:w-5/12 flex flex-col min-h-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
          {/* ヘッダー部分 */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">精神因子評価（統合版）</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">厚労省準拠</span>
              <HelpTooltip
                title="統合評価について"
                content="従来評価と厚生労働省基準準拠の心理的負荷評価を統合し、最高点優先で評価します。"
                iconSize="sm"
              />
            </div>
            <div className="flex gap-1">
              <InteractiveButton
                variant={!showStressAssessment ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowStressAssessment(false)}
                className="text-xs"
                data-testid="conventional-evaluation-tab"
              >
                従来評価
              </InteractiveButton>
              <InteractiveButton
                variant={showStressAssessment ? "primary" : "ghost"}
                size="sm"
                onClick={() => setShowStressAssessment(true)}
                className="text-xs"
                data-testid="mhlw-standards-tab"
              >
                厚労省基準
              </InteractiveButton>
            </div>
          </div>

          {/* 評価表示エリア */}
          <div className="text-xs space-y-2 overflow-y-auto flex-grow">
            {showStressAssessment ? (
              /* 厚生労働省基準評価 */
              <div className="h-full">
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">厚生労働省基準準拠評価</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    心理的負荷による精神障害の認定基準（令和5年9月改正）に完全準拠
                  </p>
                </div>
                <PsychologicalStressAssessment
                  onScoreChange={handlePsychologicalStressChange}
                  initialEvents={psychologicalStressEvents}
                />
              </div>
            ) : (
              /* 従来評価 + 統合情報 */
              <div className="space-y-3">
                {/* 統合結果サマリー */}
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">統合評価結果</h3>
                    <span className={`text-lg font-bold ${getScoreColor(calculatedScore)}`}>
                      {calculatedScore}点
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">従来評価:</span>
                      <span className="ml-1 font-medium">{Math.max(1, calculatedScore - psychologicalStressScore + 1)}点</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">厚労省基準:</span>
                      <span className="ml-1 font-medium">{psychologicalStressScore}点</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    統合方式: 最高点優先（仕様書準拠）
                  </div>
                </div>

                {/* 従来評価表 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 border-b pb-1">
                    従来評価項目（強度 & 負荷持続）
                  </h3>
                  {factorItems.map((item) => (
                    <div key={item.id} className={`grid grid-cols-[auto_1fr_auto_auto] gap-x-2 items-center p-2 rounded border ${
                      item.isChecked
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                      <input
                        id={`mental-checkbox-${item.id}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={item.isChecked}
                        onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                        aria-label={`${item.label}を選択`}
                      />
                      <label htmlFor={`mental-checkbox-${item.id}`} className="flex items-center font-medium">{item.label}</label>

                      <button
                        aria-label={`${item.label}の詳細情報`}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <svg aria-hidden="true" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {item.hasDetail ? (
                        <InteractiveButton
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 font-medium text-xs"
                          onClick={() => {
                            if (item.label.includes('集中力')) {
                              handleFocusEvaluation()
                            } else if (item.label.includes('ストレス') || item.label.includes('失敗')) {
                              handleStressEvaluation()
                            }
                          }}
                          aria-label={`${item.label}の詳細入力画面に移動`}
                          enableRipple={true}
                        >
                          詳細入力 →
                        </InteractiveButton>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <select
                            id={`mental-severity-${item.id}`}
                            aria-label={`${item.label}の程度選択`}
                            className="border rounded-md p-1 text-xs w-32 bg-white dark:bg-gray-600"
                            value={item.selectValue || ''}
                            onChange={(e) => handleSelectChange(item.id, e.target.value)}
                            disabled={!item.isChecked}
                          >
                            {item.selectOptions?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <select
                            id={`mental-duration-${item.id}`}
                            aria-label={`${item.label}の時間割合選択`}
                            className="border rounded-md p-1 text-xs w-20 bg-white dark:bg-gray-600"
                            value={item.durationValue || item.inputValue || '20%'}
                            onChange={(e) => handleDurationChange(item.id, e.target.value)}
                            disabled={!item.isChecked}
                          >
                            {item.durationOptions?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 厚労省基準のサマリー表示 */}
                {psychologicalStressEvents.length > 0 && (
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                      心理的負荷要因検出
                    </h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>検出イベント数:</span>
                        <span className="font-medium">{psychologicalStressEvents.length}件</span>
                      </div>
                      <div className="flex justify-between">
                        <span>厚労省基準スコア:</span>
                        <span className="font-bold text-orange-600">{psychologicalStressScore}点</span>
                      </div>
                      <InteractiveButton
                        variant="primary"
                        size="sm"
                        onClick={() => setShowStressAssessment(true)}
                        className="w-full mt-2 text-xs"
                      >
                        詳細を確認 →
                      </InteractiveButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右列: 基準書表示・結果 */}
        <div className="w-full lg:w-3/12 flex flex-col min-h-0 space-y-3">
          <div className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <h3 className="text-sm font-bold mb-2">基準書表示</h3>
            <div className="text-xs text-gray-600 space-y-2">
              {showStressAssessment ? (
                <>
                  <p className="font-semibold text-blue-800">厚生労働省基準準拠:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>心理的負荷: 強・中・弱の3段階</li>
                    <li>時間外労働: 80h/月(中)、100h/月(強)</li>
                    <li>ハラスメント: 継続性・重篤度評価</li>
                    <li>5段階変換: 5点=最高リスク</li>
                  </ul>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="font-semibold">法的根拠:</p>
                    <p>心理的負荷による精神障害の認定基準（令和5年9月改正）</p>
                  </div>
                  {psychologicalStressEvents.length > 0 && (
                    <div className="mt-2 p-2 bg-orange-50 rounded">
                      <p className="font-semibold">検出イベント:</p>
                      <p>{psychologicalStressEvents.length}件の心理的負荷要因</p>
                      <p className="text-red-600">スコア: {psychologicalStressScore}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p>精神的負荷に関する評価基準：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>集中力: 1-10ポイントで評価</li>
                    <li>認知負荷: 持続時間で補正</li>
                    <li>感情負担: 作業特性を考慮</li>
                    <li>技能活用: 逆評価(低いほどリスク)</li>
                  </ul>
                </>
              )}
              {calculationDetails && (
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                  <p className="font-semibold">計算詳細:</p>
                  {Object.entries(calculationDetails).map(([key, value]: [string, unknown]) => (
                    <div key={key} className="mt-1">
                      <span className="font-medium">{key}:</span> {
                        typeof value === 'string' || typeof value === 'number'
                          ? String(value)
                          : JSON.stringify(value, null, 2)
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-sm font-bold text-gray-700">計算結果</h3>
                <HelpTooltip
                  title="計算結果について"
                  content="選択した評価項目の強度と持続時間を基に、精神因子のスコアを自動計算しています。スコアが高いほど精神的負荷が大きいことを示します。"
                  iconSize="sm"
                />
              </div>
              <div className="mt-2">
                <span className={`text-3xl font-bold ${getScoreColor(calculatedScore)}`}>{calculatedScore}</span>
                <p className="text-xs text-gray-500 mt-1">精神因スコア</p>
              </div>
              <div className="mt-3 text-xs">
                <div className={`font-bold ${getScoreColor(calculatedScore)}`}>
                  3K指数: {get3KIndex(calculatedScore)}
                </div>
                <div className="text-gray-500 mt-1">
                  作業時間: {workTimeHours}h
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <label htmlFor="work-time-hours" className="text-xs text-gray-500">作業時間 (時間)</label>
              <input
                id="work-time-hours"
                type="number"
                min="1"
                max="24"
                value={workTimeHours}
                onChange={(e) => setWorkTimeHours(Number(e.target.value))}
                className="w-full mt-1 p-1 border rounded text-xs text-center"
                aria-label="作業時間を入力（1-24時間）"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI結果ポップアップ */}
      <AIResultPopup
        isOpen={showAIPopup}
        onClose={() => setShowAIPopup(false)}
        onApplyRecommendations={handleAIRecommendations}
        workInfo={workInfo}
      />
    </div>
  )
}