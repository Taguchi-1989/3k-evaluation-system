'use client'

import React, { useEffect, Suspense } from 'react'
import { MentalFactorDetail } from '@/components/evaluation/MentalFactorDetail'
import { EvaluationLayout, EvaluationContentContainer } from '@/components/layout/EvaluationLayout'
import { Footer } from '@/components/layout'
import { useNavigation } from '@/hooks/useNavigation'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'

function MentalFactorPageContent(): React.JSX.Element {
  const { getReturnPath } = useNavigation()
  const { setCurrentPath, pushToHistory } = useEvaluationStore()

  useEffect(() => {
    const returnPath = getReturnPath()
    if (returnPath) {
      pushToHistory(returnPath)
    }
    setCurrentPath('/evaluation/mental')
  }, [getReturnPath, pushToHistory, setCurrentPath])

  const breadcrumbItems = [
    { label: 'ホーム', path: '/' },
    { label: '評価', path: '/evaluation/new' },
    { label: '精神因子評価', isActive: true }
  ]

  return (
    <EvaluationLayout
      variant="simple"
      title="精神因子詳細評価"
      showGrid={false}
      breadcrumbItems={breadcrumbItems}
      footer={<Footer variant="app" asContent={true} />}
      evaluationContent={
        <EvaluationContentContainer>
          <MentalFactorDetail
            creator={{
              department: '生産技術企画部',
              name: '山田 太郎',
              date: '2024/08/20'
            }}
            checker={{
              department: '生産企画部',
              name: '鈴木 一郎',
              date: '2024/08/21'
            }}
            workInfo={{
              workName: 'サンプル作業',
              factoryName: '〇〇工場',
              processName: '△△工程'
            }}
          />
        </EvaluationContentContainer>
      }
    />
  )
}

export default function MentalFactorPage(): React.JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <MentalFactorPageContent />
    </Suspense>
  )
}