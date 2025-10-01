'use client'

/**
 * 動的インポート最適化コンポーネント
 * Code Splitting実装によるパフォーマンス向上
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { EvaluationSkeleton, DashboardSkeleton, CompactSkeleton } from '@/components/ui/LoadingSkeletons'

// Loading コンポーネント
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <span className="ml-3 text-gray-600">読み込み中...</span>
  </div>
)

// 評価ページコンポーネントの動的インポート
export const PhysicalFactorDetailDynamic = dynamic(
  () => import('@/components/evaluation/PhysicalFactorDetail').then(mod => ({ default: mod.PhysicalFactorDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false, // パフォーマンス優先でSSR無効化
  }
)

export const MentalFactorDetailDynamic = dynamic(
  () => import('@/components/evaluation/MentalFactorDetail').then(mod => ({ default: mod.MentalFactorDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false, // 重いコンポーネントはSSR無効化
  }
)

export const EnvironmentalFactorDetailDynamic = dynamic(
  () => import('@/components/evaluation/EnvironmentalFactorDetail').then(mod => ({ default: mod.EnvironmentalFactorDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false,
  }
)

export const HazardFactorDetailDynamic = dynamic(
  () => import('@/components/evaluation/HazardFactorDetail').then(mod => ({ default: mod.HazardFactorDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false,
  }
)

export const WorkTimeDetailDynamic = dynamic(
  () => import('@/components/evaluation/WorkTimeDetail').then(mod => ({ default: mod.WorkTimeDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false,
  }
)

// Enhanced version dynamic imports
export const EnhancedWorkTimeDetailDynamic = dynamic(
  () => import('@/components/evaluation/EnhancedWorkTimeDetail').then(mod => ({ default: mod.EnhancedWorkTimeDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false,
  }
)

export const EnhancedEnvironmentalFactorDetailDynamic = dynamic(
  () => import('@/components/evaluation/EnhancedEnvironmentalFactorDetail').then(mod => ({ default: mod.EnhancedEnvironmentalFactorDetail })),
  {
    loading: () => <EvaluationSkeleton />,
    ssr: false,
  }
)

// ダッシュボードコンポーネントの動的インポート
export const DashboardStatsDynamic = dynamic(
  () => import('@/components/dashboard/DashboardStats').then(mod => ({ default: mod.DashboardStats })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
)

export const EnhancedDashboardDynamic = dynamic(
  () => import('@/components/dashboard/EnhancedDashboard').then(mod => ({ default: mod.EnhancedDashboard })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
)

export const DashboardChartsDynamic = dynamic(
  () => import('@/components/dashboard/DashboardCharts').then(mod => ({ default: mod.DashboardCharts })),
  {
    loading: () => <CompactSkeleton />,
    ssr: false,
  }
)

// 評価リストビューの動的インポート
export const EvaluationListViewDynamic = dynamic(
  () => import('@/components/evaluation/EvaluationListView').then(mod => ({ default: mod.EvaluationListView })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// AI機能コンポーネントの動的インポート（特に重い）
export const AIComprehensiveAssistantDynamic = dynamic(
  () => import('@/components/ui/AIComprehensiveAssistant').then(mod => ({ default: mod.AIComprehensiveAssistant })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// モーダル系コンポーネントの動的インポート
// export const SettingsModalDynamic = dynamic(
//   () => import('@/components/ui/SettingsModal'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

export const PhotoViewerDynamic = dynamic(
  () => import('@/components/evaluation/PhotoViewer').then(mod => ({ default: mod.PhotoViewer })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Suspense wrapper for better error boundaries
export const DynamicComponentWrapper = ({
  children
}: {
  children: React.ReactNode
}) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
)

/**
 * 条件付き動的インポート
 * 必要な時だけコンポーネントを読み込む
 */
// export const ConditionalDynamicImport = dynamic(
//   () => import('@/components/ui/ConditionalRenderer'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

/**
 * 事前読み込み（Prefetch）対応の動的インポート
 */
export const prefetchEvaluationComponents = () => {
  // ユーザーがホームページを訪れた時に、評価ページを事前読み込み
  import('@/components/evaluation/PhysicalFactorDetail')
  import('@/components/evaluation/HazardFactorDetail')
  import('@/components/evaluation/EnvironmentalFactorDetail')
}

// ルート別の最適化
export const routeBasedDynamicImports = {
  '/evaluation/physical': PhysicalFactorDetailDynamic,
  '/evaluation/mental': MentalFactorDetailDynamic,
  '/evaluation/environmental': EnvironmentalFactorDetailDynamic,
  '/evaluation/hazard': HazardFactorDetailDynamic,
  '/evaluation/worktime': WorkTimeDetailDynamic,
  '/dashboard': DashboardStatsDynamic,
  '/evaluation/list': EvaluationListViewDynamic,
}

export default {
  PhysicalFactorDetailDynamic,
  MentalFactorDetailDynamic,
  EnvironmentalFactorDetailDynamic,
  HazardFactorDetailDynamic,
  WorkTimeDetailDynamic,
  DashboardStatsDynamic,
  EvaluationListViewDynamic,
  AIComprehensiveAssistantDynamic,
  // SettingsModalDynamic,
  PhotoViewerDynamic,
  DynamicComponentWrapper,
  // ConditionalDynamicImport,
  prefetchEvaluationComponents,
  routeBasedDynamicImports,
}