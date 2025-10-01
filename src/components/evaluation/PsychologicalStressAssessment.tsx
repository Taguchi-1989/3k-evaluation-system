'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { InteractiveButton } from '@/components/ui/InteractiveButton'
import { HelpTooltip } from '@/components/ui'
import type {
  PsychologicalStressEvent,
  HarassmentAssessment
} from '@/types/evaluation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StressIntensityLevel = any
import {
  WORKPLACE_STRESS_EVENTS,
  mapStressIntensityToFiveStage,
  calculateIntegratedStressScore,
  assessOvertimeWorkStress,
  assessHarassmentStress,
  getLegalBasisInfo
} from '@/lib/psychologicalStressMapping'

export interface PsychologicalStressAssessmentProps {
  onScoreChange?: (score: number, events: PsychologicalStressEvent[]) => void
  initialEvents?: PsychologicalStressEvent[]
}

export function PsychologicalStressAssessment({
  onScoreChange,
  initialEvents = []
}: PsychologicalStressAssessmentProps) {
  const [activeTab, setActiveTab] = useState<'workload' | 'harassment' | 'interpersonal' | 'overtime'>('workload')
  const [stressEvents, setStressEvents] = useState<PsychologicalStressEvent[]>(initialEvents)
  const [overtimeHours, setOvertimeHours] = useState(0)
  const [consecutiveDays, setConsecutiveDays] = useState(0)
  const [showLegalBasis, setShowLegalBasis] = useState(false)

  // ハラスメント評価状態
  const [powerHarassment, setPowerHarassment] = useState<HarassmentAssessment>({
    occurred: false,
    frequency: 'single',
    severity: 'mild',
    duration: 0,
    reportedToAuthority: false,
    witnessesPresent: false,
    organizationalResponse: 'adequate',
    stressIntensity: 'weak',
    fiveStageScore: 1
  })

  const [sexualHarassment, setSexualHarassment] = useState<HarassmentAssessment>({
    occurred: false,
    frequency: 'single',
    severity: 'mild',
    duration: 0,
    reportedToAuthority: false,
    witnessesPresent: false,
    organizationalResponse: 'adequate',
    stressIntensity: 'weak',
    fiveStageScore: 1
  })

  // 統合スコア計算
  const integratedScore = useMemo(() =>
    calculateIntegratedStressScore(stressEvents),
    [stressEvents]
  )

  // 時間外労働評価
  const overtimeAssessment = useMemo(() =>
    assessOvertimeWorkStress(overtimeHours),
    [overtimeHours]
  )

  // ハラスメント評価
  const powerHarassmentAssessment = useMemo(() =>
    assessHarassmentStress(powerHarassment),
    [powerHarassment]
  )

  const sexualHarassmentAssessment = useMemo(() =>
    assessHarassmentStress(sexualHarassment),
    [sexualHarassment]
  )

  useEffect(() => {
    // 時間外労働イベントを追加/更新
    if (overtimeHours > 0) {
      const overtimeEvent: PsychologicalStressEvent = {
        eventType: '時間外労働',
        eventDescription: `月${overtimeHours}時間の時間外労働`,
        startDate: new Date(),
        duration: 30, // 1ヶ月
        stressIntensity: overtimeAssessment.stressIntensity,
        fiveStageScore: overtimeAssessment.fiveStageScore,
        legalBasis: overtimeAssessment.legalBasis,
        mitigatingFactors: [],
        aggravatingFactors: consecutiveDays > 14 ? ['2週間以上の連続勤務'] : []
      }

      setStressEvents(prev => {
        const filtered = prev.filter(e => e.eventType !== '時間外労働')
        return [...filtered, overtimeEvent]
      })
    }
  }, [overtimeHours, consecutiveDays, overtimeAssessment.stressIntensity, overtimeAssessment.fiveStageScore, overtimeAssessment.legalBasis])

  useEffect(() => {
    // ハラスメントイベントを追加/更新
    const harassmentEvents: PsychologicalStressEvent[] = []

    if (powerHarassment.occurred) {
      harassmentEvents.push({
        eventType: 'パワーハラスメント',
        eventDescription: `${powerHarassment.severity}なパワーハラスメント（${powerHarassment.frequency}）`,
        startDate: new Date(),
        duration: powerHarassment.duration,
        stressIntensity: powerHarassmentAssessment.stressIntensity,
        fiveStageScore: powerHarassmentAssessment.fiveStageScore,
        legalBasis: powerHarassmentAssessment.legalBasis,
        mitigatingFactors: powerHarassment.organizationalResponse === 'adequate' ? ['適切な組織対応'] : [],
        aggravatingFactors: powerHarassment.organizationalResponse === 'inadequate' ? ['不適切な組織対応'] : []
      })
    }

    if (sexualHarassment.occurred) {
      harassmentEvents.push({
        eventType: 'セクシャルハラスメント',
        eventDescription: `${sexualHarassment.severity}なセクシャルハラスメント（${sexualHarassment.frequency}）`,
        startDate: new Date(),
        duration: sexualHarassment.duration,
        stressIntensity: sexualHarassmentAssessment.stressIntensity,
        fiveStageScore: sexualHarassmentAssessment.fiveStageScore,
        legalBasis: sexualHarassmentAssessment.legalBasis,
        mitigatingFactors: sexualHarassment.organizationalResponse === 'adequate' ? ['適切な組織対応'] : [],
        aggravatingFactors: sexualHarassment.organizationalResponse === 'inadequate' ? ['不適切な組織対応'] : []
      })
    }

    setStressEvents(prev => {
      const filtered = prev.filter(e => !e.eventType.includes('ハラスメント'))
      return [...filtered, ...harassmentEvents]
    })
  }, [powerHarassment.occurred, powerHarassment.severity, powerHarassment.frequency, powerHarassment.duration, powerHarassment.organizationalResponse, sexualHarassment.occurred, sexualHarassment.severity, sexualHarassment.frequency, powerHarassmentAssessment.stressIntensity, powerHarassmentAssessment.fiveStageScore, sexualHarassmentAssessment.stressIntensity, sexualHarassmentAssessment.fiveStageScore])

  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(integratedScore.totalScore, stressEvents)
    }
  }, [integratedScore.totalScore, stressEvents, onScoreChange])

  const addWorkplaceEvent = (eventData: any) => {
    const newEvent: PsychologicalStressEvent = {
      eventType: eventData.eventType,
      eventDescription: eventData.description,
      startDate: new Date(),
      duration: 7, // デフォルト1週間
      stressIntensity: eventData.defaultIntensity,
      fiveStageScore: mapStressIntensityToFiveStage(eventData.defaultIntensity),
      legalBasis: eventData.legalBasis,
      mitigatingFactors: [],
      aggravatingFactors: []
    }
    setStressEvents(prev => [...prev, newEvent])
  }

  const removeEvent = (index: number) => {
    setStressEvents(prev => prev.filter((_, i) => i !== index))
  }

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-red-600'
    if (score >= 3) return 'text-orange-600'
    if (score >= 2) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLevelText = (level: string): string => {
    switch (level) {
      case 'critical': return '緊急対応必要'
      case 'high': return '高リスク'
      case 'moderate': return '中リスク'
      case 'low': return '低リスク'
      default: return '評価なし'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            心理的負荷評価（厚生労働省基準準拠）
          </h3>
          <HelpTooltip
            title="心理的負荷評価について"
            content="厚生労働省「心理的負荷による精神障害の認定基準」（令和5年9月改正）に基づく評価です。職場での出来事による心理的負荷を強・中・弱で評価し、5段階スコア（5点=最高リスク）に変換します。"
            iconSize="sm"
          />
        </div>
        <InteractiveButton
          variant="ghost"
          size="sm"
          onClick={() => setShowLegalBasis(!showLegalBasis)}
          className="text-blue-600"
        >
          {showLegalBasis ? '法的根拠を隠す' : '法的根拠を表示'}
        </InteractiveButton>
      </div>

      {/* 法的根拠表示 */}
      {showLegalBasis && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">法的根拠</h4>
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>基準:</strong> 心理的負荷による精神障害の認定基準（令和5年9月1日改正）</p>
            <p><strong>評価方法:</strong> 業務による出来事を「強・中・弱」の3段階で評価</p>
            <p><strong>適用範囲:</strong> 職場環境に起因する心理的負荷の客観的評価</p>
            <p><strong>更新日:</strong> 2023年9月1日</p>
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {[
          { id: 'workload', label: '業務量・質変化' },
          { id: 'overtime', label: '時間外労働' },
          { id: 'harassment', label: 'ハラスメント' },
          { id: 'interpersonal', label: '対人関係' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 時間外労働評価 */}
      {activeTab === 'overtime' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">時間外労働時間評価</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                月間時間外労働時間
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="時間数を入力"
              />
              <p className="text-xs text-gray-500 mt-1">
                80時間以上で「中」、100時間以上で「強」判定
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                連続勤務日数
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={consecutiveDays}
                onChange={(e) => setConsecutiveDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="日数を入力"
              />
              <p className="text-xs text-gray-500 mt-1">
                14日以上で悪化要因として考慮
              </p>
            </div>
          </div>

          {overtimeHours > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="text-sm font-semibold mb-2">評価結果</h5>
              <div className="text-sm space-y-1">
                <p><strong>心理的負荷強度:</strong>
                  <span className={`ml-2 font-semibold ${getScoreColor(overtimeAssessment.fiveStageScore)}`}>
                    {overtimeAssessment.stressIntensity === 'strong' ? '強' :
                     overtimeAssessment.stressIntensity === 'moderate' ? '中' : '弱'}
                  </span>
                </p>
                <p><strong>5段階スコア:</strong>
                  <span className={`ml-2 font-bold text-lg ${getScoreColor(overtimeAssessment.fiveStageScore)}`}>
                    {overtimeAssessment.fiveStageScore}
                  </span>
                </p>
                <p><strong>法的根拠:</strong> {overtimeAssessment.legalBasis}</p>
                <p><strong>対応必要度:</strong> {overtimeAssessment.urgency}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ハラスメント評価 */}
      {activeTab === 'harassment' && (
        <div className="space-y-6">
          <h4 className="text-md font-semibold">ハラスメント評価</h4>

          {/* パワーハラスメント */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h5 className="text-sm font-semibold mb-3">パワーハラスメント</h5>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={powerHarassment.occurred}
                  onChange={(e) => setPowerHarassment(prev => ({ ...prev, occurred: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm">パワーハラスメントの発生</label>
              </div>

              {powerHarassment.occurred && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">頻度</label>
                    <select
                      value={powerHarassment.frequency}
                      onChange={(e) => setPowerHarassment(prev => ({
                        ...prev,
                        frequency: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="single">単発</option>
                      <option value="occasional">時々</option>
                      <option value="frequent">頻繁</option>
                      <option value="continuous">継続的</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">重篤度</label>
                    <select
                      value={powerHarassment.severity}
                      onChange={(e) => setPowerHarassment(prev => ({
                        ...prev,
                        severity: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="mild">軽微</option>
                      <option value="moderate">中程度</option>
                      <option value="severe">重篤</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">継続期間（日）</label>
                    <input
                      type="number"
                      min="1"
                      value={powerHarassment.duration}
                      onChange={(e) => setPowerHarassment(prev => ({
                        ...prev,
                        duration: Number(e.target.value)
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">組織対応</label>
                    <select
                      value={powerHarassment.organizationalResponse}
                      onChange={(e) => setPowerHarassment(prev => ({
                        ...prev,
                        organizationalResponse: e.target.value
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="adequate">適切</option>
                      <option value="inadequate">不適切</option>
                      <option value="none">なし</option>
                    </select>
                  </div>
                </div>
              )}

              {powerHarassment.occurred && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h6 className="text-sm font-semibold mb-2">評価結果</h6>
                  <div className="text-sm space-y-1">
                    <p><strong>心理的負荷強度:</strong>
                      <span className={`ml-2 font-semibold ${getScoreColor(powerHarassmentAssessment.fiveStageScore)}`}>
                        {powerHarassmentAssessment.stressIntensity === 'strong' ? '強' :
                         powerHarassmentAssessment.stressIntensity === 'moderate' ? '中' : '弱'}
                      </span>
                    </p>
                    <p><strong>5段階スコア:</strong>
                      <span className={`ml-2 font-bold text-lg ${getScoreColor(powerHarassmentAssessment.fiveStageScore)}`}>
                        {powerHarassmentAssessment.fiveStageScore}
                      </span>
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-red-800 dark:text-red-200">
                        <strong>推奨対応:</strong>
                      </p>
                      <ul className="text-xs text-red-700 dark:text-red-300 list-disc list-inside">
                        {powerHarassmentAssessment.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* セクシャルハラスメント */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h5 className="text-sm font-semibold mb-3">セクシャルハラスメント</h5>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={sexualHarassment.occurred}
                  onChange={(e) => setSexualHarassment(prev => ({ ...prev, occurred: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm">セクシャルハラスメントの発生</label>
              </div>

              {sexualHarassment.occurred && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">頻度</label>
                    <select
                      value={sexualHarassment.frequency}
                      onChange={(e) => setSexualHarassment(prev => ({
                        ...prev,
                        frequency: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="single">単発</option>
                      <option value="occasional">時々</option>
                      <option value="frequent">頻繁</option>
                      <option value="continuous">継続的</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">重篤度</label>
                    <select
                      value={sexualHarassment.severity}
                      onChange={(e) => setSexualHarassment(prev => ({
                        ...prev,
                        severity: e.target.value as any
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      <option value="mild">軽微</option>
                      <option value="moderate">中程度</option>
                      <option value="severe">重篤</option>
                    </select>
                  </div>
                </div>
              )}

              {sexualHarassment.occurred && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h6 className="text-sm font-semibold mb-2">評価結果</h6>
                  <div className="text-sm space-y-1">
                    <p><strong>心理的負荷強度:</strong>
                      <span className={`ml-2 font-semibold ${getScoreColor(sexualHarassmentAssessment.fiveStageScore)}`}>
                        {sexualHarassmentAssessment.stressIntensity === 'strong' ? '強' :
                         sexualHarassmentAssessment.stressIntensity === 'moderate' ? '中' : '弱'}
                      </span>
                    </p>
                    <p><strong>5段階スコア:</strong>
                      <span className={`ml-2 font-bold text-lg ${getScoreColor(sexualHarassmentAssessment.fiveStageScore)}`}>
                        {sexualHarassmentAssessment.fiveStageScore}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 業務量・質変化 */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">業務による出来事</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(WORKPLACE_STRESS_EVENTS).map((category) => (
              <div key={category.category} className="border border-gray-200 rounded-lg p-3">
                <h5 className="text-sm font-semibold mb-2">{category.category}</h5>
                <div className="space-y-2">
                  {category.events.map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium">{event.eventType}</p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                      </div>
                      <InteractiveButton
                        variant={"secondary" as any}
                        size="sm"
                        onClick={() => addWorkplaceEvent(event)}
                        className="ml-2 text-xs"
                      >
                        追加
                      </InteractiveButton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 登録済みイベント一覧 */}
      {stressEvents.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-md font-semibold mb-3">登録済み心理的負荷イベント</h4>
          <div className="space-y-2">
            {stressEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.eventType}</p>
                  <p className="text-xs text-gray-500">{event.eventDescription}</p>
                  <p className="text-xs">
                    <span className={`font-semibold ${getScoreColor(event.fiveStageScore)}`}>
                      スコア: {event.fiveStageScore}
                    </span>
                    <span className="ml-2 text-gray-500">({event.legalBasis})</span>
                  </p>
                </div>
                <InteractiveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvent(index)}
                  className="text-red-600 ml-2"
                >
                  削除
                </InteractiveButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 統合評価結果 */}
      <div className="mt-6 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h4 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-200">統合評価結果</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">総合スコア</p>
            <p className={`text-2xl font-bold ${getScoreColor(integratedScore.totalScore)}`}>
              {integratedScore.totalScore}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">最高強度</p>
            <p className="text-lg font-semibold">
              {integratedScore.highestIntensity === 'strong' ? '強' :
               integratedScore.highestIntensity === 'moderate' ? '中' : '弱'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">リスクレベル</p>
            <p className={`text-lg font-semibold ${getScoreColor(integratedScore.totalScore)}`}>
              {getRiskLevelText(integratedScore.riskLevel)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">イベント数</p>
            <p className="text-lg font-semibold">{stressEvents.length}</p>
          </div>
        </div>

        {integratedScore.dominantEvent && (
          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded">
            <p className="text-sm font-medium">主要な心理的負荷要因:</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {integratedScore.dominantEvent.eventDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}