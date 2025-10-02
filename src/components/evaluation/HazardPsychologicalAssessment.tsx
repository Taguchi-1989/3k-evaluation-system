'use client'

import React, { useState } from 'react'
import {
  assessAccidentHistoryRisk,
  assessSafetyManagementStress,
  assessOngoingRisk,
  calculateIntegratedHazardScore
} from '@/lib/hazardPsychologicalMapping'
import type {
  AccidentHistoryAssessment,
  AccidentHistoryEvent,
  SafetyManagementStressAssessment,
  SafetyGapAssessment,
  OngoingRiskAssessment
} from '@/types/evaluation'

export interface HazardPsychologicalAssessmentProps {
  onAssessmentChange?: (assessment: {
    accidentHistory?: AccidentHistoryAssessment;
    safetyManagement?: SafetyManagementStressAssessment;
    ongoingRisks?: OngoingRiskAssessment[];
    integratedScore: number;
  }) => void;
}

export function HazardPsychologicalAssessment({ onAssessmentChange }: HazardPsychologicalAssessmentProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'accident' | 'safety' | 'ongoing'>('accident')

  // 労災履歴状態
  const [accidentHistory, setAccidentHistory] = useState<AccidentHistoryEvent[]>([])
  const [accidentAssessment, setAccidentAssessment] = useState<AccidentHistoryAssessment>()

  // 安全管理状態
  const [safetyManagement, setSafetyManagement] = useState<{
    complianceLevel: 'non_compliant' | 'partially_compliant' | 'compliant' | 'excellent';
    trainingAdequacy: 'inadequate' | 'minimal' | 'adequate' | 'excellent';
    reportingSystem: 'none' | 'basic' | 'adequate' | 'comprehensive';
    riskAssessmentFreq: 'never' | 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
    managementGaps: SafetyGapAssessment[];
  }>({
    complianceLevel: 'compliant',
    trainingAdequacy: 'adequate',
    reportingSystem: 'adequate',
    riskAssessmentFreq: 'quarterly',
    managementGaps: []
  })
  const [safetyAssessment, setSafetyAssessment] = useState<SafetyManagementStressAssessment>()

  // 現在進行中のリスク状態
  const [ongoingRisks, setOngoingRisks] = useState<OngoingRiskAssessment[]>([])

  // 労災履歴追加
  const addAccidentEvent = () => {
    const newEvent: AccidentHistoryEvent = {
      accidentDate: new Date(),
      accidentType: '',
      severity: 'minor',
      rootCause: '',
      preventiveMeasures: [],
      effectiveness: 'partial',
      isRecurring: false
    }
    setAccidentHistory([...accidentHistory, newEvent])
  }

  // 労災履歴評価実行
  const runAccidentAssessment = () => {
    const assessment = assessAccidentHistoryRisk(accidentHistory)
    setAccidentAssessment(assessment)
    updateIntegratedAssessment(assessment, safetyAssessment, ongoingRisks)
  }

  // 安全管理評価実行
  const runSafetyAssessment = () => {
    const assessment = assessSafetyManagementStress(
      safetyManagement.complianceLevel,
      safetyManagement.trainingAdequacy,
      safetyManagement.reportingSystem,
      safetyManagement.riskAssessmentFreq,
      safetyManagement.managementGaps
    )
    setSafetyAssessment(assessment)
    updateIntegratedAssessment(accidentAssessment, assessment, ongoingRisks)
  }

  // 統合評価更新
  const updateIntegratedAssessment = (
    accident?: AccidentHistoryAssessment,
    safety?: SafetyManagementStressAssessment,
    ongoing?: OngoingRiskAssessment[]
  ) => {
    const result = calculateIntegratedHazardScore(accident, safety, ongoing)
    onAssessmentChange?.({
      accidentHistory: accident,
      safetyManagement: safety,
      ongoingRisks: ongoing,
      integratedScore: result.totalScore
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          危険因子：心理的要素統合評価
        </h2>
        <p className="text-gray-600">
          労災履歴・安全管理ストレス・未解消リスクを危険因子軸で評価
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('accident')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'accident'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          労災履歴評価
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'safety'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          安全管理ストレス
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'ongoing'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          未解消リスク
        </button>
      </div>

      {/* 労災履歴評価タブ */}
      {activeTab === 'accident' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">労災履歴・再発リスク評価</h3>
            <p className="text-blue-600 text-sm">
              過去の労災事故履歴から現在の危険因子レベルを評価します
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium">労災事故履歴</h4>
              <button
                onClick={addAccidentEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                事故追加
              </button>
            </div>

            {accidentHistory.map((event, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      事故日
                    </label>
                    <input
                      id={`accident-date-${index}`}
                      aria-label={`事故履歴${index + 1}の事故日`}
                      type="date"
                      value={event.accidentDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newHistory = [...accidentHistory]
                        if (newHistory[index]) {
                          newHistory[index].accidentDate = new Date(e.target.value)
                        }
                        setAccidentHistory(newHistory)
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      事故種類
                    </label>
                    <input
                      type="text"
                      value={event.accidentType}
                      onChange={(e) => {
                        const newHistory = [...accidentHistory]
                        if (newHistory[index]) {
                          newHistory[index].accidentType = e.target.value
                        }
                        setAccidentHistory(newHistory)
                      }}
                      placeholder="例：挟まれ・巻き込まれ"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      重篤度
                    </label>
                    <select
                      id={`accident-severity-${index}`}
                      aria-label={`事故履歴${index + 1}の重篤度`}
                      value={event.severity}
                      onChange={(e) => {
                        const newHistory = [...accidentHistory]
                        if (newHistory[index]) {
                          newHistory[index].severity = e.target.value as AccidentHistoryEvent['severity']
                        }
                        setAccidentHistory(newHistory)
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="minor">軽微</option>
                      <option value="moderate">中程度</option>
                      <option value="serious">重大</option>
                      <option value="fatal">死亡</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      根本原因
                    </label>
                    <input
                      type="text"
                      value={event.rootCause}
                      onChange={(e) => {
                        const newHistory = [...accidentHistory]
                        if (newHistory[index]) {
                          newHistory[index].rootCause = e.target.value
                        }
                        setAccidentHistory(newHistory)
                      }}
                      placeholder="例：安全装置の未使用、手順書の不備"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      防止策の効果
                    </label>
                    <select
                      id={`accident-effectiveness-${index}`}
                      aria-label={`事故履歴${index + 1}の防止策の効果`}
                      value={event.effectiveness}
                      onChange={(e) => {
                        const newHistory = [...accidentHistory]
                        if (newHistory[index]) {
                          newHistory[index].effectiveness = e.target.value as AccidentHistoryEvent['effectiveness']
                        }
                        setAccidentHistory(newHistory)
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="ineffective">効果なし</option>
                      <option value="partial">部分的効果</option>
                      <option value="effective">効果的</option>
                      <option value="highly_effective">非常に効果的</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={runAccidentAssessment}
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              労災履歴評価を実行
            </button>

            {accidentAssessment && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">評価結果</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">総事故件数：</span>
                    {accidentAssessment.totalAccidentCount}件
                  </div>
                  <div>
                    <span className="font-medium">再発リスク：</span>
                    <span className={`px-2 py-1 rounded ${
                      accidentAssessment.recurrenceRisk === 'critical' ? 'bg-red-200 text-red-800' :
                      accidentAssessment.recurrenceRisk === 'high' ? 'bg-orange-200 text-orange-800' :
                      accidentAssessment.recurrenceRisk === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {accidentAssessment.recurrenceRisk}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">5段階スコア：</span>
                    <span className="font-bold text-lg">{accidentAssessment.fiveStageScore}/5</span>
                  </div>
                </div>

                {accidentAssessment.remainingRisks && accidentAssessment.remainingRisks.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-red-700">未解消リスク：</span>
                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                      {accidentAssessment.remainingRisks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 安全管理ストレス評価タブ */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">安全管理体制ストレス評価</h3>
            <p className="text-green-600 text-sm">
              安全管理体制の欠陥・不備から危険因子レベルを評価します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                法令順守度
              </label>
              <select
                id="compliance-level"
                aria-label="安全管理体制の法令順守度"
                value={safetyManagement.complianceLevel}
                onChange={(e) => setSafetyManagement({
                  ...safetyManagement,
                  complianceLevel: e.target.value as 'non_compliant' | 'partially_compliant' | 'compliant' | 'excellent'
                })}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="excellent">優秀：法令を上回る管理</option>
                <option value="compliant">適合：法令要求を満たす</option>
                <option value="partially_compliant">部分適合：一部課題あり</option>
                <option value="non_compliant">不適合：法令違反</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                安全教育充実度
              </label>
              <select
                id="training-adequacy"
                aria-label="安全管理体制の教育充実度"
                value={safetyManagement.trainingAdequacy}
                onChange={(e) => setSafetyManagement({
                  ...safetyManagement,
                  trainingAdequacy: e.target.value as 'inadequate' | 'minimal' | 'adequate' | 'excellent'
                })}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="excellent">優秀：体系的教育プログラム</option>
                <option value="adequate">適切：必要な教育を実施</option>
                <option value="minimal">最低限：基本的教育のみ</option>
                <option value="inadequate">不適切：教育不足</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                インシデント報告制度
              </label>
              <select
                id="reporting-system"
                aria-label="安全管理体制の報告制度"
                value={safetyManagement.reportingSystem}
                onChange={(e) => setSafetyManagement({
                  ...safetyManagement,
                  reportingSystem: e.target.value as 'none' | 'basic' | 'adequate' | 'comprehensive'
                })}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="comprehensive">充実：体系的な報告・分析制度</option>
                <option value="adequate">適切：基本的な報告制度</option>
                <option value="basic">基本：最低限の報告</option>
                <option value="none">なし：報告制度なし</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リスク評価頻度
              </label>
              <select
                id="risk-assessment-freq"
                aria-label="安全管理体制のリスク評価頻度"
                value={safetyManagement.riskAssessmentFreq}
                onChange={(e) => setSafetyManagement({
                  ...safetyManagement,
                  riskAssessmentFreq: e.target.value as 'never' | 'annual' | 'semi_annual' | 'quarterly' | 'monthly'
                })}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="monthly">月次：毎月実施</option>
                <option value="quarterly">四半期：3ヶ月毎</option>
                <option value="semi_annual">半年：6ヶ月毎</option>
                <option value="annual">年次：年1回</option>
                <option value="never">なし：実施せず</option>
              </select>
            </div>
          </div>

          <button
            onClick={runSafetyAssessment}
            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            安全管理評価を実行
          </button>

          {safetyAssessment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">評価結果</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">5段階スコア：</span>
                  <span className="font-bold text-lg ml-2">{safetyAssessment.fiveStageScore}/5</span>
                </div>

                {safetyAssessment.urgentImprovements.length > 0 && (
                  <div>
                    <span className="font-medium text-red-700">緊急改善項目：</span>
                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                      {safetyAssessment.urgentImprovements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 未解消リスク評価タブ */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">現在進行中のリスク評価</h3>
            <p className="text-orange-600 text-sm">
              未解消のリスク・再発可能性を危険因子として評価します
            </p>
          </div>

          <div className="text-center py-8">
            <button
              onClick={() => {
                const newRisk = assessOngoingRisk(
                  '新しいリスク',
                  'moderate',
                  'moderate',
                  'unaddressed',
                  []
                )
                setOngoingRisks([...ongoingRisks, newRisk])
              }}
              className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              新規リスク追加
            </button>
          </div>

          {ongoingRisks.map((risk, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    リスク内容
                  </label>
                  <input
                    id={`risk-description-${index}`}
                    aria-label={`継続リスク${index + 1}の内容`}
                    type="text"
                    value={risk.riskDescription}
                    onChange={(e) => {
                      const newRisks = [...ongoingRisks]
                      if (newRisks[index]) {
                        newRisks[index].riskDescription = e.target.value
                      }
                      setOngoingRisks(newRisks)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    再発確率
                  </label>
                  <select
                    id={`risk-recurrence-${index}`}
                    aria-label={`継続リスク${index + 1}の再発確率`}
                    value={risk.recurrenceProbability}
                    onChange={(e) => {
                      const newRisks = [...ongoingRisks]
                      if (newRisks[index]) {
                        newRisks[index].recurrenceProbability = e.target.value as 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
                      }
                      setOngoingRisks(newRisks)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="very_low">非常に低い</option>
                    <option value="low">低い</option>
                    <option value="moderate">中程度</option>
                    <option value="high">高い</option>
                    <option value="very_high">非常に高い</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    潜在的影響度
                  </label>
                  <select
                    id={`risk-impact-${index}`}
                    aria-label={`継続リスク${index + 1}の潜在的影響度`}
                    value={risk.potentialImpact}
                    onChange={(e) => {
                      const newRisks = [...ongoingRisks]
                      if (newRisks[index]) {
                        newRisks[index].potentialImpact = e.target.value as 'minor' | 'moderate' | 'major' | 'catastrophic'
                      }
                      setOngoingRisks(newRisks)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="minor">軽微</option>
                    <option value="moderate">中程度</option>
                    <option value="major">重大</option>
                    <option value="catastrophic">破滅的</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現在の状況
                  </label>
                  <select
                    id={`risk-status-${index}`}
                    aria-label={`継続リスク${index + 1}の現在の状況`}
                    value={risk.currentStatus}
                    onChange={(e) => {
                      const newRisks = [...ongoingRisks]
                      if (newRisks[index]) {
                        newRisks[index].currentStatus = e.target.value as 'unaddressed' | 'in_progress' | 'partially_mitigated' | 'monitored'
                      }
                      setOngoingRisks(newRisks)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="unaddressed">未対応</option>
                    <option value="in_progress">対応中</option>
                    <option value="partially_mitigated">部分緩和</option>
                    <option value="monitored">監視中</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm font-medium">
                  リスクスコア: <span className="font-bold text-lg">{risk.fiveStageScore}/5</span>
                </span>
                <span className="text-sm text-gray-600">
                  監視頻度: {risk.monitoringFrequency}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統合評価結果 */}
      {(accidentAssessment || safetyAssessment || ongoingRisks.length > 0) && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">危険因子：統合評価結果</h3>

          {(() => {
            const result = calculateIntegratedHazardScore(accidentAssessment, safetyAssessment, ongoingRisks)
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{result.totalScore}/5</div>
                  <div className="text-sm text-gray-600">統合スコア</div>
                </div>

                <div className="text-center">
                  <div className={`text-lg font-bold px-3 py-1 rounded ${
                    result.riskLevel === 'critical' ? 'bg-red-200 text-red-800' :
                    result.riskLevel === 'high' ? 'bg-orange-200 text-orange-800' :
                    result.riskLevel === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {result.riskLevel}
                  </div>
                  <div className="text-sm text-gray-600">リスクレベル</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    支配的要因: {result.dominantRisk || 'なし'}
                  </div>
                </div>
              </div>
            )
          })()}

          {(() => {
            const result = calculateIntegratedHazardScore(accidentAssessment, safetyAssessment, ongoingRisks)
            return result.urgentActions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-700 mb-2">緊急対応が必要な項目：</h4>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {result.urgentActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}