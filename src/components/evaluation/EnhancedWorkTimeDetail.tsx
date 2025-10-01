'use client'

import React, { useState, useEffect } from 'react'
import { FileUpload, Input, Button } from '@/components/ui'
// 将来実装予定: パフォーマンス最適化 - <img>タグをOptimizedImageに置き換え（line 692）
// import { OptimizedImage } from '@/components/optimized/OptimizedImage'
// 将来実装予定: グローバル状態管理（評価データの一元管理）
// import { useEvaluationStore } from '@/hooks/useEvaluationStore'

export interface Worker {
  id: string
  name: string
  laborTime: number
  actualWorkTime: number
  ratio: number
  timeClass: string
  restTime: number
  overtimeHours: number
  nightShiftHours: number
  workLoad: number
}

export interface ShiftPattern {
  id: string
  name: string
  startTime: string
  endTime: string
  duration: number
  breakTime: number
  effectiveWorkTime: number
  nightShiftBonus: number
}

export interface WorkTimeAnalysis {
  totalWorkers: number
  averageWorkTime: number
  averageEfficiency: number
  overtimeWorkers: number
  overtimeHours: number
  fatigueIndex: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

export interface ProductivityMetrics {
  workEfficiency: number
  timeUtilization: number
  restTimeRatio: number
  overallProductivity: number
  bottleneckFactors: string[]
}

export interface EnhancedWorkTimeDetailProps {
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
  workers?: Worker[]
}

const defaultWorkers: Worker[] = [
  {
    id: '1',
    name: 'Aさん',
    laborTime: 8.0,
    actualWorkTime: 6.8,
    ratio: 85,
    timeClass: 'e',
    restTime: 1.0,
    overtimeHours: 0,
    nightShiftHours: 0,
    workLoad: 7
  },
  {
    id: '2',
    name: 'Bさん',
    laborTime: 8.0,
    actualWorkTime: 7.2,
    ratio: 90,
    timeClass: 'e',
    restTime: 0.8,
    overtimeHours: 0.5,
    nightShiftHours: 0,
    workLoad: 8
  },
  {
    id: '3',
    name: 'Cさん',
    laborTime: 8.0,
    actualWorkTime: 1.0,
    ratio: 13,
    timeClass: 'c',
    restTime: 6.0,
    overtimeHours: 0,
    nightShiftHours: 0,
    workLoad: 2
  }
]

const defaultShiftPatterns: ShiftPattern[] = [
  {
    id: '1',
    name: '昼勤',
    startTime: '08:00',
    endTime: '17:00',
    duration: 8.0,
    breakTime: 1.0,
    effectiveWorkTime: 7.0,
    nightShiftBonus: 1.0
  },
  {
    id: '2',
    name: '夜勤',
    startTime: '20:00',
    endTime: '05:00',
    duration: 8.0,
    breakTime: 1.0,
    effectiveWorkTime: 7.0,
    nightShiftBonus: 1.2
  },
  {
    id: '3',
    name: '交代制A',
    startTime: '06:00',
    endTime: '14:00',
    duration: 8.0,
    breakTime: 1.0,
    effectiveWorkTime: 7.0,
    nightShiftBonus: 1.0
  }
]

export function EnhancedWorkTimeDetail({
  evaluationNo: _evaluationNo,  // 将来実装予定: ヘッダー表示用
  creator: _creator,              // 将来実装予定: 作成者情報表示用
  checker: _checker,              // 将来実装予定: 確認者情報表示用
  workInfo: _workInfo,            // 将来実装予定: 作業情報表示用
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Work+Time+Analysis',
  workers = defaultWorkers
}: EnhancedWorkTimeDetailProps): React.JSX.Element {
  
  // const { updateEvaluationData } = useEvaluationStore()
  
  const [workerList, setWorkerList] = useState(workers)
  const [shiftPatterns, _setShiftPatterns] = useState(defaultShiftPatterns)  // 将来実装予定: シフトパターン編集機能
  const [_selectedShift, _setSelectedShift] = useState('1')  // 将来実装予定: シフト選択機能
  const [maxTime, setMaxTime] = useState(0)
  const [maxTimeClass, setMaxTimeClass] = useState('')
  const [maxWorkerId, setMaxWorkerId] = useState('')
  const [analysis, setAnalysis] = useState<WorkTimeAnalysis | null>(null)
  const [productivity, setProductivity] = useState<ProductivityMetrics | null>(null)
  const [activeTab, setActiveTab] = useState<'workers' | 'shifts' | 'analysis' | 'productivity'>('workers')

  // workerList/shiftPatterns変更時に再計算
  // 関数定義は安定しているため依存配列から除外（無限ループ防止）
  useEffect(() => {
    calculateMaxTime()
    performAnalysis()
    calculateProductivity()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerList, shiftPatterns])

  const getTimeClass = (hours: number): string => {
    if (hours < 0.25) return 'a'
    if (hours < 1) return 'b'
    if (hours < 3) return 'c'
    if (hours < 6.5) return 'd'
    return 'e'
  }

  const calculateRatio = (laborTime: number, actualWorkTime: number): number => {
    if (laborTime === 0) return 0
    return Math.round((actualWorkTime / laborTime) * 100)
  }

  const calculateMaxTime = () => {
    if (workerList.length === 0) return
    
    const maxWorker = workerList.reduce((max, worker) => 
      worker.actualWorkTime > max.actualWorkTime ? worker : max
    )
    
    setMaxTime(maxWorker.actualWorkTime)
    setMaxTimeClass(maxWorker.timeClass)
    setMaxWorkerId(maxWorker.id)
  }

  const performAnalysis = () => {
    const totalWorkers = workerList.length
    const totalWorkTime = workerList.reduce((sum, w) => sum + w.actualWorkTime, 0)
    const totalOvertimeHours = workerList.reduce((sum, w) => sum + w.overtimeHours, 0)
    const overtimeWorkers = workerList.filter(w => w.overtimeHours > 0).length
    
    const averageWorkTime = totalWorkers > 0 ? totalWorkTime / totalWorkers : 0
    const averageEfficiency = totalWorkers > 0 ? 
      workerList.reduce((sum, w) => sum + w.ratio, 0) / totalWorkers : 0
    
    // 疲労指数の計算（労働時間・残業・夜勤を考慮）
    const fatigueIndex = workerList.reduce((total, worker) => {
      const base = worker.actualWorkTime
      const overtime = worker.overtimeHours * 1.5
      const nightShift = worker.nightShiftHours * 1.3
      const workLoad = worker.workLoad * 0.1
      return total + (base + overtime + nightShift + workLoad)
    }, 0) / totalWorkers

    // リスクレベル判定
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (fatigueIndex > 10) riskLevel = 'critical'
    else if (fatigueIndex > 8) riskLevel = 'high'
    else if (fatigueIndex > 6) riskLevel = 'medium'

    // 推奨事項
    const recommendations: string[] = []
    if (averageWorkTime > 7) recommendations.push('長時間労働の改善が必要')
    if (overtimeWorkers > totalWorkers * 0.5) recommendations.push('残業時間の削減を検討')
    if (averageEfficiency < 70) recommendations.push('作業効率の向上が必要')
    if (fatigueIndex > 8) recommendations.push('疲労軽減対策の実施が必要')

    setAnalysis({
      totalWorkers,
      averageWorkTime,
      averageEfficiency,
      overtimeWorkers,
      overtimeHours: totalOvertimeHours,
      fatigueIndex,
      riskLevel,
      recommendations
    })
  }

  const calculateProductivity = () => {
    if (workerList.length === 0) return

    const totalLaborTime = workerList.reduce((sum, w) => sum + w.laborTime, 0)
    const totalActualTime = workerList.reduce((sum, w) => sum + w.actualWorkTime, 0)
    const totalRestTime = workerList.reduce((sum, w) => sum + w.restTime, 0)

    const workEfficiency = totalLaborTime > 0 ? (totalActualTime / totalLaborTime) * 100 : 0
    const timeUtilization = (totalLaborTime + totalRestTime) > 0 ? 
      (totalActualTime / (totalLaborTime + totalRestTime)) * 100 : 0
    const restTimeRatio = totalLaborTime > 0 ? (totalRestTime / totalLaborTime) * 100 : 0
    
    const overallProductivity = (workEfficiency + timeUtilization) / 2

    const bottleneckFactors: string[] = []
    if (workEfficiency < 70) bottleneckFactors.push('作業効率の低下')
    if (restTimeRatio > 30) bottleneckFactors.push('過剰な休憩時間')
    if (timeUtilization < 60) bottleneckFactors.push('時間活用の非効率')

    setProductivity({
      workEfficiency,
      timeUtilization,
      restTimeRatio,
      overallProductivity,
      bottleneckFactors
    })
  }

  const updateWorker = (id: string, field: keyof Worker, value: string | number) => {
    setWorkerList(prev => prev.map(worker => {
      if (worker.id === id) {
        const updated = { ...worker, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value }
        if (field === 'laborTime' || field === 'actualWorkTime') {
          updated.ratio = calculateRatio(updated.laborTime, updated.actualWorkTime)
          updated.timeClass = getTimeClass(updated.actualWorkTime)
        }
        return updated
      }
      return worker
    }))
  }

  const addWorker = () => {
    const workerCount = workerList.length
    const workerLetter = String.fromCharCode(65 + workerCount)
    
    const newWorker: Worker = {
      id: `worker_${Date.now()}`,
      name: `${workerLetter}さん`,
      laborTime: 8.0,
      actualWorkTime: 7.0,
      ratio: 88,
      timeClass: 'e',
      restTime: 1.0,
      overtimeHours: 0,
      nightShiftHours: 0,
      workLoad: 5
    }
    
    setWorkerList(prev => [...prev, newWorker])
  }

  const removeWorker = (id: string) => {
    setWorkerList(prev => prev.filter(w => w.id !== id))
  }

  // 将来実装予定: 保存ボタン追加時に使用
  const _handleSave = (): void => {
    const evaluationData = {
      workTimeDetails: {
        workers: workerList,
        maxTime,
        maxTimeClass,
        analysis,
        productivity
      },
      workTimeScore: analysis?.fatigueIndex || 1
    }

    // TODO: useEvaluationStoreと連携して保存
    // updateEvaluationData(evaluationData)
    console.log('作業時間データが保存されました', evaluationData)
    alert('作業時間データが保存されました')
  }

  // 将来実装予定: ファイル処理機能（勤怠データCSVインポート等）
  const handleFileUpload = (_files: FileList): void => {
    // TODO: Process uploaded files
    // - 勤怠データCSVの読み込み
    // - 作業時間の自動計算
  }

  // 将来実装予定: 戻るボタン実装時に使用
  const _handleBackToMain = (): void => {
    window.location.href = '/evaluation/new'
  }

  const renderWorkersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">作業者別時間分析</h3>
        <Button onClick={addWorker} variant="outline" size="sm">
          + 作業者追加
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 text-left">作業者</th>
              <th className="border p-2">労働時間(h)</th>
              <th className="border p-2">実働時間(h)</th>
              <th className="border p-2">休憩時間(h)</th>
              <th className="border p-2">残業時間(h)</th>
              <th className="border p-2">夜勤時間(h)</th>
              <th className="border p-2">作業負荷</th>
              <th className="border p-2">効率(%)</th>
              <th className="border p-2">時間級</th>
              <th className="border p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {workerList.map((worker) => (
              <tr key={worker.id} className={worker.id === maxWorkerId ? 'bg-yellow-50' : ''}>
                <td className="border p-2">
                  <Input
                    value={worker.name}
                    onChange={(e) => updateWorker(worker.id, 'name', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    value={worker.laborTime.toString()}
                    onChange={(e) => updateWorker(worker.id, 'laborTime', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={worker.actualWorkTime.toString()}
                    onChange={(e) => updateWorker(worker.id, 'actualWorkTime', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={worker.restTime.toString()}
                    onChange={(e) => updateWorker(worker.id, 'restTime', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={worker.overtimeHours.toString()}
                    onChange={(e) => updateWorker(worker.id, 'overtimeHours', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={worker.nightShiftHours.toString()}
                    onChange={(e) => updateWorker(worker.id, 'nightShiftHours', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={worker.workLoad.toString()}
                    onChange={(e) => updateWorker(worker.id, 'workLoad', e.target.value)}
                    className="w-20"
                  />
                </td>
                <td className="border p-2 text-center font-semibold">
                  {worker.ratio}%
                </td>
                <td className="border p-2 text-center">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    worker.timeClass === 'e' ? 'bg-red-100 text-red-700' :
                    worker.timeClass === 'd' ? 'bg-orange-100 text-orange-700' :
                    worker.timeClass === 'c' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {worker.timeClass.toUpperCase()}
                  </span>
                </td>
                <td className="border p-2 text-center">
                  <Button
                    onClick={() => removeWorker(worker.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">時間級について</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          <div><strong>A級:</strong> &lt;0.25時間</div>
          <div><strong>B級:</strong> 0.25-1時間</div>
          <div><strong>C級:</strong> 1-3時間</div>
          <div><strong>D級:</strong> 3-6.5時間</div>
          <div><strong>E級:</strong> &gt;6.5時間</div>
        </div>
      </div>
    </div>
  )

  const renderShiftsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">シフトパターン管理</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shiftPatterns.map((shift) => (
          <div key={shift.id} className="card p-4 border rounded">
            <h4 className="font-medium mb-3">{shift.name}</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>開始時間:</span>
                <span className="font-medium">{shift.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span>終了時間:</span>
                <span className="font-medium">{shift.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>総労働時間:</span>
                <span className="font-medium">{shift.duration}時間</span>
              </div>
              <div className="flex justify-between">
                <span>休憩時間:</span>
                <span className="font-medium">{shift.breakTime}時間</span>
              </div>
              <div className="flex justify-between">
                <span>実働時間:</span>
                <span className="font-medium text-blue-600">{shift.effectiveWorkTime}時間</span>
              </div>
              <div className="flex justify-between">
                <span>夜勤倍率:</span>
                <span className="font-medium">{shift.nightShiftBonus}倍</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">作業時間分析結果</h3>
      
      {analysis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.totalWorkers}</div>
              <div className="text-sm text-gray-600">総作業者数</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.averageWorkTime.toFixed(1)}h
              </div>
              <div className="text-sm text-gray-600">平均労働時間</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analysis.averageEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">平均作業効率</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.fatigueIndex.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">疲労指数</div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">リスク評価</h4>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-gray-600">総合リスクレベル:</span>
              <span className={`px-3 py-1 rounded font-medium ${
                analysis.riskLevel === 'critical' ? 'bg-red-600 text-white' :
                analysis.riskLevel === 'high' ? 'bg-red-400 text-white' :
                analysis.riskLevel === 'medium' ? 'bg-orange-400 text-white' :
                'bg-green-400 text-white'
              }`}>
                {analysis.riskLevel === 'critical' ? '緊急' :
                 analysis.riskLevel === 'high' ? '高リスク' :
                 analysis.riskLevel === 'medium' ? '中リスク' : '低リスク'}
              </span>
            </div>

            <div>
              <h5 className="font-medium mb-2">推奨改善事項</h5>
              <ul className="list-disc list-inside space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">残業分析</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{analysis.overtimeWorkers}</div>
                <div className="text-sm text-gray-600">残業対象者</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{analysis.overtimeHours.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">総残業時間</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {analysis.totalWorkers > 0 ? 
                    ((analysis.overtimeWorkers / analysis.totalWorkers) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600">残業率</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderProductivityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">生産性分析</h3>
      
      {productivity && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {productivity.workEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">作業効率</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {productivity.timeUtilization.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">時間活用率</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {productivity.restTimeRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">休憩時間比率</div>
            </div>
            
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {productivity.overallProductivity.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">総合生産性</div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">生産性レーダーチャート</h4>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-gray-600">チャート表示エリア</div>
                <div className="text-sm text-gray-500 mt-1">
                  実装時にChart.jsまたは他のライブラリを使用
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">ボトルネック要因</h4>
            {productivity.bottleneckFactors.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {productivity.bottleneckFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-red-600">
                    ⚠️ {factor}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-green-600">
                ✅ 主要なボトルネック要因は検出されませんでした
              </div>
            )}
          </div>

          <div className="card p-6">
            <h4 className="text-lg font-semibold mb-4">改善提案</h4>
            <div className="space-y-3">
              {productivity.workEfficiency < 70 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h5 className="font-medium text-red-800">作業効率改善</h5>
                  <p className="text-sm text-red-700">作業プロセスの見直し、自動化の検討、スキル向上研修の実施</p>
                </div>
              )}
              
              {productivity.timeUtilization < 60 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <h5 className="font-medium text-orange-800">時間活用改善</h5>
                  <p className="text-sm text-orange-700">作業スケジュールの最適化、待機時間の削減対策</p>
                </div>
              )}
              
              {productivity.restTimeRatio > 30 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="font-medium text-yellow-800">休憩時間適正化</h5>
                  <p className="text-sm text-yellow-700">休憩時間の見直し、作業負荷の分散検討</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側: 写真表示エリア */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4">作業写真・資料</h3>
              {/* 将来実装予定: OptimizedImageコンポーネント使用（line 5参照） */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Work time analysis"
                className="w-full h-48 object-cover rounded mb-4"
              />
              <div className="mt-4">
                <FileUpload
                  onFileUpload={handleFileUpload}
                  variant="document"
                  layout="vertical"
                  size="md"
                />
              </div>
            </div>

            {/* 最大時間表示 */}
            <div className="card p-4 mt-4">
              <h4 className="font-semibold mb-2">最大労働時間</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {maxTime.toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">
                  時間級: {maxTimeClass.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 評価エリア */}
          <form className="lg:col-span-3 evaluation-form" role="form">
            {/* タブナビゲーション */}
            <div className="card mb-6">
              <div className="border-b">
                <nav className="flex space-x-8 px-6 py-4">
                  {[
                    { key: 'workers', label: '作業者分析', icon: '👥' },
                    { key: 'shifts', label: 'シフト管理', icon: '⏰' },
                    { key: 'analysis', label: '時間分析', icon: '📊' },
                    { key: 'productivity', label: '生産性分析', icon: '🎯' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as 'analysis' | 'workers' | 'shifts' | 'productivity')}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'workers' && renderWorkersTab()}
                {activeTab === 'shifts' && renderShiftsTab()}
                {activeTab === 'analysis' && renderAnalysisTab()}
                {activeTab === 'productivity' && renderProductivityTab()}
              </div>
            </div>
          </form>
        </div>
      </section>

    </div>
  )
}