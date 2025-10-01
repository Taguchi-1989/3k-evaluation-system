'use client'

import React, { useState } from 'react'
import { FileUpload, Button } from '@/components/ui'
import { PhotoViewer } from '@/components/evaluation'
import { EVALUATION_STANDARDS, DEFAULT_EVALUATION_DATA } from '@/data/defaultEvaluationData'

export interface HazardEvent {
  id: string
  eventDescription: string
  encounterFrequency: number // Px
  possibility: number // Py
  occurrenceProbability: string // P
  severityLevel: string // S
  riskPoint: number
  riskLevel: string
}

export interface HazardFactorDetailProps {
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
  hazardEvents?: HazardEvent[]
}

// デフォルトデータから危険因子項目を生成
const generateHazardEvents = (): HazardEvent[] => {
  const hazardStandards = EVALUATION_STANDARDS.hazard
  const defaultData = DEFAULT_EVALUATION_DATA.hazardDefaults

  // データが存在しない場合はデフォルトの危険因子イベントを返す
  if (!defaultData || !defaultData.hazardEvents) {
    return [
      {
        id: '1',
        eventDescription: '機械への挟まれ・巻き込まれ',
        encounterFrequency: 2,
        possibility: 2,
        occurrenceProbability: 'P2',
        severityLevel: 'S4',
        riskPoint: 8,
        riskLevel: 'B'
      },
      {
        id: '2', 
        eventDescription: '重量物の落下・飛散',
        encounterFrequency: 1,
        possibility: 2,
        occurrenceProbability: 'P1',
        severityLevel: 'S3',
        riskPoint: 3,
        riskLevel: 'C'
      }
    ]
  }
  
  return defaultData.hazardEvents.map((event, index) => ({
    id: event.id || `${index + 1}`,
    eventDescription: event.hazardEvent,
    encounterFrequency: event.encounterFrequency || 2,
    possibility: event.dangerPossibility || 2,
    occurrenceProbability: `P${event.encounterFrequency}`,
    severityLevel: `S${event.dangerPossibility}`,
    riskPoint: typeof event.riskLevel === 'number' ? event.riskLevel : 8,
    riskLevel: (typeof event.riskLevel === 'number' && event.riskLevel >= 10) ? 'A' : (typeof event.riskLevel === 'number' && event.riskLevel >= 6) ? 'B' : 'C'
  }))
}

const defaultHazardEvents: HazardEvent[] = generateHazardEvents() || [
  {
    id: '1',
    eventDescription: '重量物による挟まれ',
    encounterFrequency: 2,
    possibility: 2,
    occurrenceProbability: 'P2',
    severityLevel: 'S4',
    riskPoint: 8,
    riskLevel: 'B'
  },
  {
    id: '2',
    eventDescription: '回転部への巻き込まれ',
    encounterFrequency: 2,
    possibility: 1,
    occurrenceProbability: 'P2',
    severityLevel: 'S5',
    riskPoint: 10,
    riskLevel: 'A'
  }
]

