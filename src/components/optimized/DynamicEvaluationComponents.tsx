'use client'

/**
 * 動的インポート版評価コンポーネント
 * TDD Green Phase実装 - 重いコンポーネントの遅延読み込み
 */

import React, { Suspense, lazy } from 'react';
import { LazyLoadWrapper } from '@/components/optimized/LazyLoadWrapper';
import type { PhysicalFactorDetailProps } from '@/components/evaluation/PhysicalFactorDetail';

/**
 * 動的インポートでコンポーネントを遅延読み込み
 */
const DynamicEnhancedWorkTimeDetail = lazy(() =>
  import('@/components/evaluation/EnhancedWorkTimeDetail').then(mod => ({
    default: mod.EnhancedWorkTimeDetail
  }))
);

const DynamicPhysicalFactorDetail = lazy(() =>
  import('@/components/evaluation/PhysicalFactorDetail')
);

const DynamicMentalFactorDetail = lazy(() =>
  import('@/components/evaluation/MentalFactorDetail').then(mod => ({ default: mod.MentalFactorDetail }))
);

const DynamicEnvironmentalFactorDetail = lazy(() =>
  import('@/components/evaluation/EnvironmentalFactorDetail').then(mod => ({ default: mod.EnvironmentalFactorDetail }))
);

const DynamicHazardFactorDetail = lazy(() =>
  import('@/components/evaluation/HazardFactorDetail').then(mod => ({ default: mod.HazardFactorDetail }))
);

/**
 * 共通の読み込み中コンポーネント
 */
const EvaluationLoadingFallback: React.FC<{ componentName: string }> = ({ componentName }) => (
  <div className="min-h-[400px] bg-white rounded-lg shadow-lg p-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-16 bg-gray-100 rounded" />
        <div className="h-12 bg-gray-100 rounded" />
      </div>
    </div>
    <div className="text-center mt-6">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <p className="text-sm text-gray-600">{componentName}を読み込み中...</p>
    </div>
  </div>
);

/**
 * エラー時のフォールバックコンポーネント
 */
const EvaluationErrorFallback: React.FC<{
  componentName: string;
  onRetry?: () => void;
}> = ({ componentName, onRetry }) => (
  <div className="min-h-[400px] bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-700 mb-2">読み込みエラー</h3>
    <p className="text-gray-600 text-center mb-4">
      {componentName}の読み込みに失敗しました。<br />
      ネットワーク接続を確認してから再試行してください。
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        再試行
      </button>
    )}
  </div>
);

/**
 * 作業時間詳細の動的コンポーネント
 */
export const DynamicWorkTimeDetail: React.FC<Record<string, unknown>> = (props) => (
  <LazyLoadWrapper
    rootMargin="200px"
    threshold={0.25}
    fallback={<EvaluationLoadingFallback componentName="作業時間詳細" />}
  >
    <Suspense fallback={<EvaluationLoadingFallback componentName="作業時間詳細" />}>
      <DynamicEnhancedWorkTimeDetail {...props} />
    </Suspense>
  </LazyLoadWrapper>
);

/**
 * 肉体因子詳細の動的コンポーネント
 */
export const DynamicPhysicalDetail: React.FC<PhysicalFactorDetailProps> = (props) => (
  <LazyLoadWrapper
    rootMargin="150px"
    threshold={0.3}
    fallback={<EvaluationLoadingFallback componentName="肉体因子詳細" />}
  >
    <Suspense fallback={<EvaluationLoadingFallback componentName="肉体因子詳細" />}>
      <DynamicPhysicalFactorDetail {...props} />
    </Suspense>
  </LazyLoadWrapper>
);

/**
 * 精神因子詳細の動的コンポーネント
 */
export const DynamicMentalDetail: React.FC<Record<string, unknown>> = (props) => (
  <LazyLoadWrapper
    rootMargin="150px"
    threshold={0.3}
    fallback={<EvaluationLoadingFallback componentName="精神因子詳細" />}
  >
    <Suspense fallback={<EvaluationLoadingFallback componentName="精神因子詳細" />}>
      <DynamicMentalFactorDetail {...props} />
    </Suspense>
  </LazyLoadWrapper>
);

/**
 * 環境因子詳細の動的コンポーネント
 */
export const DynamicEnvironmentalDetail: React.FC<Record<string, unknown>> = (props) => (
  <LazyLoadWrapper
    rootMargin="150px"
    threshold={0.3}
    fallback={<EvaluationLoadingFallback componentName="環境因子詳細" />}
  >
    <Suspense fallback={<EvaluationLoadingFallback componentName="環境因子詳細" />}>
      <DynamicEnvironmentalFactorDetail {...props} />
    </Suspense>
  </LazyLoadWrapper>
);

/**
 * 危険因子詳細の動的コンポーネント
 */
export const DynamicHazardDetail: React.FC<Record<string, unknown>> = (props) => (
  <LazyLoadWrapper
    rootMargin="150px"
    threshold={0.3}
    fallback={<EvaluationLoadingFallback componentName="危険因子詳細" />}
  >
    <Suspense fallback={<EvaluationLoadingFallback componentName="危険因子詳細" />}>
      <DynamicHazardFactorDetail {...props} />
    </Suspense>
  </LazyLoadWrapper>
);

/**
 * 統合評価ページ用の動的ルーター
 */
export const DynamicEvaluationRouter: React.FC<{
  evaluationType: 'physical' | 'mental' | 'environmental' | 'hazard' | 'worktime';
} & Record<string, unknown>> = ({ evaluationType, ...props }) => {
  switch (evaluationType) {
    case 'physical':
      return <DynamicPhysicalDetail {...props} />;
    case 'mental':
      return <DynamicMentalDetail {...props} />;
    case 'environmental':
      return <DynamicEnvironmentalDetail {...props} />;
    case 'hazard':
      return <DynamicHazardDetail {...props} />;
    case 'worktime':
      return <DynamicWorkTimeDetail {...props} />;
    default:
      return <EvaluationErrorFallback componentName="評価コンポーネント" />;
  }
};

const DynamicEvaluationComponents = {
  DynamicWorkTimeDetail,
  DynamicPhysicalDetail,
  DynamicMentalDetail,
  DynamicEnvironmentalDetail,
  DynamicHazardDetail,
  DynamicEvaluationRouter
};

export default DynamicEvaluationComponents;