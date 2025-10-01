'use client'

import React, { use } from 'react'
import { EvaluationMain } from '@/components/evaluation'
import { AspectContainer } from '@/components/ui'

interface EditEvaluationPageProps {
  params: Promise<{
    id: string
  }>
}

// クライアントコンポーネントの場合はgenerateStaticParamsは使用不可
// 動的importでビルド時の静的生成問題を回避

export default function EditEvaluationPage({ params }: EditEvaluationPageProps): React.JSX.Element {
  const resolvedParams = use(params)
  const evaluationId = resolvedParams.id
  
  // TODO: データベースから評価IDに基づいて既存データを取得
  // 仮のデータを設定
  const mockData = {
    factors: [
      { id: '1', name: '肉体因', score: 3, colorScheme: 'green' as const, status: 'completed' as const },
      { id: '2', name: '精神因', score: 2, colorScheme: 'blue' as const, status: 'in-progress' as const },
      { id: '3', name: '環境因', score: 4, colorScheme: 'orange' as const, status: 'pending' as const },
      { id: '4', name: '危険因', score: 1, colorScheme: 'red' as const, status: 'pending' as const },
      { id: '5', name: '作業時間因', score: 2, colorScheme: 'gray' as const, status: 'pending' as const }
    ],
    photos: [
      'https://placehold.co/200x150/e5e7eb/4b5563?text=Photo1',
      'https://placehold.co/200x150/e5e7eb/4b5563?text=Photo2'
    ]
  }
  
  return (
    <AspectContainer includeBackground={true}>
      <EvaluationMain
        evaluationNo={`EV-${evaluationId}`}
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
          workName: '編集中の作業',
          factoryName: '〇〇工場',
          processName: '△△工程'
        }}
        factors={mockData.factors}
        photos={mockData.photos}
      />
    </AspectContainer>
  )
}