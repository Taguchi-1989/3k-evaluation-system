'use client'

import React, { useEffect } from 'react'
import { PhysicalFactorDetailDynamic } from '@/components/optimized/DynamicImports'
import { EvaluationLayout, EvaluationContentContainer } from '@/components/layout/EvaluationLayout'
import { Footer } from '@/components/layout'
import { useNavigation } from '@/hooks/useNavigation'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'

export default function PhysicalFactorPage(): React.JSX.Element {
  const { getReturnPath } = useNavigation()
  const { setCurrentPath, pushToHistory } = useEvaluationStore()

  // マウント時のみ実行（パス履歴の初期化）
  // getReturnPath/pushToHistory/setCurrentPathは安定した関数のため依存配列から除外
  useEffect(() => {
    const returnPath = getReturnPath()
    if (returnPath) {
      pushToHistory(returnPath)
    }
    setCurrentPath('/evaluation/physical')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const breadcrumbItems = [
    { label: 'ホーム', path: '/' },
    { label: '評価', path: '/evaluation/new' },
    { label: '肉体因子評価', isActive: true }
  ]

  return (
    <EvaluationLayout
      variant="simple"
      title="肉体因子詳細評価"
      showGrid={false}
      breadcrumbItems={breadcrumbItems}
      footer={<Footer variant="app" asContent={true} />}
      evaluationContent={
        <EvaluationContentContainer>
          <PhysicalFactorDetailDynamic
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