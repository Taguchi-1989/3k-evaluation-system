'use client'

import { useEvaluationNavigation } from '@/hooks/useBackButton'
import { Button } from '@/components/ui/Button'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  customText?: string
}

export function BackButton({
  className = '',
  variant = 'outline',
  size = 'md',
  showText = true,
  customText
}: BackButtonProps) {
  const { goBack } = useEvaluationNavigation()

  return (
    <Button
      onClick={goBack}
      variant={variant as any}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {showText && (
        <span>{customText || '戻る'}</span>
      )}
    </Button>
  )
}

// ナビゲーションボタンセット
export function NavigationButtons({ className = '' }: { className?: string }) {
  const { goBack, goToDashboard, goToHome } = useEvaluationNavigation()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        onClick={goBack}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        戻る
      </Button>

      <Button
        onClick={goToDashboard}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4" />
        </svg>
        ダッシュボード
      </Button>

      <Button
        onClick={goToHome}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0h4m0 0h3a1 1 0 001-1V10M9 21h6" />
        </svg>
        ホーム
      </Button>
    </div>
  )
}