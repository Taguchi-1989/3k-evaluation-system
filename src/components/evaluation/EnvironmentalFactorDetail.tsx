'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout'
import { FileUpload, Input } from '@/components/ui'
// 将来実装予定: アクションボタン追加時に使用
// import { Button } from '@/components/ui'
import { PhotoViewer } from '@/components/evaluation'
// 将来実装予定: 評価基準表示・初期データ設定機能
// import { EVALUATION_STANDARDS, DEFAULT_EVALUATION_DATA } from '@/data/defaultEvaluationData'

export interface EnvironmentalItem {
  id: string
  label: string
  isChecked: boolean
  thinkingValue?: string
  standardValue?: string
  measuredValue?: string
  exposureDuration?: string
  evaluation?: string
  unit?: string
}

export interface EnvironmentalFactorDetailProps {
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
  environmentalItems?: EnvironmentalItem[]
}

// デフォルトの環境因子項目
const defaultEnvironmentalItems: EnvironmentalItem[] = [
  { id: '1', label: '一般化学物質', isChecked: false, unit: 'ppm' },
  { id: '2', label: 'アンモニア', isChecked: false, standardValue: '20ppm', unit: 'ppm' },
  { id: '3', label: '汚れ付着', isChecked: false },
  { id: '4', label: '粉塵雰囲気', isChecked: false, unit: 'ppm' },
  { id: '5', label: '高温', isChecked: false, unit: 'WBGT°C' },
  { id: '6', label: '寒冷', isChecked: false, unit: '°C' },
  { id: '7', label: '環境騒音', isChecked: false, unit: 'dB' },
  { id: '8', label: '衝撃騒音', isChecked: false, unit: 'dB' },
  { id: '9', label: '全身振動', isChecked: false, unit: 'm/s2' },
  { id: '10', label: '手腕振動', isChecked: false, unit: 'm/s2' },
  { id: '11', label: '紫外線', isChecked: false, unit: 'J/m2' }
]

export function EnvironmentalFactorDetail({
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/600x450/e5e7eb/4b5563?text=Photo',
  environmentalItems = defaultEnvironmentalItems
}: EnvironmentalFactorDetailProps): React.JSX.Element {
  const [items, setItems] = useState(environmentalItems)
  const [selectedMatrix, setSelectedMatrix] = useState({ strength: 1, duration: 1 })
  const [finalScore, setFinalScore] = useState(1)

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isChecked: checked } : item
    ))
  }

  const handleInputChange = (itemId: string, field: string, value: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ))
  }

  // 将来実装予定: ファイル処理機能（SDS/測定結果の自動解析等）
  const handleFileUpload = (_files: FileList): void => {
    // TODO: Process uploaded files
    // - PDF/画像からのデータ抽出
    // - 自動入力機能
  }

  // 将来実装予定: 戻るボタン実装時に使用
  const _handleBackToMain = (): void => {
    window.location.href = '/evaluation/new'
  }

  // 環境因用の評価マトリックス (4-6段階評価)
  // HTMLファイルの設計に合わせた3×5マトリックス
  const environmentalMatrix = [
    [1, 1, 2, 4, 7],      // <10%
    [1, 2, 4, 7, 10],     // 10-50%
    [1, 4, 7, 10, 10]     // >50%
  ]

  const getMatrixValue = (strength: number, duration: number) => {
    return environmentalMatrix[duration]?.[strength] ?? 0
  }

  const handleMatrixClick = (strength: number, duration: number) => {
    setSelectedMatrix({ strength, duration })
    const score = getMatrixValue(strength, duration)
    setFinalScore(score)
  }

  const getMatrixCellClass = (value: number, isSelected: boolean) => {
    let baseClass = 'cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-gray-600 p-2'
    
    if (isSelected) {
      baseClass += ' bg-yellow-200 dark:bg-yellow-800 border-2 border-yellow-500 dark:border-yellow-400 text-yellow-900 dark:text-yellow-100 ring-4 ring-yellow-400 dark:ring-yellow-300 scale-105 shadow-lg'
    } else {
      switch(value) {
        case 1: baseClass += ' bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'; break
        case 2: baseClass += ' bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'; break
        case 4: baseClass += ' bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'; break
        case 7: baseClass += ' bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'; break
        case 10: baseClass += ' bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100'; break
        default: baseClass += ' bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }
    }
    
    return baseClass + ' hover:scale-105'
  }

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
        {/* 左列: 写真ギャラリー & ファイルアップロード */}
        <div className="w-3/12 flex flex-col h-full space-y-3">
          <PhotoViewer
            mainPhoto={photoUrl}
            thumbnails={[
              photoUrl,
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+1',
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+2',
              'https://placehold.co/120x90/e2e8f0/475569?text=Photo+3'
            ]}
            showGalleryInfo={true}
            galleryTitle="環境写真"
            className="flex-grow"
          />
          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
            <FileUpload
              variant="document"
              layout="vertical"
              size="sm"
              onFileUpload={handleFileUpload}
              label="SDS/基準書"
            />
            <FileUpload
              variant="document"
              layout="vertical"
              size="sm"
              onFileUpload={handleFileUpload}
              label="測定結果"
            />
          </div>
        </div>

        {/* 中央列: 入力フォーム */}
        <div className="w-6/12 flex flex-col h-full border rounded-lg p-2 space-y-3">
          <h2 className="text-sm font-bold flex-shrink-0">評価対象</h2>
          <div className="text-xs space-y-1 overflow-y-auto flex-grow pr-2 max-h-80">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-2 items-center text-[10px] font-bold text-gray-500 mb-1 sticky top-0 bg-white">
              <div></div><div>評価項目</div><div>考え方</div><div>基準値</div><div>測定値</div><div>暴露持続</div><div>評価</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-2 items-center p-1 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={item.isChecked}
                  onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                />
                <label className="text-xs">{item.label}</label>
                <button className="p-1 rounded-full hover:bg-gray-200">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.448-2.09 1.172-2.828M12 14v.01M12 18v-2m-3-5a3 3 0 116 0 3 3 0 01-6 0z" />
                  </svg>
                </button>
                <Input
                  className="w-16 p-1 text-right text-xs"
                  placeholder={item.standardValue || item.unit || '基準値'}
                  value={item.thinkingValue || ''}
                  onChange={(e) => handleInputChange(item.id, 'thinkingValue', e.target.value)}
                />
                {item.label === '汚れ付着' ? (
                  <select className="w-16 p-1 border rounded-md text-xs">
                    <option>弱</option>
                    <option>強</option>
                  </select>
                ) : (
                  <Input
                    className="w-16 p-1 text-right text-xs"
                    placeholder={item.unit}
                    value={item.measuredValue || ''}
                    onChange={(e) => handleInputChange(item.id, 'measuredValue', e.target.value)}
                    disabled={!item.isChecked}
                    type="number"
                    step="0.1"
                  />
                )}
                <select
                  className="w-16 p-1 border rounded-md text-xs"
                  value={item.exposureDuration || '40%'}
                  onChange={(e) => handleInputChange(item.id, 'exposureDuration', e.target.value)}
                  disabled={!item.isChecked}
                >
                  <option>5%</option>
                  <option>10%</option>
                  <option>20%</option>
                  <option>40%</option>
                  <option>60%</option>
                  <option>80%</option>
                </select>
                <div className="w-16 p-1 text-center font-bold text-gray-500">
                  {item.evaluation || '-'}
                </div>
              </div>
            ))}
            <div className="p-1 mt-2 border-t pt-2 text-xs">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-2 items-center">
                <input type="checkbox" className="h-4 w-4" />
                <label>エイヤ</label>
                <button className="p-1 rounded-full hover:bg-gray-200">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.105.448-2.09 1.172-2.828M12 14v.01M12 18v-2m-3-5a3 3 0 116 0 3 3 0 01-6 0z" />
                  </svg>
                </button>
                <div className="flex items-center gap-1 col-span-4 justify-self-end">
                  <select className="border rounded-md p-1 text-xs w-24">
                    <option>選択...</option>
                  </select>
                  <select className="border rounded-md p-1 text-xs w-20">
                    <option>&lt;20%</option>
                    <option>&gt;20%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* 備考欄 */}
          <div className="p-2 border-t flex-shrink-0 text-xs space-y-1 bg-gray-50 dark:bg-gray-800 h-32">
            <h3 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">備考欄</h3>
            <div className="space-y-2">
              <textarea 
                className="w-full h-16 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
                placeholder="環境因子に関する特記事項を記入してください。&#10;&#10;例:&#10;・測定時の気象条件や作業環境&#10;・使用した測定機器や測定方法&#10;・一時的な環境変化の影響&#10;・改善提案や対策"
              ></textarea>
              
              <div className="text-gray-600 dark:text-gray-400 text-[9px]">
                <p className="font-medium mb-1">記入ポイント: 測定条件、環境変化、対策案などの定性的情報</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右列: 評価マトリクス & 結果 */}
        <div className="w-3/12 flex flex-col h-full space-y-3">
          <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-600 flex-grow flex flex-col">
            <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-px flex-grow bg-white dark:bg-gray-900 p-1 text-[10px]">
              <div className="font-bold col-span-6 text-center text-sm mb-1 text-gray-800 dark:text-gray-200">環境因評価マトリクス</div>
              <div className="font-bold self-center border-r pr-1 row-span-2 flex items-center justify-center -rotate-90 whitespace-nowrap text-gray-800 dark:text-gray-200">②負荷持続</div>
              <div className="col-span-5 font-bold text-center border-b border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">①強度</div>
              <div className="font-bold text-center whitespace-normal text-[9px] text-gray-700 dark:text-gray-300">どちらとも<br/>言えない</div>
              <div className="font-bold text-center whitespace-normal text-[9px] text-gray-700 dark:text-gray-300">比較的<br/>ある</div>
              <div className="font-bold text-center text-[9px] text-gray-700 dark:text-gray-300">高い</div>
              <div className="font-bold text-center whitespace-normal text-[9px] text-gray-700 dark:text-gray-300">非常に<br/>高い</div>
              <div className="font-bold text-center whitespace-normal text-[9px] text-gray-700 dark:text-gray-300">ほとんど<br/>限界</div>
              
              {/* マトリックス本体 - HTMLファイルの通り3×5 */}
              <div className="font-bold self-center border-r pr-1 text-gray-700 dark:text-gray-300">＜10%</div>
              {[1, 1, 2, 4, 7].map((value, idx) => (
                <div
                  key={`0-${idx}`}
                  className={getMatrixCellClass(value, selectedMatrix.duration === 0 && selectedMatrix.strength === idx)}
                  onClick={() => handleMatrixClick(idx, 0)}
                >
                  {value}
                </div>
              ))}
              
              <div className="font-bold self-center border-r pr-1 text-gray-700 dark:text-gray-300">10-50%</div>
              {[1, 2, 4, 7, 10].map((value, idx) => (
                <div
                  key={`1-${idx}`}
                  className={getMatrixCellClass(value, selectedMatrix.duration === 1 && selectedMatrix.strength === idx)}
                  onClick={() => handleMatrixClick(idx, 1)}
                >
                  {value}
                </div>
              ))}
              
              <div className="font-bold self-center border-r pr-1 text-gray-700 dark:text-gray-300">＞50%</div>
              {[1, 4, 7, 10, 10].map((value, idx) => (
                <div
                  key={`2-${idx}`}
                  className={getMatrixCellClass(value, selectedMatrix.duration === 2 && selectedMatrix.strength === idx)}
                  onClick={() => handleMatrixClick(idx, 2)}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
            <h3 className="text-sm font-medium text-blue-800">環境因 (最終評価)</h3>
            <p className="text-3xl font-bold text-blue-700">{finalScore}</p>
          </div>
        </div>
      </section>

    </div>
  )
}