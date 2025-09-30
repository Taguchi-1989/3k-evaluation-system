'use client'

/**
 * インタラクティブボタンコンポーネント
 * TDD Green Phase実装 - ボタンフィードバック問題の解決
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /**
   * ロード状態
   */
  loading?: boolean;
  /**
   * リップル効果の有効/無効
   */
  enableRipple?: boolean;
  /**
   * タッチフィードバックの強度
   * - 'subtle': 軽微な効果
   * - 'normal': 標準的な効果（デフォルト）
   * - 'strong': 強い効果
   */
  feedbackIntensity?: 'subtle' | 'normal' | 'strong';
  /**
   * アクセシビリティ属性
   */
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * インタラクティブボタンコンポーネント
 *
 * TDD分析結果に基づく改善:
 * - ホバー・フォーカス・アクティブ状態の明確な視覚的フィードバック
 * - 150ms以内の高速反応性
 * - リップル効果による現代的なインタラクション
 * - アクセシビリティ完全対応
 * - モバイルタッチ操作最適化
 */
export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  onKeyDown,
  disabled = false,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  enableRipple = true,
  feedbackIntensity = 'normal',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'button',
  type = 'button',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdCounter = useRef(0);

  // バリアントスタイル
  const variantStyles = {
    primary: [
      // ベーススタイル
      'bg-blue-600 text-white border-blue-600',
      // ホバー状態 - TDD要件: 明確な視覚変化
      'hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg',
      'hover:shadow-blue-500/25',
      // フォーカス状態 - TDD要件: アクセシビリティ対応
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'focus:bg-blue-700',
      // アクティブ状態 - TDD要件: クリック反応
      'active:bg-blue-800 active:transform active:scale-[0.98]',
      // 無効状態
      'disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500',
      'disabled:cursor-not-allowed disabled:shadow-none'
    ],
    secondary: [
      'bg-gray-100 text-gray-900 border-gray-300',
      'hover:bg-gray-200 hover:border-gray-400 hover:shadow-md',
      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      'focus:bg-gray-200',
      'active:bg-gray-300 active:transform active:scale-[0.98]',
      'disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400'
    ],
    danger: [
      'bg-red-600 text-white border-red-600',
      'hover:bg-red-700 hover:border-red-700 hover:shadow-lg',
      'hover:shadow-red-500/25',
      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
      'focus:bg-red-700',
      'active:bg-red-800 active:transform active:scale-[0.98]',
      'disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500'
    ],
    ghost: [
      'bg-transparent text-gray-700 border-transparent',
      'hover:bg-gray-100 hover:text-gray-900',
      'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      'focus:bg-gray-100',
      'active:bg-gray-200 active:transform active:scale-[0.98]',
      'disabled:text-gray-400'
    ]
  };

  // サイズスタイル
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm h-8 min-w-[2rem]',
    md: 'px-4 py-2 text-base h-10 min-w-[2.5rem]',
    lg: 'px-6 py-3 text-lg h-12 min-w-[3rem]'
  };

  // フィードバック強度スタイル
  const intensityStyles = {
    subtle: 'transition-all duration-100 ease-out',
    normal: 'transition-all duration-150 ease-out',
    strong: 'transition-all duration-200 ease-out'
  };

  // リップル効果の実装
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!enableRipple || disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rippleId = rippleIdCounter.current++;
    setRipples(prev => [...prev, { id: rippleId, x, y }]);

    // リップル削除タイマー
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 600);
  };

  // クリックハンドラー - TDD要件: 150ms以内反応
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // 即座に視覚的フィードバック
    setIsPressed(true);
    createRipple(event);

    // 短時間後にプレス状態解除
    setTimeout(() => setIsPressed(false), 100);

    // オリジナルのクリックハンドラー実行
    onClick?.(event);
  };

  // キーボードハンドラー - TDD要件: アクセシビリティ
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(true);

      // 合成マウスイベント作成してリップル効果
      if (enableRipple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const syntheticEvent = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        } as React.MouseEvent<HTMLButtonElement>;
        createRipple(syntheticEvent);
      }

      setTimeout(() => setIsPressed(false), 100);
    }

    onKeyDown?.(event);
  };

  // マウス/タッチイベント
  const handleMouseDown = () => !disabled && !loading && setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  // 基本スタイル
  const baseStyles = [
    // レイアウト
    'relative overflow-hidden inline-flex items-center justify-center',
    'font-medium rounded-md border',
    // インタラクション基盤 - TDD要件: カーソル、選択無効
    'cursor-pointer select-none touch-manipulation',
    // トランジション - TDD要件: スムーズな反応
    intensityStyles[feedbackIntensity],
    // プレス状態のスケール
    isPressed && !disabled ? 'transform scale-[0.96]' : '',
    // ロード状態
    loading ? 'cursor-wait' : '',
    // 無効状態
    disabled ? 'cursor-not-allowed' : ''
  ];

  const buttonClasses = cn(
    ...baseStyles,
    ...(variantStyles[variant] || []),
    sizeStyles[size],
    className
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      role={role}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={isPressed}
      aria-busy={loading}
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      {...props}
    >
      {/* ロードスピナー */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
        </div>
      )}

      {/* コンテンツ */}
      <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {children}
      </div>

      {/* リップル効果 */}
      {enableRipple && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span
            className={cn(
              'block w-0 h-0 rounded-full bg-current opacity-25',
              'animate-ping'
            )}
            style={{
              animation: 'ripple 0.6s ease-out forwards'
            }}
          />
        </span>
      ))}

      {/* リップルアニメーション定義 */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 0.5;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

/**
 * 事前定義されたボタンバリアント
 */
export const PrimaryButton: React.FC<Omit<InteractiveButtonProps, 'variant'>> = (props) => (
  <InteractiveButton variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<InteractiveButtonProps, 'variant'>> = (props) => (
  <InteractiveButton variant="secondary" {...props} />
);

export const DangerButton: React.FC<Omit<InteractiveButtonProps, 'variant'>> = (props) => (
  <InteractiveButton variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<InteractiveButtonProps, 'variant'>> = (props) => (
  <InteractiveButton variant="ghost" {...props} />
);

export default InteractiveButton;