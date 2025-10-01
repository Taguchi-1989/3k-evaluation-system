'use client'

import React, { useState } from 'react'
import { Header, Footer } from '@/components/layout'
import { AspectContainer, AspectHeader, AspectMain, AspectFooter, Button, Input } from '@/components/ui'
import { PostureList } from '@/components/evaluation'

export default function PostureInputPage(): React.JSX.Element {
  const [selectedPosture, setSelectedPosture] = useState<string>('')

  const handlePostureSelect = (postureId: string) => {
    setSelectedPosture(postureId)
  }

  const handleAddCustomPosture = () => {
    // TODO: Implement custom posture addition functionality
  }

  const handleMatrixEvaluation = () => {
    window.location.href = '/evaluation/physical/posture/matrix'
  }

  const handleBack = () => {
    window.location.href = '/evaluation/physical'
  }

  const handleBackToMain = () => {
    window.location.href = '/evaluation/new'
  }

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard'
  }

  return (
    <AspectContainer>
      <AspectHeader>
        <Header
          variant="simple"
          title="姿勢入力 - 肉体因詳細評価"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBack}>
                ← 戻る
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleMatrixEvaluation}
                disabled={!selectedPosture}
              >
                マトリックス評価へ →
              </Button>
            </div>
          }
        />
      </AspectHeader>

      <AspectMain className="p-4 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* 左列: 姿勢一覧・選択 */}
          <div className="col-span-6 flex flex-col">
            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">姿勢一覧・選択</h2>
                <Button variant="outline" size="sm" onClick={handleAddCustomPosture}>
                  + カスタム姿勢追加
                </Button>
              </div>
              
              <PostureList 
                onPostureSelect={handlePostureSelect}
                className="h-full"
              />
            </div>
          </div>

          {/* 右列: 姿勢詳細設定 */}
          <div className="col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <h2 className="text-lg font-bold mb-4">選択姿勢の詳細設定</h2>
              
              {selectedPosture ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">姿勢名</label>
                    <Input placeholder="姿勢名を入力" className="w-full" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">継続時間 (分)</label>
                    <Input type="number" placeholder="30" className="w-full" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">頻度 (回/時間)</label>
                    <Input type="number" placeholder="10" className="w-full" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">負荷レベル</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>低負荷</option>
                      <option>中負荷</option>
                      <option>高負荷</option>
                      <option>極度負荷</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">備考</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none"
                      placeholder="姿勢に関する詳細情報や注意点"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  左の一覧から姿勢を選択してください
                </div>
              )}
            </div>
          </div>
        </div>
      </AspectMain>

      <AspectFooter>
        <Footer
          variant="simple"
          actions={
            <>
              <Button variant="outline" onClick={handleBack}>
                ← 肉体因詳細
              </Button>
              <Button variant="outline" onClick={handleBackToMain}>
                メイン画面
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard}>
                ダッシュボード
              </Button>
              <Button 
                variant="primary" 
                onClick={handleMatrixEvaluation}
                disabled={!selectedPosture}
              >
                マトリックス評価 →
              </Button>
            </>
          }
        />
      </AspectFooter>
    </AspectContainer>
  )
}