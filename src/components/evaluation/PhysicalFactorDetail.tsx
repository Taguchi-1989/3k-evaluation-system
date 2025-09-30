'use client'

import { useState, useEffect, useCallback } from 'react'
import { TabInterface } from '@/components/ui/TabInterface'
import { Input, HelpTooltip } from '@/components/ui'
import { InteractiveButton } from '@/components/ui/InteractiveButton'
import { PostureList, MatrixDisplay, type Posture } from '@/components/evaluation'
import { StandardsLegend } from '@/components/evaluation/StandardsLegend'
import { AIComprehensiveAssistant } from '@/components/ui/AIComprehensiveAssistant'
import matrixData from '@/data/evaluation-matrix.json'
import { evaluationEngine } from '@/lib/evaluationEngine'
import { EVALUATION_STANDARDS, DEFAULT_EVALUATION_DATA } from '@/data/defaultEvaluationData'
import { AIAnalysisResult } from '@/lib/aiAssistant'
import { useEvaluationDataStore } from '@/stores/evaluationDataStore'
import { useEvaluationAutoSave } from '@/hooks/useAutoSave'
import { OptimizedImage } from '@/components/optimized/OptimizedImage'
import type { PhysicalDetails } from '@/types/evaluation'

// ポップアップコンポーネント
const InfoPopup = ({ isOpen, onClose, title, content }: {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {content}
        </div>
      </div>
    </div>
  )
}

export interface PhysicalFactorDetailProps {
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
  postures?: Posture[]
}

