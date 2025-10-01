'use client'

/**
 * パフォーマンス監視プロバイダー
 * TDD Green Phase実装 - アプリ全体のパフォーマンス測定
 */

import React, { useEffect, createContext, useContext, useState } from 'react';
import type { PerformanceMetrics, WebVitalsMetrics } from '@/lib/performance';
import { PerformanceMonitor } from '@/lib/performance';

interface PerformanceContextType {
  monitor: PerformanceMonitor;
  metrics: PerformanceMetrics[];
  webVitals: WebVitalsMetrics;
  stats: {
    totalMeasurements: number;
    averageRenderTime: number;
    maxRenderTime: number;
    slowComponents: PerformanceMetrics[];
  };
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableLogging?: boolean;
  reportingInterval?: number;
}

/**
 * パフォーマンス監視プロバイダー
 *
 * TDD分析結果に基づく改善:
 * - アプリ全体のパフォーマンス測定
 * - Web Vitals自動監視
 * - 遅いコンポーネントの自動検出
 * - 開発環境でのパフォーマンスレポート
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableLogging = process.env.NODE_ENV === 'development',
  reportingInterval = 30000 // 30秒
}) => {
  const [monitor] = useState(() => PerformanceMonitor.getInstance());
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics>({});
  const [stats, setStats] = useState(monitor.getStats());

  useEffect(() => {
    // Web Vitals測定開始
    void monitor.measureWebVitals().then(setWebVitals);

    // 定期的な統計更新
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
      setStats(monitor.getStats());

      if (enableLogging) {
        const currentStats = monitor.getStats();
        if (currentStats.slowComponents.length > 0) {
           
          console.group('🐌 Performance Report');
           
          console.log('Average render time:', currentStats.averageRenderTime.toFixed(2) + 'ms');
           
          console.log('Slow components:', currentStats.slowComponents.length);
           
          console.table(currentStats.slowComponents.slice(0, 5));
           
          console.groupEnd();
        }
      }
    }, reportingInterval);

    return () => clearInterval(interval);
  }, [monitor, enableLogging, reportingInterval]);

  // ページ離脱時の最終レポート
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enableLogging) {
        const finalStats = monitor.getStats();
        const finalWebVitals = monitor.getWebVitals();

         
        console.group('📊 Final Performance Report');
         
        console.log('Session summary:');
         
        console.log('- Total measurements:', finalStats.totalMeasurements);
         
        console.log('- Average render time:', finalStats.averageRenderTime.toFixed(2) + 'ms');
         
        console.log('- Max render time:', finalStats.maxRenderTime.toFixed(2) + 'ms');
         
        console.log('- Slow components:', finalStats.slowComponents.length);

        if (finalWebVitals.fcp) {
           
          console.log('Web Vitals:');
           
          console.log('- FCP:', finalWebVitals.fcp.toFixed(2) + 'ms');
           
          console.log('- LCP:', (finalWebVitals.lcp || 0).toFixed(2) + 'ms');
           
          console.log('- TTFB:', (finalWebVitals.ttfb || 0).toFixed(2) + 'ms');
        }
         
        console.groupEnd();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enableLogging, monitor]);

  const contextValue: PerformanceContextType = {
    monitor,
    metrics,
    webVitals,
    stats
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
      {/* 開発環境でのパフォーマンス表示 */}
      {enableLogging && process.env.NODE_ENV === 'development' && (
        <PerformanceIndicator />
      )}
    </PerformanceContext.Provider>
  );
};

/**
 * 開発環境用パフォーマンスインジケーター
 */
const PerformanceIndicator: React.FC = () => {
  const { stats, webVitals } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black bg-opacity-80 text-white p-2 rounded-full text-xs font-mono hover:bg-opacity-100 transition-all"
      >
        📊 {stats.totalMeasurements}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs font-mono min-w-[280px]">
          <div className="mb-2 font-bold">Performance Stats</div>
          <div>Measurements: {stats.totalMeasurements}</div>
          <div>Avg Render: {stats.averageRenderTime.toFixed(1)}ms</div>
          <div>Max Render: {stats.maxRenderTime.toFixed(1)}ms</div>
          <div>Slow Components: {stats.slowComponents.length}</div>

          {webVitals.fcp && (
            <>
              <div className="mt-2 font-bold">Web Vitals</div>
              <div>FCP: {webVitals.fcp.toFixed(0)}ms</div>
              {webVitals.lcp && <div>LCP: {webVitals.lcp.toFixed(0)}ms</div>}
              {webVitals.ttfb && <div>TTFB: {webVitals.ttfb.toFixed(0)}ms</div>}
            </>
          )}

          {stats.slowComponents.length > 0 && (
            <>
              <div className="mt-2 font-bold">Slowest:</div>
              {stats.slowComponents.slice(0, 3).map((component, index) => (
                <div key={index} className="text-red-400">
                  {component.componentName}: {component.renderTime.toFixed(1)}ms
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformanceProvider;