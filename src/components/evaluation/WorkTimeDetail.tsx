'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout'
import { FileUpload, Input, Button } from '@/components/ui'
import { EVALUATION_STANDARDS, DEFAULT_EVALUATION_DATA } from '@/data/defaultEvaluationData'

export interface Worker {
  id: string
  name: string
  laborTime: number
  actualWorkTime: number
  ratio: number
  timeClass: string
}

export interface WorkTimeDetailProps {
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

// デフォルトデータから作業時間項目を生成
const generateWorkers = (): Worker[] => {
  const workTimeStandards = EVALUATION_STANDARDS.workTime
  const defaultData = DEFAULT_EVALUATION_DATA.workTimeFactor
  
  return defaultData.workers.map((worker, index) => ({
    id: `${index + 1}`,
    name: worker.name,
    laborTime: worker.laborTime,
    actualWorkTime: worker.actualWorkTime,
    ratio: Math.round((worker.actualWorkTime / worker.laborTime) * 100),
    timeClass: worker.timeClass || 'e'
  }))
}

const defaultWorkers: Worker[] = generateWorkers() || [
  {
    id: '1',
    name: 'Aさん',
    laborTime: 8.0,
    actualWorkTime: 6.8,
    ratio: 85,
    timeClass: 'e'
  },
  {
    id: '2',
    name: 'Bさん',
    laborTime: 8.0,
    actualWorkTime: 7.2,
    ratio: 90,
    timeClass: 'e'
  }
]

export function WorkTimeDetail({
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Photo',
  workers = defaultWorkers
}: WorkTimeDetailProps) {
  const [workerList, setWorkerList] = useState(workers)
  const [maxTime, setMaxTime] = useState(0)
  const [maxTimeClass, setMaxTimeClass] = useState('')
  const [maxWorkerId, setMaxWorkerId] = useState('')

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

  const updateWorker = (id: string, field: 'laborTime' | 'actualWorkTime', value: string) => {
    setWorkerList(prev => prev.map(worker => {
      if (worker.id === id) {
        const updated = { ...worker }
        updated[field] = parseFloat(value) || 0
        updated.ratio = calculateRatio(updated.laborTime, updated.actualWorkTime)
        updated.timeClass = getTimeClass(updated.actualWorkTime)
        return updated
      }
      return worker
    }))
  }

  const addWorker = () => {
    const workerCount = workerList.length
    const workerLetter = String.fromCharCode(65 + workerCount) // C, D, E...
    const workTimeValue = workerLetter === 'C' ? 1.0 : 7.0

    const newWorker: Worker = {
      id: String(workerCount + 1),
      name: `${workerLetter}さん`,
      laborTime: 8.0,
      actualWorkTime: workTimeValue,
      ratio: calculateRatio(8.0, workTimeValue),
      timeClass: getTimeClass(workTimeValue)
    }
    setWorkerList([...workerList, newWorker])
  }

  // 最大作業時間の計算
  useEffect(() => {
    let max = 0
    let maxClass = ''
    let maxId = ''
    
    workerList.forEach(worker => {
      if (worker.actualWorkTime > max) {
        max = worker.actualWorkTime
        maxClass = worker.timeClass
        maxId = worker.id
      }
    })
    
    setMaxTime(max)
    setMaxTimeClass(maxClass)
    setMaxWorkerId(maxId)
  }, [workerList])

  const handleFileUpload = (files: FileList) => {
    // TODO: Process uploaded files
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const timeClassRanges = [
    { class: 'a', range: 'T < 0.25h', label: 'a' },
    { class: 'b', range: '0.25h ≤ T < 1h', label: 'b' },
    { class: 'c', range: '1h ≤ T < 3h', label: 'c' },
    { class: 'd', range: '3h ≤ T < 6.5h', label: 'd' },
    { class: 'e', range: 'T ≥ 6.5h', label: 'e' }
  ]

  return (
    <div className="aspect-container">
      <Header
        variant="standard"
        evaluationNo={evaluationNo}
        creator={creator}
        checker={checker}
        workInfo={workInfo}
      />

      <section className="flex-grow p-3 flex flex-row gap-3 overflow-hidden bg-white">
        {/* 左列: 写真 & 書類アップロード */}
        <div className="w-4/12 flex flex-col h-full space-y-3">
          <div className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center p-2">
            <img src={photoUrl} className="evaluation-photo rounded" alt="関連写真" />
          </div>
          <FileUpload
            variant="document"
            layout="vertical"
            size="sm"
            onFileUpload={handleFileUpload}
            label="資料をアップロード"
            showAttachedFiles={true}
            attachedFiles={[
              {
                id: '1',
                name: '作業時間管理基準書.pdf',
                size: 1024000,
                type: 'application/pdf',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
              },
              {
                id: '2',
                name: '評価写真.jpg',
                size: 512000,
                type: 'image/jpeg',
                url: 'https://placehold.co/800x600/e5e7eb/4b5563?text=Sample+Image'
              },
              {
                id: '3',
                name: '参考資料.docx',
                size: 256000,
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                url: '#'
              }
            ]}
          />
        </div>

        {/* 右列: 入力表 & 評価 */}
        <div className="w-8/12 flex flex-col h-full space-y-3">
          <div className="flex-grow flex flex-col border rounded-lg p-2 overflow-hidden">
            <div className="flex items-center mb-2">
              <h2 className="text-sm font-bold flex-shrink-0">作業時間入力</h2>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-xs"
                onClick={addWorker}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                作業者を追加
              </Button>
            </div>
            <div className="table-container text-xs overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">作業者</th>
                    <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">労働時間 (h)</th>
                    <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">当該作業に対する実際作業時間 (h)</th>
                    <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">割合</th>
                    <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">時間分類</th>
                  </tr>
                </thead>
                <tbody>
                  {workerList.map((worker) => {
                    const isMax = worker.id === maxWorkerId
                    return (
                      <tr key={worker.id} className={isMax ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}>
                        <td className="p-1 border border-gray-300 dark:border-gray-600 font-bold text-gray-800 dark:text-gray-200">{worker.name}</td>
                        <td className="p-1 border border-gray-300 dark:border-gray-600">
                          <Input
                            type="text"
                            className={`w-full p-1 text-right text-xs ${isMax ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            value={worker.laborTime.toFixed(1)}
                            onChange={(e) => updateWorker(worker.id, 'laborTime', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border border-gray-300 dark:border-gray-600">
                          <Input
                            type="text"
                            className={`w-full p-1 text-right text-xs ${isMax ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
                            value={worker.actualWorkTime.toFixed(1)}
                            onChange={(e) => updateWorker(worker.id, 'actualWorkTime', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border border-gray-300 dark:border-gray-600 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{worker.ratio}%</td>
                        <td className="p-1 border border-gray-300 dark:border-gray-600 text-center bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-gray-200">{worker.timeClass}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex-shrink-0 grid grid-cols-2 gap-3">
            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
              <p className="font-bold mb-2 text-center text-sm text-gray-800 dark:text-gray-200">時間分類マトリクス</p>
              <div className="space-y-1 text-[10px]">
                {timeClassRanges.map((range) => (
                  <div
                    key={range.class}
                    className={`p-1 rounded ${
                      range.class === maxTimeClass
                        ? 'bg-yellow-200 dark:bg-yellow-300 font-bold border border-yellow-400 text-yellow-900 dark:text-yellow-800'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {range.label}: {range.range}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-2 text-center flex flex-col justify-center">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">作業時間 (最大)</h3>
              <div className="flex items-baseline justify-center gap-2">
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  {maxTime.toFixed(1)} <span className="text-lg">h</span>
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">({maxTimeClass})</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}