export function PhysicalFactorDetail({
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/400x300/e5e7eb/4b5563?text=Photo',
  postures
}: PhysicalFactorDetailProps) {
  // Work information state for editable inputs
  const [workName, setWorkName] = useState(workInfo?.workName || '')
  const [factoryName, setFactoryName] = useState(workInfo?.factoryName || '')
  const [processName, setProcessName] = useState(workInfo?.processName || '')

  // Help modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  // デフォルトデータの初期化
  const defaultPhysicalData = DEFAULT_EVALUATION_DATA.physicalDefaults
  const physicalStandards = EVALUATION_STANDARDS.physical
  const [selectedPosture, setSelectedPosture] = useState<string>('')
  const [selectedEvaluationMethod, setSelectedEvaluationMethod] = useState<string>('RULA評価')
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState<boolean>(false)
  
  // Comprehensive evaluation state
  const [selectedComprehensivePosture, setSelectedComprehensivePosture] = useState<string>('良い〜')
  const [selectedStrength, setSelectedStrength] = useState<string>('軽い')
  const [selectedDuration, setSelectedDuration] = useState<string>('<10%')
  const [calculatedScore, setCalculatedScore] = useState<number>(1)
  const [physicalDetails, setPhysicalDetails] = useState<PhysicalDetails>({
    checkboxes: {},
    targetWeight: {},
    muscleStrength: {},
    protectiveEquipment: 'なし',
    eyeStrain: '対象無し'
  })
  const [realTimeEvaluation, setRealTimeEvaluation] = useState<any>(null)
  
  // ポップアップ状態
  const [popupInfo, setPopupInfo] = useState<{isOpen: boolean, title: string, content: string}>({
    isOpen: false,
    title: '',
    content: ''
  })

  // AI機能状態
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false)

  // Result display states
  const [showScoreResult, setShowScoreResult] = useState<boolean>(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false)

  // データ永続化
  const { updateFactorData, currentEvaluation } = useEvaluationDataStore()

  // 評価データの作成
  const evaluationData = {
    physicalDetails,
    selectedComprehensivePosture,
    selectedStrength,
    selectedDuration,
    calculatedScore,
    selectedPosture,
    selectedEvaluationMethod
  }

  // 自動保存機能
  const { manualSave, hasUnsavedChanges } = useEvaluationAutoSave(evaluationData, currentEvaluation?.id)

  const showPopup = (title: string, content: string) => {
    setPopupInfo({ isOpen: true, title, content })
  }

  const closePopup = () => {
    setPopupInfo({ isOpen: false, title: '', content: '' })
  }

  // AI推奨設定を適用するハンドラー
  const handleApplyAIRecommendations = (result: AIAnalysisResult) => {
    // 肉体因子の推奨設定を適用
    if (result.recommendations.some(rec => rec.factorType === 'physical')) {
      // 推定スコアに基づいて姿勢評価を設定
      const physicalScore = result.estimatedScore.physical

      if (physicalScore >= 6) {
        setSelectedComprehensivePosture('悪い')
        setSelectedStrength('重い')
        setSelectedDuration('50-80%')
      } else if (physicalScore >= 3) {
        setSelectedComprehensivePosture('普通')
        setSelectedStrength('普通')
        setSelectedDuration('10-50%')
      } else {
        setSelectedComprehensivePosture('良い〜')
        setSelectedStrength('軽い')
        setSelectedDuration('<10%')
      }

      // 作業内容に基づいてチェックボックスを設定
      const newCheckboxes = { ...physicalDetails.checkboxes }
      const workDescription = result.workAnalysis

      if (workDescription.physicalDemand === 'high') {
        newCheckboxes['weight-10kg'] = true
        newCheckboxes['posture-bad'] = true
      }

      setPhysicalDetails(prev => ({
        ...prev,
        checkboxes: newCheckboxes
      }))

      // 成功メッセージを表示
      showPopup('AI推奨設定適用', 'AI分析結果に基づいて肉体因子の設定が適用されました。')
    }
  }

  // Real-time evaluation calculation
  const performRealTimeEvaluation = useCallback(async () => {
    try {
      const result = await evaluationEngine.calculateIndividualFactor(
        'physical',
        physicalDetails,
        {
          postures: postures || [],
          workTimeFactor: 1.0
        }
      )
      setRealTimeEvaluation(result)
      // Real-time evaluation completed

      // データストアに保存 - create evaluation data inside function to avoid dependency issues
      const currentEvaluationData = {
        physicalDetails,
        selectedComprehensivePosture,
        selectedStrength,
        selectedDuration,
        calculatedScore,
        selectedPosture,
        selectedEvaluationMethod
      }
      updateFactorData('physicalFactor', currentEvaluationData)
    } catch (error) {
      console.error('Evaluation error:', error)
    }
  }, [physicalDetails, postures, updateFactorData, selectedComprehensivePosture, selectedStrength, selectedDuration, calculatedScore, selectedPosture, selectedEvaluationMethod])

  // Calculate comprehensive score when selections change
  useEffect(() => {
    const comprehensiveMatrix = matrixData.COMPREHENSIVE
    if (comprehensiveMatrix && comprehensiveMatrix.matrix) {
      const postureMatrix = comprehensiveMatrix.matrix[selectedComprehensivePosture]
      if (postureMatrix && postureMatrix[selectedDuration]) {
        const strengthIndex = comprehensiveMatrix.strengthLevels.indexOf(selectedStrength)
        if (strengthIndex !== -1) {
          const score = postureMatrix[selectedDuration][strengthIndex]
          setCalculatedScore(score)
        }
      }
    }
  }, [selectedComprehensivePosture, selectedStrength, selectedDuration])

  // Trigger real-time evaluation when physical details change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performRealTimeEvaluation()
    }, 500) // 500ms debounce

    return () => clearTimeout(debounceTimer)
  }, [physicalDetails, selectedComprehensivePosture, selectedStrength, selectedDuration, calculatedScore, selectedPosture, selectedEvaluationMethod])

  const handlePostureInput = () => {
    window.location.href = '/evaluation/physical/posture'
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard'
  }

  // Tab 1: 強度
  const strengthTab = (
    <div className="space-y-2 text-sm">
      {/* ヘッダー行 */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 border-b border-gray-300 bg-gray-50 rounded text-xs font-medium">
        <span>強度項目</span>
        <div className="w-16 text-center flex items-center justify-center gap-1">
          <span>実測値(kg)</span>
          <HelpTooltip
            title="実測値について"
            content="実際に測定した重量や力の値をキログラム単位で入力してください。この値は作業負荷の計算に使用されます。"
            iconSize="sm"
          />
        </div>
        <span className="w-16 text-center">負荷割合(%)</span>
      </div>
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
            onChange={(e) => {
              setPhysicalDetails(prev => ({
                ...prev,
                checkboxes: {
                  ...prev.checkboxes,
                  weightBoth: e.target.checked
                }
              }))
            }}
          />
          <span className="ml-2 text-xs text-gray-800 dark:text-gray-200">対象重量(両手)</span>
        </label>
        <Input 
          className="w-16 p-1 text-right text-xs" 
          placeholder="kg"
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0
            setPhysicalDetails(prev => ({
              ...prev,
              targetWeight: {
                ...prev.targetWeight,
                bothHands: { kg: value, percentage: 0 }
              }
            }))
          }}
        />
        <Input className="w-16 p-1 text-right text-xs" placeholder="%" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <label className="flex items-center">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
          <span className="ml-2 text-xs text-gray-800 dark:text-gray-200">対象重量(片手)</span>
        </label>
        <Input className="w-16 p-1 text-right text-xs" placeholder="kg" />
        <Input className="w-16 p-1 text-right text-xs" placeholder="%" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <label className="flex items-center">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
          <span className="ml-2 text-xs text-gray-800 dark:text-gray-200">使用筋力</span>
        </label>
        <Input className="w-16 p-1 text-right text-xs" placeholder="kg" />
        <Input className="w-16 p-1 text-right text-xs" placeholder="%" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <label className="flex items-center">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
          <span className="ml-2 text-xs text-gray-800 dark:text-gray-200">保護具</span>
          <button 
            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" 
            title="保護具の詳細情報"
            onClick={() => showPopup('保護具について', EVALUATION_STANDARDS.physical.protectiveEquipment?.description || '保護具無し・クリーン服作業: 軽い\n呼吸器付作業着・適防耐火服(一部なし): 適防耐火服\n適防耐火服(一式すべて): 対象無し')}
          >
            <svg className="h-3 w-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.448-2.09 1.172-2.828M12 14v.01M12 18v-2m-3-5a3 3 0 116 0 3 3 0 01-6 0z" />
            </svg>
          </button>
        </label>
        <select className="w-20 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {physicalStandards.protectiveEquipment?.levels?.map((level) => (
            <option key={level} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">{level}</option>
          )) || [
            <option key="none" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">なし</option>,
            <option key="no-protection" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">保護具無し</option>,
            <option key="clean-suit" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">クリーン服作業</option>,
            <option key="respirator" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">呼吸器付作業着</option>,
            <option key="fire-suit-partial" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">適防耐火服(一部なし)</option>,
            <option key="fire-suit-full" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">適防耐火服(一式すべて)</option>,
            <option key="na" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">対象無し</option>
          ]}
        </select>
        <Input className="w-16 p-1 text-right text-xs" placeholder="%" />
      </div>
      
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
        <label className="flex items-center">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600" />
          <span className="ml-2 text-xs text-gray-800 dark:text-gray-200">眼精疲労</span>
          <button 
            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" 
            title="眼精疲労の詳細情報"
            onClick={() => showPopup('眼精疲労について', EVALUATION_STANDARDS.physical.eyeStrain?.description || '対象無し: 眼精疲労による負担がない\n軽度: わずかに眼の疲れを感じる\n中度: 明らかに眼の疲れを感じる\n重度: 眼の痛み、頭痛を伴う\n限界: 作業継続が困難')}
          >
            <svg className="h-3 w-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.448-2.09 1.172-2.828M12 14v.01M12 18v-2m-3-5a3 3 0 116 0 3 3 0 01-6 0z" />
            </svg>
          </button>
        </label>
        <select className="w-20 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {physicalStandards.eyeStrain?.levels?.map((level) => (
            <option key={level} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">{level}</option>
          )) || [
            <option key="na" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">対象無し</option>,
            <option key="light" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">軽度</option>,
            <option key="moderate" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">中度</option>,
            <option key="severe" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">重度</option>,
            <option key="critical" className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">限界</option>
          ]}
        </select>
        <Input className="w-16 p-1 text-right text-xs" placeholder="%" />
      </div>
      
      <div className="p-1 mt-2 border-t pt-2 text-xs space-y-3">
        <div className="space-y-2 border-t pt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold">強度レベル選択</p>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">仮入力</span>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="strength-select">強度:</label>
            <select 
              id="strength-select" 
              className="border rounded-md p-1 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
            >
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" value="軽い">軽い（仮）</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" value="少しきつい">少しきつい</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" value="きつい">きつい</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" value="とてもきつい">とてもきつい</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" value="ほとんど限界">ほとんど限界</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  // Tab 2: 持続時間
  const durationTab = (
    <div className="space-y-2 text-sm">
      <div className="p-2 border-b border-gray-300 bg-gray-50 rounded text-xs font-medium">
        <span>持続時間設定</span>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-3">
          <div>
            <label htmlFor="duration-percentage" className="block text-sm font-medium mb-1">負荷持続時間 (%):</label>
            <Input 
              id="duration-percentage"
              type="number" 
              className="w-full p-2 text-sm" 
              placeholder="例: 25" 
              min="0" 
              max="100"
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                if (value < 10) {
                  setSelectedDuration('<10%')
                } else if (value <= 50) {
                  setSelectedDuration('10-50%')
                } else {
                  setSelectedDuration('>50%')
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">作業時間に対する負荷がかかる時間の割合</p>
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="duration-select" className="text-sm">自動判定結果:</label>
            <select 
              id="duration-select" 
              className="border rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-32 border-gray-300 dark:border-gray-600"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">&lt;10%</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">10-50%</option>
              <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">&gt;50%</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2 border-t pt-2">
          <p className="text-sm font-medium">時間詳細設定</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block">作業時間(分):</label>
              <Input className="w-full p-1 text-xs" placeholder="例: 480" />
            </div>
            <div>
              <label className="block">休憩間隔(分):</label>
              <Input className="w-full p-1 text-xs" placeholder="例: 60" />
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <p className="font-medium">持続時間の目安:</p>
          <ul className="mt-1 space-y-1">
            <li>• &lt;10%: 短時間の作業（5分未満の連続作業）</li>
            <li>• 10-50%: 中程度の作業（5-30分の連続作業）</li>
            <li>• &gt;50%: 長時間の作業（30分以上の連続作業）</li>
          </ul>
        </div>
      </div>
    </div>
  )

  // Tab 3: 作業設定
  const workSettingTab = (
    <div className="space-y-3 text-sm">
      <div className="space-y-2">
        <p className="font-bold">評価手法選択</p>
        <div className="relative">
          <div className="flex items-center justify-between">
            <label className="text-xs">使用する評価手法:</label>
            <div className="relative">
              <button
                onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                className="flex items-center justify-between w-32 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className="truncate">{selectedEvaluationMethod}</span>
                <svg className="w-3 h-3 ml-1 transition-transform" style={{transform: isMethodDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <path d="M6 9L12 3L18 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isMethodDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
                  {['NIOSH式', 'RULA評価', 'OWAS評価', '独自基準'].map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setSelectedEvaluationMethod(method)
                        setIsMethodDropdownOpen(false)
                      }}
                      className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
        <div>
          <p className="text-gray-800 dark:text-gray-200 font-medium">詳細姿勢評価</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">RULA/OWAS評価を実施</p>
        </div>
        <InteractiveButton
          variant="secondary"
          size="sm"
          onClick={handlePostureInput}
          className="text-blue-600 dark:text-blue-400"
          aria-label="詳細姿勢評価の入力画面に移動"
          enableRipple={true}
          feedbackIntensity="normal"
        >
          姿勢入力 →
        </InteractiveButton>
      </div>
    </div>
  )

  const tabs = [
    { id: 'tab1', label: '① 強度', content: strengthTab },
    { id: 'tab2', label: '② 持続時間', content: durationTab },
    { id: 'tab3', label: '③ 作業設定', content: workSettingTab }
  ]

  return (
    <div className="evaluation-content flex flex-col h-full mobile-chrome-visible form-mobile-optimized mobile-chrome-enhanced-visibility">
      {/* Work Information Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 p-4">
        <h3 className="text-sm font-bold mb-3 text-gray-800 dark:text-gray-200">作業情報</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">作業名</label>
            <Input
              data-testid="work-name-input"
              value={workName}
              onChange={(e) => setWorkName(e.target.value)}
              placeholder="作業名を入力"
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">工場名</label>
            <Input
              data-testid="factory-name-input"
              value={factoryName}
              onChange={(e) => setFactoryName(e.target.value)}
              placeholder="工場名を入力"
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">工程名</label>
            <Input
              data-testid="process-name-input"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="工程名を入力"
              className="w-full text-sm"
            />
          </div>
        </div>
      </div>

      <section className="flex-grow p-3 flex flex-row gap-3 overflow-hidden bg-white dark:bg-gray-900">
        {/* 左列: 写真 & 姿勢リスト */}
        <div className="w-1/3 flex flex-col h-full space-y-3">
          <div className="flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center p-2 h-40">
            <OptimizedImage
              src={photoUrl}
              alt="関連写真"
              width={300}
              height={200}
              className="evaluation-photo rounded object-cover w-full h-full"
              priority="normal"
            />
          </div>

          {/* AI自動選択ボタン */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-lg">🧠</span>
              AI自動選択
            </button>
          </div>

          {/* 保存状態表示 */}
          <div className="flex-shrink-0">
            {hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                未保存の変更があります
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                保存済み
              </div>
            )}
            <button
              onClick={manualSave}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              手動保存
            </button>
          </div>

          {/* Posture Help Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">姿勢評価</h3>
              <button
                data-testid="posture-help-button"
                onClick={() => setIsHelpModalOpen(true)}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                ヘルプ
              </button>
            </div>
          </div>

          {/* Score Selection Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
            {/* Posture Score Selection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">姿勢スコア</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    data-testid={`posture-score-${score}`}
                    className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Repetition Score Selection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">反復スコア</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    data-testid={`repetition-score-${score}`}
                    className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <PostureList
            postures={postures}
            onPostureSelect={setSelectedPosture}
            onAddPosture={() => {/* TODO: Add new posture */}}
          />
        </div>

        {/* 中央列: 入力フォーム (タブ形式) */}
        <form className="w-1/3 flex flex-col h-full evaluation-form" role="form">
          <TabInterface tabs={tabs} defaultTab="tab1" />
          
          {/* 備考欄 */}
          <div className="p-2 border-t flex-shrink-0 text-xs space-y-1 bg-gray-50 dark:bg-gray-800 h-1/3 overflow-y-auto">
            <h3 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">備考欄</h3>
            <div className="space-y-2">
              <textarea 
                className="w-full h-16 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
                placeholder="肉体因子に関する特記事項、観察内容、改善提案などを記入してください。&#10;&#10;例:&#10;・作業姿勢で気になった点&#10;・使用している保護具の状態&#10;・作業環境の影響&#10;・改善案や対策"
              ></textarea>
              
              <div className="text-gray-600 dark:text-gray-400 border-t pt-2">
                <p className="font-medium text-[10px] mb-1">記入のポイント:</p>
                <ul className="text-[9px] space-y-0.5">
                  <li>• 数値では表せない観察事項</li>
                  <li>• 作業者の疲労感や負担感</li>
                  <li>• 一時的な作業環境の変化</li>
                  <li>• 改善提案や対策案</li>
                  <li>• 次回評価時の注意点</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* 右列: 評価マトリクス, 結果 & 備考 */}
        <div className="w-1/3 flex flex-col h-full space-y-3">
          <StandardsLegend factorType="physical" className="flex-shrink-0" />
          <MatrixDisplay
            type="COMPREHENSIVE"
            title="評価マトリクス"
            onCellClick={(posture, duration, value) => {/* Handle cell selection */}}
            onScoreChange={(score) => {/* Handle score change */}}
          />
          
          {/* 結果表示エリア */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-3 space-y-3">
            {/* マトリックス評価 */}
            <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">RULA マトリックス評価</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calculatedScore}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">基本スコア</p>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>{selectedComprehensivePosture} × {selectedDuration} × {selectedStrength}</p>
              </div>
            </div>

            {/* Calculate and Save Buttons */}
            <div className="flex gap-2">
              <button
                data-testid="calculate-button"
                onClick={() => setShowScoreResult(true)}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                計算実行
              </button>
              <button
                data-testid="save-evaluation"
                onClick={() => setShowSaveSuccess(true)}
                className="flex-1 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                評価保存
              </button>
            </div>

            {/* Score Result Display */}
            {showScoreResult && (
              <div data-testid="score-result" className="score-display p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">計算結果</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>総合スコア: <span className="font-bold">{calculatedScore}</span></p>
                  <p>評価レベル: <span className="font-bold">
                    {calculatedScore <= 2 ? '低リスク' : calculatedScore <= 3 ? '中リスク' : '高リスク'}
                  </span></p>
                </div>
              </div>
            )}

            {/* Save Success Message */}
            {showSaveSuccess && (
              <div data-testid="save-success" className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">評価データが正常に保存されました</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <InfoPopup
        isOpen={popupInfo.isOpen}
        onClose={closePopup}
        title={popupInfo.title}
        content={popupInfo.content}
      />

      {/* AI Comprehensive Assistant */}
      <AIComprehensiveAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyRecommendations={handleApplyAIRecommendations}
        workInfo={workInfo}
      />

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div data-testid="help-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">姿勢評価ヘルプ</h3>
              <button
                data-testid="close-modal"
                onClick={() => setIsHelpModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">姿勢評価について</h4>
                <p>作業者の姿勢を評価して、身体への負担度を測定します。以下の要素を総合的に判断してください：</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">評価のポイント</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>背骨の曲がり：</strong> 前屈み、後屈み、側屈の度合い</li>
                  <li><strong>関節の角度：</strong> 肩、肘、手首、膝の不自然な角度</li>
                  <li><strong>重心のバランス：</strong> 体重の偏りや不安定な姿勢</li>
                  <li><strong>持続時間：</strong> 同じ姿勢を保持する時間</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">スコアの目安</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>1点：</strong> 自然な姿勢、負担なし</li>
                  <li><strong>2点：</strong> わずかな負担、短時間なら問題なし</li>
                  <li><strong>3点：</strong> 中程度の負担、改善が望ましい</li>
                  <li><strong>4点：</strong> 高い負担、早急な改善が必要</li>
                  <li><strong>5点：</strong> 非常に高い負担、即座の対策が必要</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhysicalFactorDetail