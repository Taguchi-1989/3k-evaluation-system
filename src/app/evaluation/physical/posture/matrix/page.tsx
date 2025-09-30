'use client'

import { useState } from 'react'
import { Header, Footer } from '@/components/layout'
import { AspectContainer, AspectHeader, AspectMain, AspectFooter, Button } from '@/components/ui'
import { MatrixDisplay, OWASMatrix, RULAMatrix } from '@/components/evaluation'

export default function MatrixEvaluationPage() {
  const [selectedMatrix, setSelectedMatrix] = useState<'RULA' | 'OWAS'>('RULA')
  const [matrixScore, setMatrixScore] = useState<number | null>(null)

  const handleMatrixChange = (matrix: 'RULA' | 'OWAS') => {
    setSelectedMatrix(matrix)
    setMatrixScore(null)
  }

  const handleMatrixScoreChange = (score: number) => {
    setMatrixScore(score)
  }

  const handleSaveEvaluation = () => {
    // TODO: データベースに保存
    // Save evaluation data: { matrix: selectedMatrix, score: matrixScore }
    handleBack()
  }

  const handleBack = () => {
    window.location.href = '/evaluation/physical/posture'
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
          title="マトリックス評価 - RULA/OWAS"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBack}>
                ← 姿勢入力に戻る
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSaveEvaluation}
                disabled={matrixScore === null}
              >
                評価を保存
              </Button>
            </div>
          }
        />
      </AspectHeader>

      <AspectMain className="p-4 bg-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* 左列: マトリックス選択・説明 */}
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-4">評価手法選択</h2>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="matrix" 
                    checked={selectedMatrix === 'RULA'}
                    onChange={() => handleMatrixChange('RULA')}
                    className="mr-2"
                  />
                  <span className="font-medium">RULA (Rapid Upper Limb Assessment)</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">上肢作業の評価に適用</p>
                
                <label className="flex items-center mt-4">
                  <input 
                    type="radio" 
                    name="matrix" 
                    checked={selectedMatrix === 'OWAS'}
                    onChange={() => handleMatrixChange('OWAS')}
                    className="mr-2"
                  />
                  <span className="font-medium">OWAS (Ovako Working Posture Analysis)</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">全身姿勢の評価に適用</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <h3 className="font-bold mb-2">評価基準</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>スコア 1-2:</span>
                  <span className="text-green-600">許容可能</span>
                </div>
                <div className="flex justify-between">
                  <span>スコア 3-4:</span>
                  <span className="text-yellow-600">要調査</span>
                </div>
                <div className="flex justify-between">
                  <span>スコア 5-6:</span>
                  <span className="text-orange-600">要改善</span>
                </div>
                <div className="flex justify-between">
                  <span>スコア 7:</span>
                  <span className="text-red-600">即座に改善</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右列: マトリックス表示・評価 */}
          <div className="col-span-9 flex flex-col">
            <div className="bg-white rounded-lg shadow p-4 flex-grow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{selectedMatrix} マトリックス</h2>
                {matrixScore !== null && (
                  <div className="text-right">
                    <span className="text-sm text-gray-600">評価スコア: </span>
                    <span className={`text-lg font-bold ${
                      matrixScore <= 2 ? 'text-green-600' :
                      matrixScore <= 4 ? 'text-yellow-600' :
                      matrixScore <= 6 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {matrixScore}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="h-full flex items-center justify-center">
                {selectedMatrix === 'RULA' ? (
                  <RULAMatrix
                    onSelectionChange={(score) => handleMatrixScoreChange(score)}
                    className="w-full h-full"
                  />
                ) : selectedMatrix === 'OWAS' ? (
                  <OWASMatrix
                    onSelectionChange={(score) => handleMatrixScoreChange(Number(score))}
                    className="w-full h-full"
                  />
                ) : (
                  <MatrixDisplay 
                    type={selectedMatrix}
                    onScoreChange={handleMatrixScoreChange}
                    className="w-full h-full"
                  />
                )}
              </div>
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
                ← 姿勢入力
              </Button>
              <Button variant="outline" onClick={handleBackToMain}>
                メイン画面
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard}>
                ダッシュボード
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveEvaluation}
                disabled={matrixScore === null}
              >
                評価を保存
              </Button>
            </>
          }
        />
      </AspectFooter>
    </AspectContainer>
  )
}