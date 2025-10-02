'use client'

import React, { type ReactNode, useState } from 'react'
import { Header } from '@/components/layout'
import { TabInterface, type Tab } from '@/components/ui/TabInterface'
import { PostureList, MatrixDisplay, type Posture } from '@/components/evaluation'
// 将来実装予定: アクションボタン追加時に使用
// import { Button } from '@/components/ui'

export interface GenericFactorDetailProps {
  title: string
  factorType?: string
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
  tabs?: Tab[]
  matrixTitle?: string
  resultScore?: number
  resultUnit?: string
  resultColor?: string
  rightPanelContent?: ReactNode
}

export function GenericFactorDetail({
  title,
  factorType: _factorType,  // 将来実装予定: 因子タイプ別のカスタマイズ
  evaluationNo,
  creator,
  checker,
  workInfo,
  photoUrl = 'https://placehold.co/400x300/e5e7eb/4b5563?text=Photo',
  postures,
  tabs = [],
  matrixTitle = '評価マトリクス',
  resultScore = 0,
  resultUnit = 'スコア',
  resultColor = 'text-blue-600',
  rightPanelContent
}: GenericFactorDetailProps): React.JSX.Element {
  const [_selectedPosture, setSelectedPosture] = useState<string>('')  // 将来実装予定: 姿勢選択時のハイライト表示

  // 将来実装予定: 化学物質評価ページへの遷移ボタン
  const _handleChemicalEvaluation = (): void => {
    window.location.href = '/evaluation/environmental/chemical'
  }

  // 将来実装予定: メイン評価ページへの戻るボタン
  const _handleBackToMain = (): void => {
    window.location.href = '/evaluation/new'
  }

  // 将来実装予定: ダッシュボードへの戻るボタン
  const _handleBackToDashboard = (): void => {
    window.location.href = '/dashboard'
  }

  const defaultTabs: Tab[] = [
    {
      id: 'tab1',
      label: '① 基本評価',
      content: (
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">{title}の評価項目</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="generic-eval-item-1" className="text-xs">評価項目1:</label>
              <select id="generic-eval-item-1" aria-label="評価項目1の評価レベル" className="border rounded-md p-1 text-xs">
                <option>低い</option>
                <option>普通</option>
                <option>高い</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tab2',
      label: '② 詳細設定',
      content: (
        <div className="space-y-2 text-sm">
          <p className="text-gray-600">詳細な評価設定</p>
        </div>
      )
    }
  ]

  const tabsToUse = tabs.length > 0 ? tabs : defaultTabs

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
        {/* 左列: 写真 & 姿勢リスト */}
        <div className="w-1/3 flex flex-col h-full space-y-3">
          <div className="flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center p-2 h-40">
            {/* 将来実装予定: OptimizedImageコンポーネント使用（line 8参照） */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} className="evaluation-photo rounded" alt="関連写真" />
          </div>
          <PostureList
            postures={postures}
            onPostureSelect={setSelectedPosture}
            onAddPosture={() => {/* TODO: Add new posture */}}
          />
        </div>

        {/* 中央列: 入力フォーム (タブ形式) */}
        <div className="w-1/3 flex flex-col h-full">
          <TabInterface tabs={tabsToUse} defaultTab={tabsToUse[0]?.id} />
          
          {/* 基準表示エリア */}
          <div className="p-2 border-t flex-shrink-0 text-xs space-y-1 bg-gray-50 h-1/3 overflow-y-auto">
            <h3 className="font-bold text-sm mb-1">基準表示エリア</h3>
            <p className="text-gray-600">{title}の評価基準が表示されます。</p>
          </div>
        </div>

        {/* 右列: 評価マトリクス, 結果 & 備考 */}
        <div className="w-1/3 flex flex-col h-full space-y-3">
          {rightPanelContent || (
            <>
              <MatrixDisplay
                title={matrixTitle}
                onCellClick={(_row, _col, _value) => {/* TODO: マトリクスセル選択時の処理 */}}
              />
              
              {/* 結果表示エリア */}
              <div className="flex-shrink-0 bg-white border rounded-lg p-3">
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-700">計算結果</h3>
                  <div className="mt-2">
                    <span className={`text-2xl font-bold ${resultColor}`}>{resultScore}</span>
                    <p className="text-xs text-gray-500 mt-1">{title}{resultUnit}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  )
}