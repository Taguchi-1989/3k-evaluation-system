/**
 * パフォーマンス測定・最適化ユーティリティ
 * TDD Green Phase実装 - レンダリング最適化とパフォーマンス監視
 */

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * パフォーマンス測定結果の型定義
 */
export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  memoryUsage?: number;
  props?: Record<string, unknown>;
}

/**
 * Web Vitals測定結果の型定義
 */
export interface WebVitalsMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * パフォーマンス測定クラス
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private webVitals: WebVitalsMetrics = {};

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * コンポーネントのレンダリング時間を測定
   */
  measureRenderTime(componentName: string, startTime: number, props?: Record<string, unknown>): PerformanceMetrics {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
      props: props ? this.serializeProps(props) : undefined,
      memoryUsage: this.getMemoryUsage()
    };

    this.metrics.push(metric);

    // 開発環境でのログ出力
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`⚠️ Slow render detected: ${componentName} (${renderTime.toFixed(2)}ms)`);
    }

    return metric;
  }

  /**
   * Web Vitalsの測定
   */
  measureWebVitals(): Promise<WebVitalsMetrics> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({});
        return;
      }

      const metrics: WebVitalsMetrics = {};

      // Performance Observer for paint metrics
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            switch (entry.name) {
              case 'first-contentful-paint':
                metrics.fcp = entry.startTime;
                break;
              case 'largest-contentful-paint':
                metrics.lcp = entry.startTime;
                break;
            }
          });
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // TTFB測定
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        }

        // タイムアウト後に結果を返す
        setTimeout(() => {
          observer.disconnect();
          this.webVitals = { ...this.webVitals, ...metrics };
          resolve(metrics);
        }, 3000);
      } else {
        resolve(metrics);
      }
    });
  }

  /**
   * メモリ使用量の取得
   */
  private getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const perfWithMemory = performance as { memory?: { usedJSHeapSize: number } }
      return perfWithMemory.memory ? perfWithMemory.memory.usedJSHeapSize / (1024 * 1024) : undefined; // MB
    }
    return undefined;
  }

  /**
   * プロパティのシリアライズ（循環参照対策）
   */
  private serializeProps(props: Record<string, unknown>): Record<string, unknown> {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(props, (_key, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    })) as Record<string, unknown>;
  }

  /**
   * 測定結果の取得
   */
  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  /**
   * Web Vitals結果の取得
   */
  getWebVitals(): WebVitalsMetrics {
    return this.webVitals;
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    totalMeasurements: number;
    averageRenderTime: number;
    maxRenderTime: number;
    slowComponents: PerformanceMetrics[];
  } {
    const renderTimes = this.metrics.map(m => m.renderTime);
    return {
      totalMeasurements: this.metrics.length,
      averageRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length || 0,
      maxRenderTime: Math.max(...renderTimes) || 0,
      slowComponents: this.metrics
        .filter(m => m.renderTime > 16)
        .sort((a, b) => b.renderTime - a.renderTime)
        .slice(0, 10)
    };
  }

  /**
   * 測定データのクリア
   */
  clear(): void {
    this.metrics = [];
    this.webVitals = {};
  }
}

/**
 * コンポーネントのレンダリング時間を測定するフック
 */
export const useRenderTime = (componentName: string, props?: Record<string, unknown>): void => {
  const startTimeRef = useRef<number | undefined>(undefined);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  useEffect(() => {
    if (startTimeRef.current) {
      monitor.measureRenderTime(componentName, startTimeRef.current, props);
    }
  });
};

/**
 * 不要な再レンダリングを防ぐためのメモ化フック
 */
export const useStableMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  const lastDepsRef = useRef<React.DependencyList | undefined>(undefined);
  const lastResultRef = useRef<T | undefined>(undefined);

  // deps/factoryは手動で変更検知を行うため、依存配列から意図的に除外
  return useMemo(() => {
    const depsChanged = !lastDepsRef.current ||
      deps.length !== lastDepsRef.current.length ||
      deps.some((dep, index) => dep !== lastDepsRef.current![index]);

    if (depsChanged) {
      lastDepsRef.current = deps;
      lastResultRef.current = factory();
    }

    return lastResultRef.current!;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * 不要な再レンダリングを防ぐためのコールバックフック
 */
export const useStableCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef<T>(callback);

  // callbackRefの更新タイミングをdepsで制御（callbackは依存配列に含めない）
  useEffect(() => {
    callbackRef.current = callback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // 安定した参照を保つため空の依存配列（callbackRefを介して常に最新のcallbackを参照）
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) as T;
};

/**
 * デバウンス処理付きの値管理フック
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Web Vitals測定フック
 */
export const useWebVitals = (): WebVitalsMetrics => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    void monitor.measureWebVitals().then(setMetrics);
  }, [monitor]);

  return metrics;
};

/**
 * パフォーマンス統計フック
 */
export const usePerformanceStats = (): ReturnType<PerformanceMonitor['getStats']> => {
  const [stats, setStats] = useState(PerformanceMonitor.getInstance().getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(PerformanceMonitor.getInstance().getStats());
    }, 5000); // 5秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return stats;
};

/**
 * 高階コンポーネント: パフォーマンス測定付きコンポーネント
 */
export function withPerformanceMonitoring<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = React.memo((props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    useRenderTime(name, props);

    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * パフォーマンスレポート生成
 */
export const generatePerformanceReport = (): string => {
  const monitor = PerformanceMonitor.getInstance();
  const stats = monitor.getStats();
  const webVitals = monitor.getWebVitals();

  return `
パフォーマンスレポート
========================

Web Vitals:
- FCP: ${webVitals.fcp?.toFixed(2) || 'N/A'}ms
- LCP: ${webVitals.lcp?.toFixed(2) || 'N/A'}ms
- TTFB: ${webVitals.ttfb?.toFixed(2) || 'N/A'}ms

レンダリング統計:
- 総測定回数: ${stats.totalMeasurements}
- 平均レンダリング時間: ${stats.averageRenderTime.toFixed(2)}ms
- 最大レンダリング時間: ${stats.maxRenderTime.toFixed(2)}ms

遅いコンポーネント (>16ms):
${stats.slowComponents.map(c =>
  `- ${c.componentName}: ${c.renderTime.toFixed(2)}ms`
).join('\n')}
`;
};

export default PerformanceMonitor;