'use client'

/**
 * 最適化画像コンポーネント
 * TDD Green Phase実装 - 画像パフォーマンス問題の解決
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /**
   * 画像の優先度
   * - 'high': 重要な画像（LCPに影響する可能性）
   * - 'normal': 通常の画像（デフォルト）
   * - 'low': 低優先度の画像
   */
  priority?: 'high' | 'normal' | 'low';
  /**
   * 遅延読み込み設定
   */
  loading?: 'lazy' | 'eager';
  /**
   * レスポンシブ対応のサイズ設定
   */
  sizes?: string;
  /**
   * 品質設定（1-100）
   */
  quality?: number;
  /**
   * フォールバック画像
   */
  fallback?: string;
  /**
   * 読み込み完了コールバック
   */
  onLoad?: () => void;
  /**
   * エラーコールバック
   */
  onError?: () => void;
  /**
   * コンテナのアスペクト比
   */
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  /**
   * ブラー効果付きプレースホルダー
   */
  enableBlurPlaceholder?: boolean;
}

/**
 * 最適化画像コンポーネント
 *
 * TDD分析結果に基づく改善:
 * - Next.js Image component活用による自動WebP/AVIF変換
 * - 適切な遅延読み込み設定
 * - レスポンシブ対応のsizes属性
 * - 品質最適化とファイルサイズ削減
 * - Core Web Vitals向上（LCP改善）
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = 'normal',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  fallback = '/images/placeholder.jpg',
  onLoad,
  onError,
  aspectRatio = 'auto',
  enableBlurPlaceholder = true,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || priority === 'high') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px手前から読み込み開始
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [loading, priority]);

  // アスペクト比のスタイル
  const aspectRatioStyles = {
    '16/9': 'aspect-[16/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    'auto': ''
  };

  // 画像読み込み処理
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // エラー処理
  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // プレースホルダー生成
  const generateBlurDataURL = (w: number, h: number) => {
    // SSRセーフ: サーバーサイドではデフォルトのプレースホルダーを返す
    if (typeof document === 'undefined') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2IiAvPjwvc3ZnPg==';
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'; // gray-100
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  // 画像サイズの決定
  const imageWidth = width || 800;
  const imageHeight = height || 600;

  // Next.js Image props
  const imageProps = {
    src: imageError ? fallback : src,
    alt,
    width: imageWidth,
    height: imageHeight,
    priority: priority === 'high',
    loading: loading as 'lazy' | 'eager',
    sizes,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      'object-cover w-full h-full'
    ),
    ...(enableBlurPlaceholder && typeof document !== 'undefined' && {
      placeholder: 'blur' as const,
      blurDataURL: generateBlurDataURL(20, 20)
    })
  };

  const containerClasses = cn(
    'relative overflow-hidden bg-gray-100',
    aspectRatioStyles[aspectRatio],
    className
  );

  return (
    <div
      ref={imageRef}
      className={containerClasses}
      {...props}
    >
      {/* 読み込み状態インジケーター */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* メイン画像 */}
      {isInView && (
        <Image
          {...imageProps}
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          fill={!width || !height}
        />
      )}

      {/* エラー状態の表示 */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">画像を読み込めませんでした</span>
        </div>
      )}

      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {imageWidth}x{imageHeight} | Q{quality}
        </div>
      )}
    </div>
  );
};

/**
 * 事前定義された最適化画像バリアント
 */

// ヒーロー画像用（LCP対策）
export const HeroOptimizedImage: React.FC<Omit<OptimizedImageProps, 'priority' | 'loading'>> = (props) => (
  <OptimizedImage
    priority="high"
    loading="eager"
    quality={90}
    {...props}
  />
);

// サムネイル画像用
export const ThumbnailOptimizedImage: React.FC<Omit<OptimizedImageProps, 'priority' | 'sizes'>> = (props) => (
  <OptimizedImage
    priority="low"
    sizes="(max-width: 768px) 150px, 200px"
    quality={75}
    aspectRatio="1/1"
    {...props}
  />
);

// ギャラリー画像用
export const GalleryOptimizedImage: React.FC<Omit<OptimizedImageProps, 'sizes'>> = (props) => (
  <OptimizedImage
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    quality={80}
    aspectRatio="4/3"
    {...props}
  />
);

// バナー画像用
export const BannerOptimizedImage: React.FC<Omit<OptimizedImageProps, 'aspectRatio'>> = (props) => (
  <OptimizedImage
    aspectRatio="16/9"
    priority="high"
    quality={85}
    {...props}
  />
);

export default OptimizedImage;