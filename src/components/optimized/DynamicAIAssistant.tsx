'use client'

/**
 * 動的インポート版AIアシスタント
 * TDD Green Phase実装 - バンドルサイズ最適化とコード分割
 */

import React, { Suspense } from 'react';
import { LazyLoadWrapper, useDynamicImport } from '@/components/optimized/LazyLoadWrapper';
import { AIAnalysisResult } from '@/lib/aiAssistant';

interface DynamicAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendations?: (result: AIAnalysisResult) => void;
  workInfo?: {
    workName: string;
    factoryName: string;
    processName: string;
  };
}

/**
 * 動的読み込み版AIアシスタント
 *
 * TDD分析結果に基づく改善:
 * - 重いAIコンポーネントの遅延読み込み
 * - 初期バンドルサイズの削減
 * - 必要な時だけ読み込み
 */
export const DynamicAIAssistant: React.FC<DynamicAIAssistantProps> = (props) => {
  const { component: AIAssistant, loading, error } = useDynamicImport(
    () => import('@/components/ui/AIComprehensiveAssistant').then(mod => ({ default: mod.AIComprehensiveAssistant })),
    [props.isOpen] // isOpenが変更された時に読み込み
  );

  if (!props.isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AIアシスタントを読み込み中...</h3>
            <p className="text-gray-600 text-sm">
              高度なAI機能を準備しています。しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-700">読み込みエラー</h3>
            <p className="text-gray-600 text-sm mb-4">
              AIアシスタントの読み込みに失敗しました。
            </p>
            <button
              onClick={props.onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!AIAssistant) return null;

  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AIAssistant {...props} />
    </Suspense>
  );
};

/**
 * 軽量版AIアシスタント起動ボタン
 */
export const AIAssistantLauncher: React.FC<{
  onLaunch: () => void;
  className?: string;
}> = ({ onLaunch, className = '' }) => {
  return (
    <LazyLoadWrapper
      rootMargin="100px"
      threshold={0.1}
      fallback={<div className="h-12 bg-gray-100 rounded animate-pulse" />}
    >
      <button
        onClick={onLaunch}
        className={`
          flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-blue-600 to-purple-600
          text-white rounded-lg shadow-lg
          hover:from-blue-700 hover:to-purple-700
          transform hover:scale-105 transition-all duration-200
          ${className}
        `}
      >
        <span className="text-lg">🧠</span>
        <span className="font-medium">AI自動選択</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </button>
    </LazyLoadWrapper>
  );
};

export default DynamicAIAssistant;