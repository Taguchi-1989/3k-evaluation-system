'use client'

/**
 * 遅延読み込みラッパーコンポーネント
 * TDD Green Phase実装 - コード分割とバンドルサイズ最適化
 */

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { cn } from '@/lib/utils';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  /**
   * 遅延読み込みのトリガー距離（px）
   */
  rootMargin?: string;
  /**
   * 表示領域に入る閾値（0-1）
   */
  threshold?: number;
  /**
   * 読み込み中の表示コンポーネント
   */
  fallback?: React.ReactNode;
  /**
   * エラー時の表示コンポーネント
   */
  errorFallback?: React.ReactNode;
  /**
   * 一度読み込んだら切断するか
   */
  once?: boolean;
  /**
   * 追加のクラス名
   */
  className?: string;
  /**
   * 読み込み完了コールバック
   */
  onLoad?: () => void;
  /**
   * 表示領域進入コールバック
   */
  onIntersect?: () => void;
}

/**
 * デフォルトの読み込み中コンポーネント
 */
const DefaultLoadingFallback: React.FC<{ message?: string }> = ({ message = '読み込み中...' }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-gray-50 rounded-lg">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-gray-600 text-sm">{message}</p>
  </div>
);

/**
 * デフォルトのエラー表示コンポーネント
 */
const DefaultErrorFallback: React.FC<{ retry?: () => void }> = ({ retry }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-red-50 rounded-lg border border-red-200">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p className="text-red-700 text-sm mb-4">コンポーネントの読み込みに失敗しました</p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        再試行
      </button>
    )}
  </div>
);

/**
 * 遅延読み込みラッパーコンポーネント
 *
 * TDD分析結果に基づく改善:
 * - Intersection Observerによる効率的な可視性検出
 * - 動的インポートと組み合わせてバンドルサイズ削減
 * - エラー処理とフォールバック機能
 * - パフォーマンス測定とコールバック
 */
export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  rootMargin = '50px',
  threshold = 0.1,
  fallback = <DefaultLoadingFallback />,
  errorFallback,
  once = true,
  className,
  onLoad,
  onIntersect,
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          onIntersect?.();

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsIntersecting(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, once, onIntersect]);

  // 読み込み完了処理
  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
      onLoad?.();
    }
  }, [isIntersecting, hasLoaded, onLoad]);

  // エラー処理
  const handleError = () => {
    setHasError(true);
  };

  // 再試行処理
  const handleRetry = () => {
    setHasError(false);
    setHasLoaded(false);
    setIsIntersecting(false);
  };

  return (
    <div
      ref={elementRef}
      className={cn('lazy-load-wrapper', className)}
      data-testid="lazy-load-wrapper"
    >
      {hasError ? (
        errorFallback || <DefaultErrorFallback retry={handleRetry} />
      ) : isIntersecting ? (
        <Suspense fallback={fallback}>
          <div onError={handleError}>
            {children}
          </div>
        </Suspense>
      ) : (
        <div className="min-h-[100px] bg-gray-50 rounded animate-pulse" />
      )}
    </div>
  );
};

/**
 * 動的インポート用のヘルパーフック
 */
export const useDynamicImport = <T,>(
  importFunction: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) => {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedModule = await importFunction();

        if (!cancelled) {
          setComponent(loadedModule.default);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('コンポーネントの読み込みに失敗しました'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { component, loading, error };
};

/**
 * 事前定義された遅延読み込みバリアント
 */

// 重い評価コンポーネント用
export const HeavyComponentWrapper: React.FC<{
  children: React.ReactNode;
  componentName?: string;
}> = ({ children, componentName = 'コンポーネント' }) => (
  <LazyLoadWrapper
    rootMargin="100px"
    threshold={0.25}
    fallback={<DefaultLoadingFallback message={`${componentName}を読み込み中...`} />}
    onLoad={() => {
      // Component loaded successfully
      if (process.env.NODE_ENV === 'development') {
         
        console.log(`${componentName} loaded`);
      }
    }}
  >
    {children}
  </LazyLoadWrapper>
);

// 画像ギャラリー用
export const GalleryWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <LazyLoadWrapper
    rootMargin="200px"
    threshold={0.1}
    once={false}
    fallback={<DefaultLoadingFallback message="ギャラリーを読み込み中..." />}
  >
    {children}
  </LazyLoadWrapper>
);

// チャート・グラフ用
export const ChartWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <LazyLoadWrapper
    rootMargin="150px"
    threshold={0.3}
    fallback={<DefaultLoadingFallback message="チャートを読み込み中..." />}
    className="min-h-[300px]"
  >
    {children}
  </LazyLoadWrapper>
);

export default LazyLoadWrapper;