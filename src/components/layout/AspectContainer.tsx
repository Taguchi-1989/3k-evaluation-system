/**
 * 16:9アスペクト比コンテナコンポーネント
 * TDD Green Phase実装
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AspectContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * アスペクト比の維持方法
   * - 'strict': 厳密な16:9維持（デフォルト）
   * - 'responsive': レスポンシブ対応で最小高さ確保
   * - 'content': コンテンツに応じて高さ調整
   */
  mode?: 'strict' | 'responsive' | 'content';
  /**
   * 最大幅の設定
   */
  maxWidth?: '7xl' | '6xl' | '5xl' | '4xl' | 'none';
}

/**
 * 16:9比率を維持するコンテナコンポーネント
 *
 * TDD分析結果:
 * - 成功例: `/dashboard`, `/evaluation/mental`, `/evaluation/hazard`
 * - 使用CSS: aspect-ratio: 16 / 9, display: flex, flex-direction: column
 * - 課題: 縦長コンテンツへの対応
 */
export const AspectContainer: React.FC<AspectContainerProps> = ({
  children,
  className,
  mode = 'strict',
  maxWidth = '7xl'
}) => {
  const baseClasses = [
    'aspect-container',
    'w-full',
    'mx-auto',
    'flex',
    'flex-col'
  ];

  // 最大幅の設定
  const maxWidthClasses = {
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl',
    'none': ''
  };

  // モード別のクラス設定
  const modeClasses = {
    strict: [
      'aspect-[16/9]', // Tailwind CSS aspect-ratio
      'overflow-hidden'
    ],
    responsive: [
      'aspect-[16/9]',
      'min-h-[400px]', // 最小高さ確保
      'overflow-y-auto',
      'overflow-x-hidden'
    ],
    content: [
      'min-h-[400px]',
      'overflow-y-auto',
      'overflow-x-hidden'
    ]
  };

  const containerClasses = cn(
    ...baseClasses,
    maxWidthClasses[maxWidth],
    ...modeClasses[mode],
    className
  );

  return (
    <div
      className={containerClasses}
      data-testid="aspect-container"
      style={{
        // CSS aspect-ratioのフォールバック
        aspectRatio: mode === 'content' ? undefined : '16 / 9'
      }}
    >
      {children}
    </div>
  );
};

/**
 * 16:9コンテナのレスポンシブバリアント
 * モバイル・タブレット向け
 */
export const ResponsiveAspectContainer: React.FC<AspectContainerProps> = (props) => {
  return (
    <AspectContainer
      {...props}
      mode="responsive"
      className={cn(
        // レスポンシブ調整
        'sm:aspect-[16/9]',
        'md:aspect-[16/9]',
        'lg:aspect-[16/9]',
        // モバイルでは縦長許可
        'aspect-auto',
        'min-h-screen',
        'sm:min-h-[400px]',
        props.className
      )}
    />
  );
};

/**
 * コンテンツ重視型コンテナ
 * 縦長コンテンツがある場合用
 */
export const ContentAspectContainer: React.FC<AspectContainerProps> = (props) => {
  return (
    <AspectContainer
      {...props}
      mode="content"
      className={cn(
        // コンテンツに応じた高さ
        'min-h-[400px]',
        'max-h-[80vh]',
        'overflow-y-auto',
        props.className
      )}
    />
  );
};

/**
 * デバッグ用ヘルパー - 開発時のアスペクト比確認
 */
export const DebugAspectContainer: React.FC<AspectContainerProps & { showDebug?: boolean }> = ({
  showDebug = false,
  ...props
}) => {
  return (
    <AspectContainer
      {...props}
      className={cn(
        showDebug && [
          'border-2',
          'border-red-500',
          'border-dashed',
          'relative'
        ],
        props.className
      )}
    >
      {showDebug && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-50">
          16:9 Debug
        </div>
      )}
      {props.children}
    </AspectContainer>
  );
};

export default AspectContainer;