export function HazardFactorDetail({
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Photo',
  hazardEvents = defaultHazardEvents
}: HazardFactorDetailProps): React.JSX.Element {
  const [events, setEvents] = useState(hazardEvents)
  const [highlightedCell, setHighlightedCell] = useState<{ p: string, s: string } | null>(null)

  const calculateOccurrenceProbability = (px: number, py: number): string => {
    const sum = px + py
    if (sum <= 2) return 'P1'
    if (sum <= 4) return 'P2'
    if (sum <= 5) return 'P3'
    if (sum <= 6) return 'P4'
    return 'P5'
  }

  const calculateRiskPoint = (p: string, s: string): number => {
    // 元の基準に従ったリスクマトリックス
    const riskMatrix: { [key: string]: { [key: string]: number } } = {
      'P1': { 'S1': 1, 'S2': 2, 'S3': 3, 'S4': 4, 'S5': 5 },
      'P2': { 'S1': 2, 'S2': 4, 'S3': 6, 'S4': 8, 'S5': 10 },
      'P3': { 'S1': 3, 'S2': 6, 'S3': 9, 'S4': 12, 'S5': 15 },
      'P4': { 'S1': 4, 'S2': 8, 'S3': 12, 'S4': 16, 'S5': 20 },
      'P5': { 'S1': 5, 'S2': 10, 'S3': 15, 'S4': 20, 'S5': 25 }
    }
    return riskMatrix[p]?.[s] || 0
  }

  const calculateRiskLevel = (point: number): string => {
    if (point >= 10) return 'A' // 許容不可
    if (point >= 5) return 'B'  // 条件付き許容
    return 'C' // 許容可能
  }

  const handleEventChange = (id: string, field: string, value: string | number) => {
    setEvents(prev => prev.map(event => {
      if (event.id === id) {
        const updated = { ...event, [field]: value }
        
        if (field === 'encounterFrequency' || field === 'possibility') {
          const px = field === 'encounterFrequency' ? Number(value) : event.encounterFrequency
          const py = field === 'possibility' ? Number(value) : event.possibility
          updated.occurrenceProbability = calculateOccurrenceProbability(px, py)
          updated.riskPoint = calculateRiskPoint(updated.occurrenceProbability, updated.severityLevel)
          updated.riskLevel = calculateRiskLevel(updated.riskPoint)
        } else if (field === 'severityLevel') {
          updated.riskPoint = calculateRiskPoint(updated.occurrenceProbability, String(value))
          updated.riskLevel = calculateRiskLevel(updated.riskPoint)
        }
        
        return updated
      }
      return event
    }))
  }

  const addNewEvent = () => {
    const newEvent: HazardEvent = {
      id: String(Date.now()), // より安全なID生成
      eventDescription: '',
      encounterFrequency: 1,
      possibility: 1,
      occurrenceProbability: 'P1',
      severityLevel: 'S1',
      riskPoint: 0,
      riskLevel: 'C'
    }
    setEvents([...events, newEvent])
  }

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const handleFileUpload = (files: FileList) => {
    // TODO: Process uploaded files
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const getMaxRiskEvent = () => {
    if (events.length === 0) return null
    return events.reduce((max, event) => {
      if (!max) return event
      return event.riskPoint > max.riskPoint ? event : max
    }, events[0])
  }

  const maxRiskEvent = getMaxRiskEvent()

  // リスクポイントを1,2,4,7,10の評価点に変換
  const convertRiskPointToEvaluation = (riskPoint: number): number => {
    if (riskPoint >= 20) return 10;
    if (riskPoint >= 15) return 7;
    if (riskPoint >= 10) return 4;
    if (riskPoint >= 5) return 2;
    return 1;
  }

  // 点数変換マトリックスのセルの色を取得
  const getConversionMatrixCellClass = (riskPoint: number, evaluation: number, isSelected: boolean) => {
    let baseClass = 'flex items-center justify-center text-[10px] font-bold p-1 border border-gray-200 dark:border-gray-600'
    
    if (isSelected) {
      baseClass += ' bg-yellow-200 dark:bg-yellow-300 border-2 border-yellow-400 text-yellow-900 dark:text-yellow-800'
    } else {
      switch(evaluation) {
        case 10: baseClass += ' bg-red-400 dark:bg-red-500 text-white'; break
        case 7: baseClass += ' bg-red-200 dark:bg-red-300 text-red-900 dark:text-red-800'; break
        case 4: baseClass += ' bg-orange-200 dark:bg-orange-300 text-orange-900 dark:text-orange-800'; break
        case 2: baseClass += ' bg-yellow-200 dark:bg-yellow-300 text-yellow-900 dark:text-yellow-800'; break
        case 1: baseClass += ' bg-green-200 dark:bg-green-300 text-green-900 dark:text-green-800'; break
        default: baseClass += ' bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      }
    }
    
    return baseClass
  }

  // リスクマトリックスのセルの色を評価点に基づいて設定（ダークモード対応）
  const getRiskMatrixCellClass = (p: string, s: string, value: number) => {
    const isHighlighted = highlightedCell?.p === p && highlightedCell?.s === s
    const isMaxRisk = maxRiskEvent && 
                      maxRiskEvent.occurrenceProbability === p && 
                      maxRiskEvent.severityLevel === s
    
    const evaluationScore = convertRiskPointToEvaluation(value)
    let baseClass = 'flex items-center justify-center text-[10px] font-bold p-1 border border-gray-200 dark:border-gray-600'
    
    if (isMaxRisk) {
      baseClass += ' bg-yellow-200 dark:bg-yellow-300 border-2 border-yellow-400 text-yellow-900 dark:text-yellow-800'
    } else if (isHighlighted) {
      baseClass += ' bg-gray-200 dark:bg-gray-600 border border-gray-400 text-gray-800 dark:text-gray-200'
    } else {
      // 評価点に基づく色分け
      switch(evaluationScore) {
        case 10: baseClass += ' bg-red-500 dark:bg-red-600 text-white'; break
        case 7: baseClass += ' bg-red-300 dark:bg-red-400 text-red-900 dark:text-red-100'; break
        case 4: baseClass += ' bg-orange-300 dark:bg-orange-400 text-orange-900 dark:text-orange-100'; break
        case 2: baseClass += ' bg-yellow-300 dark:bg-yellow-400 text-yellow-900 dark:text-yellow-800'; break
        case 1: baseClass += ' bg-green-300 dark:bg-green-400 text-green-900 dark:text-green-800'; break
        default: baseClass += ' bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }
    }
    
    return baseClass
  }

  return (
    <div className="aspect-container">
      <section className="flex-grow p-3 flex flex-row gap-3 overflow-hidden bg-white">
        {/* 左列: 写真ギャラリー & 書類アップロード */}
        <div className="w-4/12 flex flex-col h-full space-y-3">
          <PhotoViewer
            mainPhoto={photoUrl}
            thumbnails={[
              photoUrl,
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+1',
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+2',
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+3'
            ]}
            showGalleryInfo={true}
            galleryTitle="危険箇所写真"
            className="flex-grow"
          />
          <FileUpload
            variant="document"
            layout="vertical"
            size="md"
            onFileUpload={handleFileUpload}
            label="書類をアップロード"
          />
        </div>

        {/* 右列: 入力表 & 評価 */}
        <div className="w-8/12 flex flex-col h-full space-y-3">
          <div className="flex-grow flex flex-col border rounded-lg p-2 overflow-hidden">
            <div className="flex items-center mb-2">
              <h2 className="text-sm font-bold flex-shrink-0">残留リスク評価</h2>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-xs"
                onClick={addNewEvent}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                危険事象を追加
              </Button>
            </div>
            <div className="table-container text-xs overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-1 border w-8">No.</th>
                    <th className="p-1 border w-2/5">危険事象</th>
                    <th className="p-1 border">遭遇頻度 Px</th>
                    <th className="p-1 border">可能性 Py</th>
                    <th className="p-1 border">発生可能性 P</th>
                    <th className="p-1 border">危害の重大性</th>
                    <th className="p-1 border">リスクポイント</th>
                    <th className="p-1 border">リスクレベル</th>
                    <th className="p-1 border w-8">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const isMaxRisk = event.id === maxRiskEvent?.id
                    return (
                      <tr key={event.id} className={isMaxRisk ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}>
                        <td className="p-1 border text-center font-bold">
                          <div className={isMaxRisk ? 'bg-yellow-200 dark:bg-yellow-300 rounded text-yellow-900 dark:text-yellow-800' : ''}>{event.id}</div>
                        </td>
                        <td className="p-1 border">
                          <textarea
                            className={`w-full border rounded p-1 text-xs ${isMaxRisk ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            rows={1}
                            value={event.eventDescription}
                            onChange={(e) => handleEventChange(event.id, 'eventDescription', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border">
                          <select
                            className={`w-full p-1 border rounded ${isMaxRisk ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            value={event.encounterFrequency}
                            onChange={(e) => handleEventChange(event.id, 'encounterFrequency', Number(e.target.value))}
                          >
                            {[1, 2, 3].map(n => (
                              <option key={`encounter-${event.id}-${n}`} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border">
                          <select
                            className={`w-full p-1 border rounded ${isMaxRisk ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            value={event.possibility}
                            onChange={(e) => handleEventChange(event.id, 'possibility', Number(e.target.value))}
                          >
                            {[1, 2, 3].map(n => (
                              <option key={`possibility-${event.id}-${n}`} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{event.occurrenceProbability}</td>
                        <td className="p-1 border">
                          <select
                            className={`w-full p-1 border rounded ${isMaxRisk ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            value={event.severityLevel}
                            onChange={(e) => handleEventChange(event.id, 'severityLevel', e.target.value)}
                          >
                            {['S1', 'S2', 'S3', 'S4', 'S5'].map(s => (
                              <option key={`severity-${event.id}-${s}`} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border text-center bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200">{event.riskPoint}</td>
                        <td className="p-1 border text-center bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200">{event.riskLevel}</td>
                        <td className="p-1 border text-center">
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex-shrink-0 grid grid-cols-3 gap-3">
            {/* リスクマトリックス */}
            <div className="risk-matrix text-xs bg-gray-50 p-2 rounded border">
              <p className="font-bold mb-1 text-center text-sm">リスクマトリックス</p>
              <div className="grid grid-cols-6 gap-px bg-white p-1 text-[10px]">
                <div className="font-bold"></div>
                {['S1', 'S2', 'S3', 'S4', 'S5'].map(s => (
                  <div key={`header-${s}`} className={`font-bold text-center p-1 ${s === maxRiskEvent?.severityLevel ? 'bg-blue-100' : ''}`}>{s}</div>
                ))}
                
                {['P5', 'P4', 'P3', 'P2', 'P1'].map(p => (
                  <React.Fragment key={`row-${p}`}>
                    <div className={`font-bold text-center p-1 ${p === maxRiskEvent?.occurrenceProbability ? 'bg-blue-100' : ''}`}>{p}</div>
                    {['S1', 'S2', 'S3', 'S4', 'S5'].map(s => {
                      const value = calculateRiskPoint(p, s)
                      return (
                        <div
                          key={`matrix-${p}-${s}`}
                          className={getRiskMatrixCellClass(p, s, value)}
                          onMouseEnter={() => setHighlightedCell({ p, s })}
                          onMouseLeave={() => setHighlightedCell(null)}
                        >
                          {value}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 点数変換マトリックス */}
            <div className="text-xs bg-gray-50 p-2 rounded border">
              <p className="font-bold mb-1 text-center text-sm">点数変換</p>
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-1 text-[10px] font-bold text-center">
                  <div>リスクポイント</div>
                  <div>評価点</div>
                </div>
                {[
                  { range: "20-25", points: [20, 21, 22, 23, 24, 25], evaluation: 10 },
                  { range: "15-19", points: [15, 16, 17, 18, 19], evaluation: 7 },
                  { range: "10-14", points: [10, 11, 12, 13, 14], evaluation: 4 },
                  { range: "5-9", points: [5, 6, 7, 8, 9], evaluation: 2 },
                  { range: "1-4", points: [1, 2, 3, 4], evaluation: 1 }
                ].map((item) => {
                  const isSelected = maxRiskEvent ? item.points.includes(maxRiskEvent.riskPoint) : false
                  return (
                    <div key={`risk-${item.range}`} className="grid grid-cols-2 gap-1">
                      <div className={`text-center p-1 text-[10px] ${isSelected ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        {item.range}
                      </div>
                      <div className={getConversionMatrixCellClass(maxRiskEvent?.riskPoint || 0, item.evaluation, isSelected)}>
                        {item.evaluation}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* 最終評価と説明 */}
            <div className="flex flex-col justify-between">
              <div className="bg-gray-50 border rounded-lg p-2 text-xs">
                <h3 className="font-bold mb-1">評価手順</h3>
                <div className="text-gray-600 space-y-1">
                  <p>1. リスクポイント: {maxRiskEvent?.riskPoint || 0}</p>
                  <p>2. 発生可能性: {maxRiskEvent?.occurrenceProbability}</p>
                  <p>3. 危害の重大性: {maxRiskEvent?.severityLevel}</p>
                  <p>4. 変換後評価: {convertRiskPointToEvaluation(maxRiskEvent?.riskPoint || 0)}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <h3 className="text-sm font-medium text-blue-800">危険因 (最終評価)</h3>
                <p className="text-3xl font-bold text-blue-700">{convertRiskPointToEvaluation(maxRiskEvent?.riskPoint || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}