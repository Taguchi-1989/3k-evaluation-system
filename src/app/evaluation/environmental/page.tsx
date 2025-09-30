'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { EvaluationLayout, EvaluationContentContainer } from '@/components/layout/EvaluationLayout'
import { Footer } from '@/components/layout'
import { useNavigation } from '@/hooks/useNavigation'
import { useEvaluationStore } from '@/hooks/useEvaluationStore'
import { useEffect } from 'react'
import { EvaluationSkeleton } from '@/components/ui/LoadingSkeletons'

const EnhancedEnvironmentalFactorDetail = dynamic(() => import('@/components/evaluation/EnhancedEnvironmentalFactorDetail').then(mod => ({ default: mod.EnhancedEnvironmentalFactorDetail })), {
  loading: () => <EvaluationSkeleton />,
  ssr: false
})

export default function EnvironmentalFactorPage() {
  const { getReturnPath } = useNavigation()
  const { setCurrentPath, pushToHistory } = useEvaluationStore()

  useEffect(() => {
    const returnPath = getReturnPath()
    if (returnPath) {
      pushToHistory(returnPath)
    }
    setCurrentPath('/evaluation/environmental')
  }, [getReturnPath, pushToHistory, setCurrentPath])

  const breadcrumbItems = [
    { label: 'ホーム', path: '/' },
    { label: '評価', path: '/evaluation/new' },
    { label: '環境因子評価', isActive: true }
  ]

  return (
    <EvaluationLayout
      variant="simple"
      title="環境因子詳細評価"
      showGrid={false}
      breadcrumbItems={breadcrumbItems}
      footer={<Footer variant="app" asContent={true} />}
      evaluationContent={
        <EvaluationContentContainer>
          <Suspense fallback={<EvaluationSkeleton />}>
            <EnhancedEnvironmentalFactorDetail
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
          </Suspense>
        </EvaluationContentContainer>
      }
    />
  )
}